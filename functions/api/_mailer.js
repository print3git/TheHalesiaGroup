const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_ADDRESS = 'Website Forms <onboarding@resend.dev>';
const TO_ADDRESS = 'info@halesiagroup.com';
const DEFAULT_REPLY_TO = 'info@halesiagroup.com';

async function parseError(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await response.json().catch(() => null);
    if (body && body.error) {
      if (typeof body.error === 'string') {
        return body.error;
      }
      if (typeof body.error.message === 'string') {
        return body.error.message;
      }
    }
  } else {
    const text = await response.text().catch(() => '');
    if (text) {
      return text.slice(0, 200);
    }
  }

  return `Email provider responded with status ${response.status}`;
}

export async function sendEmail(env, { subject, text, html, replyTo }) {
  const apiKey = env?.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Email service credentials are not configured.');
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      subject,
      text,
      html,
      reply_to: replyTo || DEFAULT_REPLY_TO,
    }),
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  return response.json().catch(() => null);
}
