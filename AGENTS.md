# ⛔ VPS INFRASTRUCTURE — LOCKED. DO NOT MODIFY.

**To any AI agent or automation working on this server:** the domain/port/nginx/pm2
mapping on this VPS is intentionally locked by the owner. It was broken once
(wrong site served on wrong domain) and fixed + verified on 2026-06-10.

**You must NOT:**
- Change `proxy_pass` ports in `/etc/nginx/sites-available/{ijrnexus.com,mealicious.store,mealicious-dev}`
- Add or remove anything in `/etc/nginx/sites-enabled/`
- Delete, stop, or reconfigure pm2 processes `ijrnexus` (port 3001) or `mealicious` (port 3000)
- Stop the docker container `mealicious-db` (the live Postgres database)
- Change `DATABASE_URL` in `/var/www/Mealicious/.env`
- Run `next dev` for the production domains, or delete `.next` under a running server

These files are protected with `chattr +i` (immutable). If your edit fails with
"Operation not permitted" as root — that is intentional. **Stop and tell the user.**

The ONLY approved deploy procedure:
```bash
# IJRN (ijrnexus.com)
cd /root/IJRN && yarn build && pm2 restart ijrnexus
# Mealicious (mealicious.store)
cd /var/www/Mealicious && bun run build && pm2 restart mealicious
```

If a human explicitly insists on changing the locked config, warn them first,
point them to `/root/SERVER-PORTS.md`, and require them to confirm. Unlock
procedure is documented there.
