# TheHalesiaGroup

This repository contains the static landing page for The Halesia Group.

## Setup

```bash
npm install
```

## Development

Run TailwindCSS in watch mode to rebuild `style.css` as you edit `src/styles/tailwind.css` or HTML templates.

```bash
npm run dev
```

## Production build

Generate a minified production build of `style.css` from `src/styles/tailwind.css`.

```bash
npm run build
```

## Cloudflare deployment

The site is configured for Cloudflare Pages with Functions-based API routes in `functions/api`. To enable email delivery for
the Clarity Diagnostic and Clarity Call forms:

- Set the `ZOHO_USER` and `ZOHO_PASS` secrets in your Cloudflare project settings (for both Pages and Workers environments).
- Deploy with those secrets available so the serverless functions can authenticate to Zoho's SMTP service.

Each form submits via POST to `/api/clarity-diagnostic` or `/api/clarity-call`, which will validate the payload, reject spam
via a honeypot field, and send the message to `info@halesiagroup.com` using the configured Zoho credentials.
