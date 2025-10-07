import { sendEmail } from './_mailer.js';

const RESPONSE_HEADERS = {
  'Content-Type': 'application/json',
};

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sanitize = (value) => String(value || '').trim();

const parseBody = async (request) => {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return request.json();
  }

  if (contentType.includes('form')) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  return {};
};

export function createFormHandler({ requiredFields, subject, prepareContent }) {
  return async function onRequest({ request, env }) {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: RESPONSE_HEADERS,
      });
    }

    let data;

    try {
      data = await parseBody(request);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid request payload.' }), {
        status: 400,
        headers: RESPONSE_HEADERS,
      });
    }

    const honeypot = sanitize(data.website || data.honeypot || data.bot_field);
    if (honeypot) {
      return new Response(JSON.stringify({ error: 'Request rejected.' }), {
        status: 400,
        headers: RESPONSE_HEADERS,
      });
    }

    const missingFields = requiredFields.filter((field) => !sanitize(data[field]));

    if (missingFields.length) {
      return new Response(
        JSON.stringify({
          error: `Missing required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}`,
        }),
        {
          status: 400,
          headers: RESPONSE_HEADERS,
        }
      );
    }

    let content;

    try {
      content = prepareContent({ sanitize, escapeHtml }, data);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Unable to process submission.' }), {
        status: 500,
        headers: RESPONSE_HEADERS,
      });
    }

    try {
      await sendEmail(env, {
        subject,
        text: content.text,
        html: content.html,
        replyTo: sanitize(data.email),
      });

      return new Response(
        JSON.stringify({ message: 'Submission received. We will reply shortly.' }),
        {
          status: 200,
          headers: RESPONSE_HEADERS,
        }
      );
    } catch (error) {
      console.error('Email sending failed', error);

      const status = error.message && error.message.includes('credentials') ? 500 : 502;

      const response = {
        error:
          status === 500
            ? 'Email service not configured. Please configure ZOHO_USER and ZOHO_PASS environment variables.'
            : 'We could not send your message at this time. Please try again later.',
      };

      return new Response(JSON.stringify(response), {
        status,
        headers: RESPONSE_HEADERS,
      });
    }
  };
}
