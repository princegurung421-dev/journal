"""
Prince's Learning Journal - Flask backend.

This single Flask app powers the whole Progressive Web App:
  * It serves every static file (HTML pages, CSS, JS, images, the PWA
    manifest and the service worker) from the project root.
  * It exposes a small JSON API used by the frontend to read, save and
    delete reflection entries, which are stored in backend/reflections.json.

Run locally:      python app.py      (then open http://localhost:8000)
Deploy:           import `app` from a WSGI file (see DEPLOYMENT.md for the
                  PythonAnywhere setup).
"""

import json
import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request, send_from_directory

# Project root = folder that contains this file (all the static assets live here).
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(PROJECT_ROOT, "backend", "reflections.json")

app = Flask(__name__, static_folder=None)


# --------------------------------------------------------------------------- #
# Data helpers
# --------------------------------------------------------------------------- #
def load_reflections():
    """Return the list of reflections, or an empty list if none/invalid."""
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def save_reflections(reflections):
    """Write the full reflections list back to disk."""
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(reflections, f, indent=4, ensure_ascii=False)


# --------------------------------------------------------------------------- #
# API routes
# --------------------------------------------------------------------------- #
@app.route("/api/reflections", methods=["GET"])
def get_reflections():
    """Return all reflections as JSON."""
    return jsonify(load_reflections())


@app.route("/api/save_reflection", methods=["POST"])
def save_reflection():
    """Add a new reflection to the top of the list."""
    entry = request.get_json(silent=True)
    if not entry or not entry.get("title"):
        return jsonify({"status": "error", "message": "Missing entry data"}), 400

    # Fill in fields the server is responsible for.
    now = datetime.now(timezone.utc)
    entry.setdefault("id", str(int(now.timestamp() * 1000)))
    entry.setdefault("timestamp", now.isoformat())
    entry.setdefault("date", now.strftime("%Y-%m-%d"))
    entry.setdefault("formatted_date", now.strftime("%B %d, %Y"))
    entry.setdefault("category", "General")
    entry.setdefault("learnings", [])

    reflections = load_reflections()
    reflections.insert(0, entry)
    save_reflections(reflections)
    return jsonify({"status": "success", "message": "Entry saved", "entry": entry})


@app.route("/api/delete_reflection", methods=["POST"])
def delete_reflection():
    """Delete a reflection by id. POST is used because some hosts block DELETE."""
    data = request.get_json(silent=True) or {}
    entry_id = data.get("id")
    if entry_id is None:
        return jsonify({"status": "error", "message": "No ID provided"}), 400

    reflections = load_reflections()
    remaining = [r for r in reflections if str(r.get("id")) != str(entry_id)]

    if len(remaining) == len(reflections):
        return jsonify({"status": "error", "message": "Entry not found"}), 404

    save_reflections(remaining)
    return jsonify({"status": "success", "message": "Entry deleted"})


# --------------------------------------------------------------------------- #
# Static file routes (serve the PWA itself)
# --------------------------------------------------------------------------- #
@app.route("/")
def home():
    return send_from_directory(PROJECT_ROOT, "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    """
    Serve any other project file (pages, css, js, images, manifest, sw.js).
    The service worker must be served from the root so it can control the
    whole site scope - this route handles that automatically.
    """
    return send_from_directory(PROJECT_ROOT, filename)


if __name__ == "__main__":
    print("Starting Learning Journal (Flask) on http://localhost:8000 ...")
    app.run(host="0.0.0.0", port=8000, debug=True)
