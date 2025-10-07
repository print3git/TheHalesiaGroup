import { sendEmail } from './_mailer.js';

const RESPONSE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map();

const DEFAULT_FIELD_LIMIT = 4000;
const FIELD_LIMITS = {
  email: 320,
  name: 200,
  company: 200,
  priority: 2000,
  goal: 4000,
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

const getClientIp = (request) => {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return 'unknown';
};

const isRateLimited = (ip) => {
  if (!ip || ip === 'unknown') {
    return false;
  }

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.expires <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      expires: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    entry.count += 1;
    rateLimitStore.set(ip, entry);
    return true;
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return false;
};

const enforceFieldLimits = (data) => {
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    const limit = FIELD_LIMITS[key] ?? DEFAULT_FIELD_LIMIT;
    if (sanitize(value).length > limit) {
      return `Field "${key}" exceeds the maximum allowed length.`;
    }
  }
  return null;
};

const createErrorResponse = (status, message) =>
  new Response(
    JSON.stringify({
      ok: false,
      error: message,
    }),
    {
      status,
      headers: RESPONSE_HEADERS,
    }
  );

export function createFormHandler({ requiredFields, subject, prepareContent }) {
  return async function onRequest({ request, env }) {
    if (request.method !== 'POST') {
      return createErrorResponse(405, 'Method Not Allowed');
    }

    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp)) {
      return createErrorResponse(429, 'Too many submissions. Please try again later.');
    }

    let data;

    try {
      data = await parseBody(request);
    } catch (error) {
      return createErrorResponse(400, 'Invalid request payload.');
    }

    const honeypot = sanitize(data.website || data.honeypot || data.bot_field);
    if (honeypot) {
      return createErrorResponse(400, 'Request rejected.');
    }

    const lengthError = enforceFieldLimits(data);
    if (lengthError) {
      return createErrorResponse(400, lengthError);
    }

    const missingFields = requiredFields.filter((field) => !sanitize(data[field]));

    if (missingFields.length) {
      return createErrorResponse(
        400,
        `Missing required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}`
      );
    }

    let content;

    try {
      content = prepareContent({ sanitize, escapeHtml }, data);
    } catch (error) {
      return createErrorResponse(500, 'Unable to process submission.');
    }

    const computedSubject =
      typeof subject === 'function' ? subject({ sanitize }, data) : String(subject || 'Website form submission');

    const replyToEmail = sanitize(data.email);

    try {
      await sendEmail(env, {
        subject: computedSubject,
        text: content.text,
        html: content.html,
        // Populate the Reply-To header with the visitor's email so responses go directly to them.
        replyTo: replyToEmail,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: RESPONSE_HEADERS,
      });
    } catch (error) {
      console.error('Email sending failed', error);

      const message =
        error instanceof Error && error.message
          ? error.message
          : 'We could not send your message at this time. Please try again later.';

      const status = message.includes('credentials') ? 500 : 502;

      return createErrorResponse(status, message);
    }
  };
}
