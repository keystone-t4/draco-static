# DRACO FZE website

Plain static site — no build step, no framework. Just HTML/CSS/JS plus a small
PHP endpoint that sends the contact form by SMTP.

## Structure

```
index.html              The entire page markup
assets/                 Images and logos
  images/
    products/            Product photos used by the showcase carousels
public/
  main.css              All styling
  main.js               Mobile nav, scroll-reveal, contact form submit
  js/product-showcase.js  Renders the 4 product carousels from the JSON
                           embedded in each <section> of index.html
server/
  contact.php            Form endpoint the frontend POSTs to
  lib/env.php             Tiny .env file reader
  PHPMailer/src/          PHPMailer library (manually vendored, no Composer)
  .env.example            Copy to .env and fill in real SMTP credentials
  .htaccess               Blocks direct HTTP access to .env
  PHPMailer/.htaccess      Blocks direct HTTP access to the library source
_archive/                Old Claude Design source files, kept for reference
                         only — not part of the deployed site (see below)
```

## Running locally

Any static file server works for browsing the page, but to test the contact
form you need PHP:

```
php -S localhost:8000
```

Then open http://localhost:8000/.

## Setting up the contact form (SMTP)

1. In Hostinger's hPanel, create/confirm the mailbox you want to send from
   and reset its password if you don't have it (Emails → your domain →
   Manage → Reset password).
2. Copy `server/.env.example` to `server/.env`.
3. Fill in the real values:
   - `SMTP_HOST=smtp.hostinger.com`
   - `SMTP_PORT=465` with `SMTP_ENCRYPTION=ssl` (or `587` / `tls`)
   - `SMTP_USER` / `SMTP_PASS` — the mailbox address and its password
   - `SMTP_FROM` — usually the same mailbox
   - `SMTP_TO` — where inquiries should land
4. That's it — `server/contact.php` picks these up automatically. Until
   `.env` exists with all required keys, the form fails gracefully with
   "not configured yet" instead of pretending to succeed.

`server/.env` is never committed to git (see `.gitignore`) and `.htaccess`
blocks it from being served over HTTP directly, so credentials stay off both
your repository and the public web.

The form also has a hidden honeypot field (`website`) — real visitors never
see or fill it, but bots that auto-fill every field do, and their
submissions are silently discarded before anything is sent.

Mail is sent via [PHPMailer](https://github.com/PHPMailer/PHPMailer), vendored
manually into `server/PHPMailer/src/` (no Composer — just the 3 required
source files, so it works with plain FTP deploys). If a send fails, the real
reason (auth failure, rejected recipient, connection timeout, etc.) is
written to the PHP error log via `$mail->ErrorInfo` — check that log if
inquiries stop arriving. To update PHPMailer later, download a newer tagged
release from GitHub and replace the 3 files in `server/PHPMailer/src/`.

## Deploying to Hostinger (shared hosting)

Upload the whole project folder to `public_html` (or a subfolder, if the
site lives at a sub-path) via FTP or the hPanel file manager — the paths in
`index.html` are all relative, so no config changes are needed. Make sure
`server/.env` is uploaded too (it's excluded from git on purpose, so it
won't come through if you deploy via git — upload it separately).

## About `_archive/`

The site was originally built and edited in Claude Design, which uses its
own component format (`.dc.html` files) and a runtime that loads React and
Babel live from a CDN to render them in the browser. That's fine for
editing, but not something you want a production visitor's browser doing on
every page load — and it doesn't work at all if that CDN is unreachable.
`index.html` + `public/` above is a hand-converted, dependency-free version
of the same design and content. The original `.dc.html` source, its runtime
scripts, and the old "Standalone" export are kept in `_archive/` in case you
want to go back into Claude Design and continue editing there — they are
not referenced by the deployed site and can be deleted at any time.
