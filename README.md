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

Set the `RESEND_API_KEY` secret in your Cloudflare Pages project settings so Functions can authenticate to Resend. The Clarity Diagnostic and Clarity Call forms post to `/api/clarity-diagnostic` and `/api/clarity-call`. Emails are sent from Resend's authenticated domain (`Website Forms <onboarding@resend.dev>`) and dynamically set the `Reply-To` header to the visitor's submitted email (falling back to `info@halesiagroup.com` if unavailable).
