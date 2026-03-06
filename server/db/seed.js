import db from './database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

function generateId(prefix) {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

export function seedDatabase() {
  try {
    // Clear existing data
    db.exec(`
      DELETE FROM requests;
      DELETE FROM form_approvals;
      DELETE FROM forms;
      DELETE FROM access_requests;
      DELETE FROM audit_trail;
      DELETE FROM users;
      DELETE FROM settings;
      DELETE FROM slack_config;
    `);

    // Seed Users
    const users = [
      { id: generateId('usr'), name: 'Vasu Satija',   email: 'vasu.satija',   password: 'Testing@12345', role: 'super_admin', organization: 'Cars24' },
      { id: generateId('usr'), name: 'GRC Admin',     email: 'grcadmin',      password: 'Testing@12345', role: 'admin',       organization: 'C2D' },
      { id: generateId('usr'), name: 'GRC Requestor', email: 'grcrequestor',  password: 'Testing@12345', role: 'requestor',   organization: 'Operations' },
      { id: generateId('usr'), name: 'GRC Approver',  email: 'grcapprover',   password: 'Testing@12345', role: 'approver',    organization: 'North Region' },
      { id: generateId('usr'), name: 'GRC Auditor',   email: 'grcauditor',    password: 'Testing@12345', role: 'auditor',     organization: 'Compliance', formAccess: ['f1', 'f2'] }
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password, role, organization, status, formAccess)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `);

    let userIds = {};
    users.forEach(user => {
      const hashedPassword = bcrypt.hashSync(user.password, 10);
      const formAccess = user.formAccess ? JSON.stringify(user.formAccess) : null;
      insertUser.run(user.id, user.name, user.email, hashedPassword, user.role, user.organization, formAccess);
      userIds[user.email] = user.id;
    });

    console.log('Seeded users');

    // Seed Forms
    const form1Id = 'f1';
    const form2Id = 'f2';

    const form1Fields = [
      { id: 'dealer_code', label: 'Dealer Code', type: 'text', required: true },
      { id: 'region', label: 'Region', type: 'select', required: true, options: ['North', 'South', 'East', 'West'] },
      { id: 'reason', label: 'Reason', type: 'textarea', required: true },
      { id: 'doc', label: 'Supporting Document', type: 'file', required: false }
    ];

    const form1AmountLogic = {
      type: 'table-based',
      col1Name: 'Region', col2Name: 'Price Bucket', valName: 'Default Fee',
      rows: [
        { c1: 'North', c2: '0-10000', val: 5000 }, { c1: 'North', c2: '10001-50000', val: 8000 }, { c1: 'North', c2: '50001+', val: 12000 },
        { c1: 'South', c2: '0-10000', val: 4500 }, { c1: 'South', c2: '10001-50000', val: 7500 }, { c1: 'South', c2: '50001+', val: 10000 },
        { c1: 'East',  c2: '0-10000', val: 5500 }, { c1: 'East',  c2: '10001-50000', val: 8500 }, { c1: 'East',  c2: '50001+', val: 11000 },
        { c1: 'West',  c2: '0-10000', val: 4800 }, { c1: 'West',  c2: '10001-50000', val: 7800 }, { c1: 'West',  c2: '50001+', val: 10500 }
      ]
    };

    const form1SlaConfig = {
      enabled: true,
      levels: [
        { label: 'L1', tatHours: 24, escalateTo: 'grcapprover', actions: ['notify', 'escalate'] },
        { label: 'L2', tatHours: 48, escalateTo: 'grcapprover', actions: ['notify', 'escalate'] }
      ]
    };

    const insertForm = db.prepare(`
      INSERT INTO forms (id, name, category, businessUnit, description, fields, approvalLogic, amountLogic, autoAction, limitBasedApproval, slaConfig, assignedRequestors, assignedApprovers, createdBy, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertForm.run(form1Id, 'Service Fee Waiver - Dealers', 'waiver', 'C2D',
      'Approve service fee waivers for dealers based on region and transaction amount',
      JSON.stringify(form1Fields), JSON.stringify({ type: 'sequential' }),
      JSON.stringify(form1AmountLogic), 'waive_on_website', null,
      JSON.stringify(form1SlaConfig), JSON.stringify(['grcrequestor']),
      JSON.stringify(['grcapprover']), userIds['grcadmin'], 'active');

    const form2Fields = [
      { id: 'emp_id',       label: 'Employee ID',        type: 'text',   required: true },
      { id: 'reason',       label: 'Reason',             type: 'select', required: true, options: ['Medical', 'Education', 'Housing', 'Personal'] },
      { id: 'repay_months', label: 'Repayment Months',   type: 'number', required: true },
      { id: 'docs',         label: 'Supporting Docs',    type: 'file',   required: false }
    ];

    const form2AmountLogic = { type: 'simple', label: 'Advance Amount (₹)', required: true };

    const form2SlaConfig = {
      enabled: true,
      levels: [{ label: 'L1', tatHours: 48, escalateTo: 'grcapprover', actions: ['notify', 'escalate'] }]
    };

    insertForm.run(form2Id, 'Salary Advance Request', 'salary_advance', 'HR',
      'Request salary advance with specified repayment terms',
      JSON.stringify(form2Fields), JSON.stringify({ type: 'sequential' }),
      JSON.stringify(form2AmountLogic), 'notify_finance', null,
      JSON.stringify(form2SlaConfig), JSON.stringify(['grcrequestor']),
      JSON.stringify(['grcapprover']), userIds['grcadmin'], 'active');

    console.log('Seeded forms');

    // Seed Form Approvals
    const insertFormApproval = db.prepare(`
      INSERT INTO form_approvals (id, formId, status, createdAt, actedAt, actedBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    insertFormApproval.run(generateId('fa'), form1Id, 'approved', now, now, userIds['vasu.satija']);
    insertFormApproval.run(generateId('fa'), form2Id, 'approved', now, now, userIds['vasu.satija']);

    console.log('Seeded form approvals');

    // Seed Requests
    const insertRequest = db.prepare(`
      INSERT INTO requests (id, formId, requestorId, requestorEmail, data, amount, status, currentApprover, approvalChain, approvedBy, actedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertRequest.run('REQ-001', form1Id, userIds['grcrequestor'], 'grcrequestor', JSON.stringify({ dealer_code: 'DLR-4521', region: 'North', bucket: '0-10000', reason: 'Full Waiver' }), 5000, 'pending', 'grcapprover', JSON.stringify(['grcapprover']), null, null);
    insertRequest.run('REQ-002', form2Id, userIds['grcrequestor'], 'grcrequestor', JSON.stringify({ emp_id: 'EMP-1192', reason: 'Medical', repay_months: 6, amount: 75000 }), 75000, 'approved', 'grcapprover', JSON.stringify(['grcapprover']), userIds['grcapprover'], new Date().toISOString());
    insertRequest.run('REQ-003', form1Id, userIds['grcrequestor'], 'grcrequestor', JSON.stringify({ dealer_code: 'DLR-7788', region: 'South', bucket: '10001-50000', reason: 'Partial 3000' }), 7500, 'pending', 'grcapprover', JSON.stringify(['grcapprover']), null, null);
    insertRequest.run('REQ-004', form2Id, userIds['grcrequestor'], 'grcrequestor', JSON.stringify({ emp_id: 'EMP-0847', reason: 'Housing', repay_months: 12, amount: 120000 }), 120000, 'rejected', 'grcapprover', JSON.stringify(['grcapprover']), userIds['grcapprover'], new Date().toISOString());

    console.log('Seeded requests');

    // Seed Audit Trail
    const insertAudit = db.prepare(`
      INSERT INTO audit_trail (id, action, targetType, targetId, userId, userEmail, description, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudit.run(generateId('aud'), 'form_created',    'form',    form1Id,   userIds['grcadmin'],      'grcadmin',      'Form created',               JSON.stringify({ name: 'Service Fee Waiver - Dealers' }), new Date().toISOString());
    insertAudit.run(generateId('aud'), 'form_approved',   'form',    form1Id,   userIds['vasu.satija'],   'vasu.satija',   'Form approved by super admin', JSON.stringify({ name: 'Service Fee Waiver - Dealers' }), new Date().toISOString());
    insertAudit.run(generateId('aud'), 'form_created',    'form',    form2Id,   userIds['grcadmin'],      'grcadmin',      'Form created',               JSON.stringify({ name: 'Salary Advance Request' }),        new Date().toISOString());
    insertAudit.run(generateId('aud'), 'form_approved',   'form',    form2Id,   userIds['vasu.satija'],   'vasu.satija',   'Form approved by super admin', JSON.stringify({ name: 'Salary Advance Request' }),        new Date().toISOString());
    insertAudit.run(generateId('aud'), 'request_submitted','request','REQ-001', userIds['grcrequestor'],  'grcrequestor',  'Request submitted',          JSON.stringify({ formId: form1Id }),                       new Date().toISOString());
    insertAudit.run(generateId('aud'), 'request_approved', 'request','REQ-002', userIds['grcapprover'],   'grcapprover',   'Request approved',           JSON.stringify({ formId: form2Id, amount: 75000 }),        new Date().toISOString());
    insertAudit.run(generateId('aud'), 'request_submitted','request','REQ-003', userIds['grcrequestor'],  'grcrequestor',  'Request submitted',          JSON.stringify({ formId: form1Id }),                       new Date().toISOString());
    insertAudit.run(generateId('aud'), 'request_rejected', 'request','REQ-004', userIds['grcapprover'],   'grcapprover',   'Request rejected',           JSON.stringify({ formId: form2Id, amount: 120000 }),       new Date().toISOString());

    console.log('Seeded audit trail');

    // Seed Settings
    const insertSetting = db.prepare(`
      INSERT INTO settings (id, key, value, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?)
    `);

    insertSetting.run(generateId('set'), 'theme_color', '#003366',                    userIds['vasu.satija'], new Date().toISOString());
    insertSetting.run(generateId('set'), 'org_name',    'Cars24',                     userIds['vasu.satija'], new Date().toISOString());
    insertSetting.run(generateId('set'), 'logo_url',    'https://cars24.com/logo.png', userIds['vasu.satija'], new Date().toISOString());

    console.log('Seeded settings');

    // Seed Slack Config
    const insertSlackConfig = db.prepare(`
      INSERT INTO slack_config (id, webhookUrl, enabledEvents, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?)
    `);

    insertSlackConfig.run(generateId('slack'), null, JSON.stringify(['access_request', 'form_submission', 'request_action']), userIds['vasu.satija'], new Date().toISOString());

    console.log('Database seeding completed successfully');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
