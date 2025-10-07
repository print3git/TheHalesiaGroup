import { createFormHandler } from './_form-handler.js';

const handler = createFormHandler({
  // Reply-To is now set dynamically from the visitor's email in the shared form handler.
  requiredFields: ['email', 'priority'],
  subject({ sanitize }, data) {
    const email = sanitize(data.email) || 'unknown email';
    return `Clarity Diagnostic Request from ${email}`;
  },
  prepareContent({ sanitize, escapeHtml }, data) {
    const email = sanitize(data.email);
    const priority = sanitize(data.priority);

    const text = `A new clarity diagnostic request has been submitted.\n\nEmail: ${email}\nTop priority: ${priority}`;

    const html = `
      <p>A new clarity diagnostic request has been submitted.</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Top priority:</strong><br />${escapeHtml(priority)}</p>
    `;

    return { text, html };
  },
});

export const onRequestPost = handler;
