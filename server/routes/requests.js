import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import db from '../db/database.js';
import verifyToken from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { logAudit } from '../services/audit.js';
import { sendSlackNotification } from '../services/slack.js';

const router = express.Router();

function generateId(prefix) {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

// GET /api/requests
router.get('/', verifyToken, (req, res) => {
  try {
    let query = `SELECT r.id, r.formId, r.requestorId, r.requestorEmail, r.data, r.amount, r.status, r.currentApprover, r.approvalChain, r.approvedBy, r.rejectionReason, r.createdAt, r.actedAt, r.slaBreached, f.name as formName, f.category, f.slaConfig FROM requests r JOIN forms f ON r.formId = f.id WHERE 1=1`;
    const params = [];

    if (req.user.role === 'requestor') {
      query += ' AND r.requestorId = ?'; params.push(req.user.id);
    } else if (req.user.role === 'approver') {
      query += ' AND (r.currentApprover = ? OR r.approvalChain LIKE ?)'; params.push(req.user.email, `%${req.user.email}%`);
    } else if (req.user.role === 'auditor') {
      if (req.user.formAccess && req.user.formAccess.length > 0) {
        query += ` AND r.formId IN (${req.user.formAccess.map(() => '?').join(',')})`; params.push(...req.user.formAccess);
      } else return res.json({ success: true, requests: [] });
    }

    query += ' ORDER BY r.createdAt DESC';
    const requests = db.prepare(query).all(...params);
    res.json({ success: true, requests: requests.map(r => ({ ...r, data: JSON.parse(r.data), slaBreached: r.slaBreached ? JSON.parse(r.slaBreached) : null, slaConfig: r.slaConfig ? JSON.parse(r.slaConfig) : null })) });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/requests
router.post('/', verifyToken, requireRole('requestor', 'admin', 'super_admin'), [
  body('formId').notEmpty(),
  body('data').custom(val => typeof val === 'object'),
  body('amount').optional().isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { formId, data, amount } = req.body;
  try {
    const form = db.prepare('SELECT * FROM forms WHERE id = ?').get(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    if (form.status !== 'active') return res.status(400).json({ error: 'Form is not active' });

    const assignedApprovers = JSON.parse(form.assignedApprovers);
    const currentApprover = assignedApprovers[0];
    const requestId = generateId('req');

    db.prepare(`INSERT INTO requests (id, formId, requestorId, requestorEmail, data, amount, status, currentApprover, approvalChain) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`).run(requestId, formId, req.user.id, req.user.email, JSON.stringify(data), amount || null, currentApprover, JSON.stringify(assignedApprovers));

    logAudit('request_submitted', 'request', requestId, req.user.id, req.user.email, `Request submitted for form: ${form.name}`, { requestId, formId, formName: form.name, amount: amount || null });
    await sendSlackNotification('form_submission', { requestorEmail: req.user.email, formId, formName: form.name, requestId, amount });

    res.status(201).json({ success: true, message: 'Request submitted successfully', request: { id: requestId, formId, status: 'pending', currentApprover, createdAt: new Date().toISOString() } });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/requests/:id/action
router.put('/:id/action', verifyToken, requireRole('approver', 'admin', 'super_admin'), [
  body('action').isIn(['approve', 'reject']),
  body('rejectionReason').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { action, rejectionReason } = req.body;
  try {
    const request = db.prepare(`SELECT r.*, f.name as formName, f.rejectionReasonConfig, f.autoAction FROM requests r JOIN forms f ON r.formId = f.id WHERE r.id = ?`).get(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Request has already been actioned' });
    if (request.currentApprover !== req.user.email && req.user.role !== 'super_admin') return res.status(403).json({ error: 'Not authorized to approve this request' });

    if (action === 'approve') {
      db.prepare(`UPDATE requests SET status = 'approved', approvedBy = ?, actedAt = ? WHERE id = ?`).run(req.user.id, new Date().toISOString(), id);
      logAudit('request_approved', 'request', id, req.user.id, req.user.email, `Request approved: ${request.formName}`, { requestId: id, formId: request.formId, amount: request.amount });
      await sendSlackNotification('request_approved', { requestId: id, formName: request.formName, amount: request.amount, approvedBy: req.user.email });
      res.json({ success: true, message: 'Request approved', autoAction: request.autoAction });
    } else {
      db.prepare(`UPDATE requests SET status = 'rejected', rejectionReason = ?, actedAt = ? WHERE id = ?`).run(rejectionReason || null, new Date().toISOString(), id);
      logAudit('request_rejected', 'request', id, req.user.id, req.user.email, `Request rejected: ${request.formName}`, { requestId: id, rejectionReason: rejectionReason || null });
      await sendSlackNotification('request_rejected', { requestId: id, formName: request.formName, rejectedBy: req.user.email, rejectionReason });
      res.json({ success: true, message: 'Request rejected' });
    }
  } catch (error) {
    console.error('Error processing request action:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
