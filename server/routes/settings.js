import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import db from '../db/database.js';
import verifyToken from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/roleCheck.js';
import { logAudit } from '../services/audit.js';

const router = express.Router();

function generateId(prefix) {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

// GET /api/settings
router.get('/', verifyToken, (req, res) => {
  try {
    const stmt = db.prepare('SELECT key, value FROM settings');
    const settingsArray = stmt.all();

    const settings = {};
    settingsArray.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    res.json({
      success: true,
      settings: {
        theme_color: settings.theme_color || '#003366',
        org_name: settings.org_name || 'Cars24',
        logo_url: settings.logo_url || 'https://cars24.com/logo.png'
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/settings
router.put('/', verifyToken, requireSuperAdmin, [
  body('theme_color').optional().isLength({ min: 4, max: 7 }),
  body('org_name').optional().notEmpty().trim(),
  body('logo_url').optional().isURL()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { theme_color, org_name, logo_url } = req.body;

  try {
    const timestamp = new Date().toISOString();

    if (theme_color !== undefined) {
      const upsertStmt = db.prepare(`
        INSERT INTO settings (id, key, value, updatedBy, updatedAt)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value=?, updatedBy=?, updatedAt=?
      `);
      upsertStmt.run(generateId('set'), 'theme_color', theme_color, req.user.id, timestamp, theme_color, req.user.id, timestamp);
    }

    if (org_name !== undefined) {
      const upsertStmt = db.prepare(`
        INSERT INTO settings (id, key, value, updatedBy, updatedAt)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value=?, updatedBy=?, updatedAt=?
      `);
      upsertStmt.run(generateId('set'), 'org_name', org_name, req.user.id, timestamp, org_name, req.user.id, timestamp);
    }

    if (logo_url !== undefined) {
      const upsertStmt = db.prepare(`
        INSERT INTO settings (id, key, value, updatedBy, updatedAt)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value=?, updatedBy=?, updatedAt=?
      `);
      upsertStmt.run(generateId('set'), 'logo_url', logo_url, req.user.id, timestamp, logo_url, req.user.id, timestamp);
    }

    logAudit('settings_updated', 'settings', 'global', req.user.id, req.user.email, 'Application settings updated', {
      theme_color: theme_color || undefined,
      org_name: org_name || undefined,
      logo_url: logo_url || undefined
    });

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
