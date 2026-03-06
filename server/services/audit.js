import db from '../db/database.js';
import crypto from 'crypto';

function generateId(prefix) {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

export function logAudit(action, targetType, targetId, userId, userEmail, description, details = null) {
  try {
    const insertAudit = db.prepare(`
      INSERT INTO audit_trail (id, action, targetType, targetId, userId, userEmail, description, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudit.run(
      generateId('aud'),
      action,
      targetType,
      targetId,
      userId,
      userEmail,
      description,
      details ? JSON.stringify(details) : null,
      new Date().toISOString()
    );
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}

export function getAuditTrail(filters = {}) {
  let query = 'SELECT * FROM audit_trail WHERE 1=1';
  const params = [];

  if (filters.userId) {
    query += ' AND userId = ?';
    params.push(filters.userId);
  }

  if (filters.action) {
    query += ' AND action = ?';
    params.push(filters.action);
  }

  if (filters.targetType) {
    query += ' AND targetType = ?';
    params.push(filters.targetType);
  }

  if (filters.targetId) {
    query += ' AND targetId = ?';
    params.push(filters.targetId);
  }

  if (filters.userEmail) {
    query += ' AND userEmail LIKE ?';
    params.push(`%${filters.userEmail}%`);
  }

  query += ' ORDER BY timestamp DESC LIMIT 1000';

  try {
    const stmt = db.prepare(query);
    const results = stmt.all(...params);
    return results.map(audit => ({
      ...audit,
      details: audit.details ? JSON.parse(audit.details) : null
    }));
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    return [];
  }
}
