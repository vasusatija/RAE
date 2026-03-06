import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import fetch from 'node-fetch';
import db from '../db/database.js';
import verifyToken from '../middleware/auth.js';
import { requireAdminOrSuperAdmin, requireRole } from '../middleware/roleCheck.js';
import { logAudit } from '../services/audit.js';

const router = express.Router();

function generateId(prefix) {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

// GET /api/forms
router.get('/', verifyToken, (req, res) => {
  try {
    let query = `SELECT id, name, category, businessUnit, description, fields, approvalLogic, amountLogic, autoAction, rejectionReasonConfig, limitBasedApproval, slaConfig, assignedRequestors, assignedApprovers, createdBy, status, createdAt, updatedAt FROM forms WHERE status != 'deleted'`;
    const params = [];

    if (req.user.role === 'requestor') {
      query += ' AND (status = ? OR assignedRequestors LIKE ?)';
      params.push('active', `%${req.user.email}%`);
    } else if (req.user.role === 'approver') {
      query += ' AND (status = ? OR assignedApprovers LIKE ?)';
      params.push('active', `%${req.user.email}%`);
    } else if (req.user.role === 'auditor' && req.user.formAccess && req.user.formAccess.length > 0) {
      const formIds = req.user.formAccess.map(() => '?').join(',');
      query += ` AND id IN (${formIds})`;
      params.push(...req.user.formAccess);
    }

    query += ' ORDER BY createdAt DESC';
    const forms = db.prepare(query).all(...params);

    res.json({ success: true, forms: forms.map(form => ({ ...form, fields: JSON.parse(form.fields), approvalLogic: JSON.parse(form.approvalLogic), amountLogic: JSON.parse(form.amountLogic), limitBasedApproval: form.limitBasedApproval ? JSON.parse(form.limitBasedApproval) : null, slaConfig: form.slaConfig ? JSON.parse(form.slaConfig) : null, assignedRequestors: JSON.parse(form.assignedRequestors), assignedApprovers: JSON.parse(form.assignedApprovers) })) });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/forms
router.post('/', verifyToken, requireAdminOrSuperAdmin, [
  body('name').notEmpty().trim(),
  body('category').isIn(['waiver', 'salary_advance', 'exception', 'reimbursement', 'access', 'custom']),
  body('businessUnit').notEmpty().trim(),
  body('fields').isArray(),
  body('approvalLogic').custom(val => typeof val === 'object'),
  body('amountLogic').custom(val => typeof val === 'object'),
  body('assignedRequestors').isArray(),
  body('assignedApprovers').isArray()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, category, businessUnit, description, fields, approvalLogic, amountLogic, autoAction = 'none', rejectionReasonConfig = 'optional', limitBasedApproval, slaConfig, assignedRequestors, assignedApprovers } = req.body;

  try {
    const formId = generateId('f');
    const status = req.user.role === 'super_admin' ? 'active' : 'pending';

    db.prepare(`INSERT INTO forms (id, name, category, businessUnit, description, fields, approvalLogic, amountLogic, autoAction, rejectionReasonConfig, limitBasedApproval, slaConfig, assignedRequestors, assignedApprovers, createdBy, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(formId, name, category, businessUnit, description || null, JSON.stringify(fields), JSON.stringify(approvalLogic), JSON.stringify(amountLogic), autoAction, rejectionReasonConfig, limitBasedApproval ? JSON.stringify(limitBasedApproval) : null, slaConfig ? JSON.stringify(slaConfig) : null, JSON.stringify(assignedRequestors), JSON.stringify(assignedApprovers), req.user.id, status);

    logAudit('form_created', 'form', formId, req.user.id, req.user.email, `Form created: ${name}`, { formId, name, category, businessUnit });

    if (req.user.role === 'admin') {
      db.prepare(`INSERT INTO form_approvals (id, formId, status) VALUES (?, ?, 'pending')`).run(generateId('fa'), formId);
    }

    res.status(201).json({ success: true, message: status === 'active' ? 'Form created and published' : 'Form submitted for approval', form: { id: formId, name, category, businessUnit, status, createdAt: new Date().toISOString() } });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/forms/:id/status
router.put('/:id/status', verifyToken, requireAdminOrSuperAdmin, [
  body('action').isIn(['pause', 'resume', 'delete'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { action } = req.body;
  try {
    const form = db.prepare('SELECT * FROM forms WHERE id = ?').get(id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    const newStatus = action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'deleted';
    db.prepare('UPDATE forms SET status = ?, updatedAt = ? WHERE id = ?').run(newStatus, new Date().toISOString(), id);
    logAudit('form_status_changed', 'form', id, req.user.id, req.user.email, `Form status changed to ${newStatus}`, { formId: id, action });

    res.json({ success: true, message: `Form ${action}d successfully`, newStatus });
  } catch (error) {
    console.error('Error updating form status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
