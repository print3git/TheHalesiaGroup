import { createFormHandler } from './_form-handler.js';

const handler = createFormHandler({
  // Reply-To is now set dynamically from the visitor's email in the shared form handler.
  requiredFields: ['name', 'email', 'goal'],
  subject({ sanitize }, data) {
    const email = sanitize(data.email) || 'unknown email';
    return `Clarity Call Request from ${email}`;
  },
  prepareContent({ sanitize, escapeHtml }, data) {
    const name = sanitize(data.name);
    const email = sanitize(data.email);
    const company = sanitize(data.company);
    const goal = sanitize(data.goal);

    const textLines = [
      'A new clarity call request has been submitted.',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || 'Not provided'}`,
      '',
      'Goal / Project Details:',
      goal,
    ];

    const text = textLines.join('\n');

    const html = `
      <p>A new clarity call request has been submitted.</p>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Company:</strong> ${escapeHtml(company || 'Not provided')}</p>
      <p><strong>Goal / Project Details:</strong><br />${escapeHtml(goal)}</p>
    `;

    return { text, html };
  },
});

export const onRequestPost = handler;
