import nodemailer from 'nodemailer';

// TODO: Set the ZOHO_USER and ZOHO_PASS secrets in your hosting provider's
// environment configuration (for example, Cloudflare Pages project settings)
// before deploying these functions.

let cachedTransporter;
let cachedUser;

function createTransporter(env) {
  const username = env?.ZOHO_USER;
  const password = env?.ZOHO_PASS;

  if (!username || !password) {
    throw new Error('Email service credentials are not configured.');
  }

  if (cachedTransporter && cachedUser === username) {
    return cachedTransporter;
  }

  cachedUser = username;
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.zoho.eu',
    port: 465,
    secure: true,
    auth: {
      user: username,
      pass: password,
    },
  });

  return cachedTransporter;
}

export async function sendEmail(env, { subject, text, html, replyTo }) {
  const transporter = createTransporter(env);

  const message = {
    from: `Halesia Group <${env.ZOHO_USER}>`,
    to: 'info@halesiagroup.com',
    subject,
    text,
    html,
  };

  if (replyTo) {
    message.replyTo = replyTo;
  }

  return transporter.sendMail(message);
}
