import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db/database.js';
import verifyToken from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/roleCheck.js';
import { logAudit } from '../services/audit.js';
import { sendSlackNotification } from '../services/slack.js';

const router = express.Router();

function generateId(prefix) {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

// GET /api/access-requests
router.get('/', verifyToken, requireSuperAdmin, (req, res) => {
  try {
    const requests = db.prepare(`SELECT id, name, email, empId, department, requestedRole, reason, status, formAccess, createdAt, actedAt, actedBy FROM access_requests ORDER BY createdAt DESC`).all();
    res.json({ success: true, accessRequests: requests.map(r => ({ ...r, formAccess: r.formAccess ? JSON.parse(r.formAccess) : [] })) });
  } catch (error) {
    console.error('Error fetching access requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/access-requests/:id
router.put('/:id', verifyToken, requireSuperAdmin, [
  body('action').isIn(['approve', 'reject']),
  body('formAccess').optional().isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { action, formAccess } = req.body;
  try {
    const accessRequest = db.prepare('SELECT * FROM access_requests WHERE id = ?').get(id);
    if (!accessRequest) return res.status(404).json({ error: 'Access request not found' });

    if (action === 'approve') {
      const userId = generateId('usr');
      const formAccessJson = formAccess ? JSON.stringify(formAccess) : null;
      db.prepare(`INSERT INTO users (id, name, email, password, role, organization, status, formAccess) VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`).run(userId, accessRequest.name, accessRequest.email, bcrypt.hashSync(accessRequest.empId + Date.now(), 10), accessRequest.requestedRole, 'New Organization', formAccessJson);
      db.prepare(`UPDATE access_requests SET status = 'approved', formAccess = ?, actedAt = ?, actedBy = ? WHERE id = ?`).run(formAccessJson, new Date().toISOString(), req.user.id, id);
      logAudit('access_request_approved', 'access_request', id, req.user.id, req.user.email, `Access request approved for ${accessRequest.email}`, { email: accessRequest.email, role: accessRequest.requestedRole });
      await sendSlackNotification('access_request_approved', { email: accessRequest.email, role: accessRequest.requestedRole, approvedBy: req.user.email });
      res.json({ success: true, message: 'Access request approved', user: { id: userId, name: accessRequest.name, email: accessRequest.email, role: accessRequest.requestedRole } });
    } else {
      db.prepare(`UPDATE access_requests SET status = 'rejected', actedAt = ?, actedBy = ? WHERE id = ?`).run(new Date().toISOString(), req.user.id, id);
      logAudit('access_request_rejected', 'access_request', id, req.user.id, req.user.email, `Access request rejected for ${accessRequest.email}`, { email: accessRequest.email });
      await sendSlackNotification('access_request_rejected', { email: accessRequest.email, requestedRole: accessRequest.requestedRole, rejectedBy: req.user.email });
      res.json({ success: true, message: 'Access request rejected' });
    }
  } catch (error) {
    console.error('Error processing access request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
