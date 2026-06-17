# Deploying Geòlas to the Pi

This follows the conventions in `PI-INFRASTRUCTURE.md` and `GEOLAS_CLAUDE.md`.
Read both before running anything. Every command is a single self-contained
block (zsh-safe).

## The shape of it

- Geòlas runs as a uvicorn process bound to **127.0.0.1:8006** (internal only).
- It is exposed publicly as a **path handler `/geolas` on the shared 443 Funnel**,
  added with `--set-path` (which is *additive* — it leaves Ceòl's `/` and
  Òrain's `/orain` untouched). Geòlas does **not** get its own Funnel port; the
  three-port limit (443/8443/10000) is already full.
- Tailscale **strips** the `/geolas` prefix before proxying, so the backend
  sees plain paths (`/api/...`) and must **not** set `--root-path`. The frontend
  is already prefix-aware (all URLs relative), so it works at `/geolas/`.

## 0. Confirm port 8006 is actually free (don't trust the list)

The infra doc's first lesson is *trust running processes, not descriptions.*
Before binding 8006, check nothing is on it:

```
ssh pi@ceol-pi.local 'sudo ss -ltnp | grep -E ":8006|:8004|:8001|:8003" || echo "8006 appears free"'
```

If 8006 is taken, pick another free internal port and change it in BOTH
`geolas.service` and the Funnel command below.

## 1. Get the code onto the Pi

The repo is `https://github.com/glenachulish/geolas.git`. Push this project to
it from the Mac first (see "First push" at the bottom), then clone on the Pi:

```
ssh pi@ceol-pi.local 'git clone https://github.com/glenachulish/geolas.git ~/Geolas && cd ~/Geolas && git rev-parse --abbrev-ref HEAD'
```

(That last command prints the branch you're on — expected `main`. If it's
anything else, use that branch name in the update command at the bottom.)

## 2. Install dependencies (Pi quirks)

Pi OS Bookworm needs `--break-system-packages`. `pillow-heif` provides the
HEIC→JPEG conversion; if its wheel won't build, the app still runs and stores
HEIC as-is (it degrades gracefully — `/api/health` shows `heic_supported`).

```
ssh pi@ceol-pi.local 'cd ~/Geolas && pip install --break-system-packages --user -r requirements.txt && echo INSTALL_OK'
```

## 3. Install and start the service

```
ssh -t pi@ceol-pi.local 'sudo cp ~/Geolas/geolas.service /etc/systemd/system/geolas.service && sudo systemctl daemon-reload && sudo systemctl enable --now geolas && sleep 2 && systemctl is-active geolas'
```

Check it's healthy on localhost (prefix-naïve, so plain `/api/health`):

```
ssh pi@ceol-pi.local 'curl -s http://127.0.0.1:8006/api/health; echo'
```

Expect `{"ok":true,"app":"geolas",...}`.

## 4. Add the Funnel path handler (the careful step)

`--set-path` is additive, but ALWAYS curl the other apps immediately after, per
the infra doc. Add `--yes` to skip the confirm prompt.

```
ssh -t pi@ceol-pi.local 'sudo tailscale funnel --bg --https=443 --set-path=/geolas http://127.0.0.1:8006'
```

Then **verify nothing else broke** — check the handler map and curl the other
paths:

```
ssh pi@ceol-pi.local 'sudo tailscale serve status; echo "--- ceol ---"; curl -s -o /dev/null -w "%{http_code}\n" https://ceol-pi.tail01672f.ts.net/; echo "--- orain ---"; curl -s -o /dev/null -w "%{http_code}\n" https://ceol-pi.tail01672f.ts.net/orain/; echo "--- geolas ---"; curl -s -o /dev/null -w "%{http_code}\n" https://ceol-pi.tail01672f.ts.net/geolas/'
```

All three should return a healthy code (200/307/308). If any of the *other*
apps changed, something went wrong — see rollback below.

## 5. Open it

`https://ceol-pi.tail01672f.ts.net/geolas/` in a browser. Log a site, confirm
the BGS geology comes back, add a photo.

---

## Rollback / removal

Remove just the Geòlas path (leaves all other handlers intact):

```
ssh -t pi@ceol-pi.local 'sudo tailscale funnel --https=443 --set-path=/geolas off --yes'
```

Stop the service:

```
ssh -t pi@ceol-pi.local 'sudo systemctl disable --now geolas'
```

## Updating after a code change (standard deploy)

```
ssh -t pi@ceol-pi.local 'cd ~/Geolas && git pull && sudo systemctl restart geolas && systemctl is-active geolas'
```

## Logs

```
ssh pi@ceol-pi.local 'sudo journalctl -u geolas -n 50 --no-pager'
```

## First push (Mac → GitHub), one time

From the Mac project root, after unpacking the build into
`/Users/callummaclellan/Geolas`. The `data/` dir and vendored Leaflet are
handled by `.gitignore` (Leaflet is NOT ignored — it's vendored on purpose so
the Pi clone is self-contained; only `data/`, `.venv/`, caches are ignored).

```
cd /Users/callummaclellan/Geolas && git init && git add -A && git commit -m 'Geolas first build' && git branch -M main && git remote add origin https://github.com/glenachulish/geolas.git && git push -u origin main
```

If git rejects the push because the GitHub repo was created with a README/licence,
pull-rebase first: `git pull --rebase origin main` then push again.
