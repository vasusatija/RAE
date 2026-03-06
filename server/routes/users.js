import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db/database.js';
import verifyToken from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/roleCheck.js';
import { logAudit } from '../services/audit.js';

const router = express.Router();

// GET /api/users
router.get('/', verifyToken, requireSuperAdmin, (req, res) => {
  try {
    const users = db.prepare(`SELECT id, name, email, role, organization, status, createdAt, updatedAt FROM users ORDER BY createdAt DESC`).all();
    res.json({ success: true, users: users.map(u => ({ ...u, formAccess: u.formAccess ? JSON.parse(u.formAccess) : [] })) });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id/role
router.put('/:id/role', verifyToken, requireSuperAdmin, [
  body('role').isIn(['super_admin', 'admin', 'approver', 'requestor', 'auditor'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { role } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    db.prepare('UPDATE users SET role = ?, updatedAt = ? WHERE id = ?').run(role, new Date().toISOString(), id);
    logAudit('user_role_changed', 'user', id, req.user.id, req.user.email, `User role changed to ${role}`, { userId: id, userEmail: user.email, oldRole: user.role, newRole: role });

    res.json({ success: true, message: 'User role updated', user: { id: user.id, name: user.name, email: user.email, role, organization: user.organization } });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id/status
router.put('/:id/status', verifyToken, requireSuperAdmin, [
  body('status').isIn(['active', 'inactive'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { status } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    db.prepare('UPDATE users SET status = ?, updatedAt = ? WHERE id = ?').run(status, new Date().toISOString(), id);
    logAudit('user_status_changed', 'user', id, req.user.id, req.user.email, `User status changed to ${status}`, { userId: id, userEmail: user.email, oldStatus: user.status, newStatus: status });

    res.json({ success: true, message: 'User status updated', user: { id: user.id, name: user.name, email: user.email, role: user.role, status } });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
