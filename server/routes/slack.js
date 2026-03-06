import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import db from '../db/database.js';
import verifyToken from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/roleCheck.js';
import { getSlackConfig, testSlackWebhook } from '../services/slack.js';
import { logAudit } from '../services/audit.js';

const router = express.Router();

function generateId(prefix) {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

// GET /api/slack/config
router.get('/config', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const config = await getSlackConfig();

    res.json({
      success: true,
      config: {
        webhookUrl: config.webhookUrl || null,
        enabledEvents: config.enabledEvents ? (typeof config.enabledEvents === 'string' ? JSON.parse(config.enabledEvents) : config.enabledEvents) : []
      }
    });
  } catch (error) {
    console.error('Error fetching Slack config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/slack/config
router.put('/config', verifyToken, requireSuperAdmin, [
  body('webhookUrl').optional().isURL().trim(),
  body('enabledEvents').optional().isArray()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { webhookUrl, enabledEvents } = req.body;

  try {
    const updateStmt = db.prepare(`
      UPDATE slack_config
      SET webhookUrl = ?, enabledEvents = ?, updatedBy = ?, updatedAt = ?
      WHERE id = ?
    `);

    updateStmt.run(
      webhookUrl || null,
      enabledEvents ? JSON.stringify(enabledEvents) : JSON.stringify(['access_request', 'form_submission', 'request_action']),
      req.user.id,
      new Date().toISOString(),
      'slack-config-1'
    );

    logAudit('slack_config_updated', 'slack', 'config', req.user.id, req.user.email, 'Slack configuration updated', {
      hasWebhookUrl: !!webhookUrl,
      enabledEvents: enabledEvents || []
    });

    res.json({
      success: true,
      message: 'Slack configuration updated'
    });
  } catch (error) {
    console.error('Error updating Slack config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/slack/test
router.post('/test', verifyToken, requireSuperAdmin, [
  body('webhookUrl').isURL().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { webhookUrl } = req.body;

  try {
    const isValid = await testSlackWebhook(webhookUrl);

    if (isValid) {
      logAudit('slack_webhook_tested', 'slack', 'config', req.user.id, req.user.email, 'Slack webhook tested successfully');

      res.json({
        success: true,
        message: 'Slack webhook is valid'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Slack webhook is invalid or unreachable'
      });
    }
  } catch (error) {
    console.error('Error testing Slack webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
