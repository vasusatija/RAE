import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db/database.js';
import verifyToken from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/roleCheck.js';
import { logAudit } from '../services/audit.js';

const router = express.Router();

// GET /api/form-approvals
router.get('/', verifyToken, requireSuperAdmin, (req, res) => {
  try {
    const formApprovals = db.prepare(`SELECT fa.id, fa.formId, fa.status, fa.rejectionReason, fa.createdAt, fa.actedAt, fa.actedBy, f.name, f.category, f.businessUnit, f.createdBy FROM form_approvals fa JOIN forms f ON fa.formId = f.id ORDER BY fa.createdAt DESC`).all();
    res.json({ success: true, formApprovals });
  } catch (error) {
    console.error('Error fetching form approvals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/form-approvals/:id
router.put('/:id', verifyToken, requireSuperAdmin, [
  body('action').isIn(['approve', 'reject']),
  body('rejectionReason').optional().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { action, rejectionReason } = req.body;
  try {
    const formApproval = db.prepare(`SELECT fa.*, f.name, f.createdBy FROM form_approvals fa JOIN forms f ON fa.formId = f.id WHERE fa.id = ?`).get(id);
    if (!formApproval) return res.status(404).json({ error: 'Form approval not found' });
    if (formApproval.status !== 'pending') return res.status(400).json({ error: 'Already actioned' });

    if (action === 'approve') {
      db.prepare('UPDATE forms SET status = ?, updatedAt = ? WHERE id = ?').run('active', new Date().toISOString(), formApproval.formId);
      db.prepare(`UPDATE form_approvals SET status = 'approved', actedAt = ?, actedBy = ? WHERE id = ?`).run(new Date().toISOString(), req.user.id, id);
      logAudit('form_approved', 'form', formApproval.formId, req.user.id, req.user.email, `Form approved: ${formApproval.name}`, { formId: formApproval.formId });
      res.json({ success: true, message: 'Form approved and published' });
    } else {
      db.prepare('UPDATE forms SET status = ?, updatedAt = ? WHERE id = ?').run('deleted', new Date().toISOString(), formApproval.formId);
      db.prepare(`UPDATE form_approvals SET status = 'rejected', rejectionReason = ?, actedAt = ?, actedBy = ? WHERE id = ?`).run(rejectionReason || null, new Date().toISOString(), req.user.id, id);
      logAudit('form_rejected', 'form', formApproval.formId, req.user.id, req.user.email, `Form rejected: ${formApproval.name}`, { formId: formApproval.formId });
      res.json({ success: true, message: 'Form rejected' });
    }
  } catch (error) {
    console.error('Error processing form approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
