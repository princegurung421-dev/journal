# Deploying the Learning Journal to PythonAnywhere

This guide puts the **entire** app online — frontend **and** Flask backend **and**
the installable PWA — on a free PythonAnywhere account. This fixes the previous
submission where only the static journal was hosted.

> Why PythonAnywhere and not GitHub Pages? GitHub Pages can only host static
> files, so the Flask API (`/api/...`) does not run there. PythonAnywhere runs
> Python/Flask, and it serves over **HTTPS**, which browsers require before a
> PWA can be installed.

---

## Overview: how GitHub fits in

```
  Your PC  ──git push──►  GitHub (stores code)  ──git clone/pull──►  PythonAnywhere (runs Flask)  ──►  live HTTPS app
```

GitHub only **stores** the code. PythonAnywhere **downloads** that code from
GitHub and runs the Flask server. GitHub Pages is NOT used, because it cannot
run Python/Flask.

Your repository: **https://github.com/princegurung421-dev/journal**

---

## 1. Step A — Push the latest code to GitHub (on your own PC)

All the fixes live on your computer and must go to GitHub first. In a terminal
in the project folder:

```bash
cd /Users/prajwol/Documents/pwa/prince/journal
git add -A
git commit -m "Fix PWA install, add Flask backend, redesign UI, offline sync"
git push origin main
```

If `git push` asks for a username/password, GitHub no longer accepts your
account password there — create a **Personal Access Token**:
GitHub → *Settings → Developer settings → Personal access tokens → Tokens
(classic) → Generate new token → tick `repo`* → use the token as the password.
(Your repo is already set up with SSH, so a normal `git push` should just work.)

Confirm it worked: open https://github.com/princegurung421-dev/journal in a
browser and check that `app.py`, `manifest.json` and the new `images/icon-*.png`
files are there.

---

## 1. Step B — Clone the code onto PythonAnywhere

1. Log in to https://www.pythonanywhere.com (free "Beginner" account is fine).
2. Open a **Bash console** (Consoles tab → *Bash*).
3. Clone your repo (uses HTTPS — no SSH key needed on PythonAnywhere):

```bash
git clone https://github.com/princegurung421-dev/journal.git journal
```

Your files are now in `/home/YOUR_USERNAME/journal` (where `YOUR_USERNAME` is
your PythonAnywhere username, e.g. `princegurung421`).

> **Later, to publish changes:** push from your PC (`git push`), then on the
> PythonAnywhere Bash console run `cd ~/journal && git pull`, and click
> **Reload** on the Web tab. That is the whole update loop.

---

## 2. Install Flask

In a Bash console:

```bash
cd ~/journal
pip3 install --user -r requirements.txt
```

---

## 3. Create the web app

1. Go to the **Web** tab → **Add a new web app**.
2. Choose **Manual configuration** (NOT the "Flask" quick-start).
3. Pick **Python 3.10** (or the newest available).

---

## 4. Point the WSGI file at the app

On the **Web** tab, click the **WSGI configuration file** link and replace its
contents with:

```python
import sys

path = '/home/YOUR_USERNAME/journal'
if path not in sys.path:
    sys.path.insert(0, path)

from app import app as application
```

Replace `YOUR_USERNAME` with your PythonAnywhere username. Save.

---

## 5. Reload and open

Click the green **Reload** button on the Web tab, then open
`https://YOUR_USERNAME.pythonanywhere.com`.

Check:
- The journal, reflections, projects, about and game pages all load.
- Adding / deleting a reflection persists (it writes to `backend/reflections.json`).

> **Note on saving:** the free tier's file system is writable, so reflections
> save fine. If you ever redeploy by wiping the folder, back up
> `backend/reflections.json` first.

---

## 6. Capture the required PWA evidence (important for marks)

The previous feedback said there was *no screenshot showing the manifest or
install working*. Capture these on the **live HTTPS URL** in Chrome:

1. **Manifest loads** — DevTools (F12) → **Application → Manifest**. Screenshot
   the panel showing the name, icons and theme colour with **no errors**.
2. **Service worker active** — **Application → Service Workers**. Screenshot
   `sw.js` marked *activated and is running*.
3. **Install prompt** — click the install icon in the address bar (or
   ⋮ menu → *Install Prince's Learning Journal*). Screenshot the install dialog.
4. **Installed app window** — screenshot the app running in its own standalone
   window (no browser tabs/URL bar).
5. **Offline works** — DevTools → **Network → Offline**, reload the page, and
   screenshot it still loading.

Put these screenshots in the report next to the PWA section.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `ImportError: No module named app` | The `path` in the WSGI file must be the folder that contains `app.py`. |
| Install icon never appears | Must be HTTPS (PythonAnywhere is), manifest must load, and `sw.js` must be registered — check the Application tab. |
| Icons broken in manifest | Confirm `images/icon-192.png` and `images/icon-512.png` exist in the repo. |
| API returns 500 | Check the **Error log** on the Web tab; ensure `backend/reflections.json` exists and is valid JSON. |
