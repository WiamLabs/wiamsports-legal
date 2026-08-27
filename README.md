WiamArena public host. GitHub Pages → https://wiamarena.com

- **/** — Wiam Engines brochure (Free key by email)
- **/legal** — Privacy and Terms (Telegram product). Do not name Render or Supabase on legal pages.

DNS (registrar for wiamarena.com):

Apex (wiamarena.com) — A records to GitHub Pages:
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153

www — CNAME to `wiamlabs.github.io`, DNS only (grey cloud).

Then in GitHub → wiamsports-legal → Settings → Pages → Custom domain: `wiamarena.com` (enforce HTTPS).

Get-key posts to the live `/v1` app (`config.js`). After a custom API host exists, change that file to `https://api.wiamarena.com`.
