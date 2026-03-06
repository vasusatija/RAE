import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db/database.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { logAudit } from '../services/audit.js';
import { sendSlackNotification } from '../services/slack.js';

const router = express.Router();

function generateId(prefix) {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

// POST /api/auth/login
router.post('/login', [
  body('email').notEmpty().trim(),
  body('password').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ error: 'User account is inactive' });

    const token = generateToken(user);
    logAudit('user_login', 'user', user.id, user.id, user.email, 'User logged in');

    res.json({
      success: true, token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, organization: user.organization, formAccess: user.formAccess ? JSON.parse(user.formAccess) : [] }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('empId').notEmpty().trim(),
  body('password').isLength({ min: 8 }),
  body('department').notEmpty().trim(),
  body('requestedRole').isIn(['admin', 'approver', 'requestor', 'auditor']),
  body('reason').notEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, empId, password, department, requestedRole, reason } = req.body;
  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const existingRequest = db.prepare('SELECT id FROM access_requests WHERE email = ? AND status = ?').get(email, 'pending');
    if (existingRequest) return res.status(400).json({ error: 'Access request already pending for this email' });

    const accessRequestId = generateId('areq');
    db.prepare(`INSERT INTO access_requests (id, name, email, empId, department, requestedRole, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`).run(accessRequestId, name, email, empId, department, requestedRole, reason);

    logAudit('access_request_submitted', 'access_request', accessRequestId, null, email, `Access request submitted for ${requestedRole} role`, { name, department, requestedRole });
    await sendSlackNotification('access_request', { name, email, empId, department, requestedRole, reason });

    res.status(201).json({ success: true, message: 'Access request submitted. Please wait for approval.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, organization, status, formAccess FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ...user, formAccess: user.formAccess ? JSON.parse(user.formAccess) : [] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
