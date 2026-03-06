import express from 'express';
import { query, validationResult } from 'express-validator';
import verifyToken from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { getAuditTrail } from '../services/audit.js';

const router = express.Router();

// GET /api/audit
router.get('/', verifyToken, requireRole('admin', 'super_admin', 'auditor'), [
  query('userId').optional().trim(),
  query('action').optional().trim(),
  query('targetType').optional().trim(),
  query('targetId').optional().trim(),
  query('userEmail').optional().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const filters = {};

    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.action) filters.action = req.query.action;
    if (req.query.targetType) filters.targetType = req.query.targetType;
    if (req.query.targetId) filters.targetId = req.query.targetId;
    if (req.query.userEmail) filters.userEmail = req.query.userEmail;

    // Auditors can only see audit for forms they have access to
    if (req.user.role === 'auditor') {
      filters.targetType = 'request';
      filters.targetId = req.user.formAccess ? req.user.formAccess.join(',') : '';
    }

    const auditTrail = getAuditTrail(filters);

    res.json({
      success: true,
      auditTrail,
      count: auditTrail.length
    });
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
