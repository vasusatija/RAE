import fetch from 'node-fetch';
import db from '../db/database.js';

export async function getSlackConfig() {
  try {
    const stmt = db.prepare('SELECT * FROM slack_config WHERE id = ?');
    const config = stmt.get('slack-config-1');
    return config || { id: 'slack-config-1', webhookUrl: null, enabledEvents: [] };
  } catch (error) {
    console.error('Error fetching Slack config:', error);
    return null;
  }
}

export async function sendSlackNotification(eventType, payload) {
  try {
    const config = await getSlackConfig();

    if (!config || !config.webhookUrl) {
      console.log('Slack webhook not configured');
      return false;
    }

    const enabledEvents = config.enabledEvents ? JSON.parse(config.enabledEvents) : [];
    if (!enabledEvents.includes(eventType)) {
      console.log(`Event type ${eventType} not enabled for Slack`);
      return false;
    }

    const message = buildSlackMessage(eventType, payload);

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      console.error('Slack notification failed:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}

function buildSlackMessage(eventType, payload) {
  let color = '#36a64f';
  let title = '';
  let text = '';
  let fields = [];

  switch (eventType) {
    case 'access_request':
      title = 'New Access Request';
      text = `${payload.name} (${payload.email}) has requested ${payload.requestedRole} access`;
      color = '#0099ff';
      fields = [
        { title: 'Employee ID', value: payload.empId, short: true },
        { title: 'Department', value: payload.department, short: true },
        { title: 'Reason', value: payload.reason, short: false }
      ];
      break;

    case 'access_request_approved':
      title = 'Access Request Approved';
      text = `Access approved for ${payload.email}`;
      color = '#36a64f';
      fields = [
        { title: 'Role', value: payload.role, short: true },
        { title: 'Approved By', value: payload.approvedBy, short: true }
      ];
      break;

    case 'access_request_rejected':
      title = 'Access Request Rejected';
      text = `Access request rejected for ${payload.email}`;
      color = '#ff0000';
      fields = [
        { title: 'Requested Role', value: payload.requestedRole, short: true },
        { title: 'Rejected By', value: payload.rejectedBy, short: true }
      ];
      break;

    case 'form_submission':
      title = 'New Form Submission';
      text = `${payload.requestorEmail} submitted "${payload.formName}"`;
      color = '#0099ff';
      fields = [
        { title: 'Form ID', value: payload.formId, short: true },
        { title: 'Request ID', value: payload.requestId, short: true },
        { title: 'Amount', value: payload.amount ? `₹${payload.amount}` : 'N/A', short: true }
      ];
      break;

    case 'request_approved':
      title = 'Request Approved';
      text = `Request ${payload.requestId} approved`;
      color = '#36a64f';
      fields = [
        { title: 'Form', value: payload.formName, short: true },
        { title: 'Amount', value: payload.amount ? `₹${payload.amount}` : 'N/A', short: true },
        { title: 'Approved By', value: payload.approvedBy, short: true }
      ];
      break;

    case 'request_rejected':
      title = 'Request Rejected';
      text = `Request ${payload.requestId} rejected`;
      color = '#ff0000';
      fields = [
        { title: 'Form', value: payload.formName, short: true },
        { title: 'Amount', value: payload.amount ? `₹${payload.amount}` : 'N/A', short: true },
        { title: 'Rejected By', value: payload.rejectedBy, short: true },
        { title: 'Reason', value: payload.rejectionReason || 'No reason provided', short: false }
      ];
      break;

    default:
      title = 'Notification';
      text = payload.message || 'An action has occurred';
  }

  return {
    attachments: [{ color, title, text, fields, footer: 'Request & Approval Engine', ts: Math.floor(Date.now() / 1000) }]
  };
}

export async function testSlackWebhook(webhookUrl) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [{
          color: '#36a64f',
          title: 'Test Notification',
          text: 'This is a test notification from the Request & Approval Engine',
          footer: 'Request & Approval Engine',
          ts: Math.floor(Date.now() / 1000)
        }]
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Error testing Slack webhook:', error);
    return false;
  }
}
