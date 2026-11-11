# Voice2Tube — Voice Controlled YouTube Assistant

Voice2Tube is a focused YouTube assistant that lets you search by speaking or typing, preview the result in an embedded player, and revisit recent searches.

## Highlights

- Voice search using the browser Web Speech API.
- Editable speech transcript before submitting a search.
- Text-based search as a fallback.
- Language selector for English (India/US), Hindi, Tamil, Telugu and Bengali (availability depends on the browser and operating system).
- Embedded privacy-enhanced YouTube player and a direct Watch on YouTube link.
- Recent searches stored locally in the browser, with replay and clear-history controls.
- Responsive dark, minimal-premium interface with subtle violet AI accents.
- Flask JSON API with input validation and a health endpoint.
- Optional YouTube Data API v3 integration using `YOUTUBE_API_KEY`.

## Tech stack

- Frontend: HTML5, CSS3, vanilla JavaScript (ES6), Fetch API and Web Speech API.
- Backend: Python 3.11+, Flask and Flask-CORS.
- Deployment: Gunicorn (Render-ready).

## Run locally (Windows PowerShell)

1. Open PowerShell in the project folder.
2. Create and activate a virtual environment:

   ```powershell
   py -3.11 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install dependencies:

   ```powershell
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Start the app:

   ```powershell
   python -m flask --app wsgi:app run --debug
   ```

5. Open http://127.0.0.1:5000 in Chrome or Edge. Allow microphone permission when prompted.

## Optional: YouTube Data API

For more consistent search results, create a YouTube Data API v3 key in Google Cloud Console, enable the YouTube Data API v3, and set `YOUTUBE_API_KEY` in your environment or hosting dashboard. Never commit a real API key.

PowerShell for the current terminal session:

```powershell
$env:YOUTUBE_API_KEY = "YOUR_API_KEY"
python -m flask --app wsgi:app run --debug
```

Without an API key, the app makes a best-effort request to YouTube's public search results page. YouTube may change or restrict this page, so the fallback is not guaranteed. The project does not use Gemini or claim to be an LLM-based video recommendation engine.

## API

### POST `/api/search`

Request:

```json
{ "query": "lofi music for studying" }
```

Success response contains `video_id`, `title`, `channel`, `thumbnail`, `watch_url`, and `embed_url`.

### GET `/health`

Returns service health status.

## Deploy to Render

1. Push this repository to GitHub.
2. In Render, create a **Web Service** connected to this repository.
3. Runtime: Python 3.
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn wsgi:app`
6. Optional environment variable: `YOUTUBE_API_KEY`.
7. Deploy. Render supplies the `PORT` environment variable; Gunicorn is configured by Render's web-service runtime.

## Browser notes

- Voice input requires a supported browser (typically Chrome or Edge) and microphone permission.
- Speech recognition support and language availability vary by browser and device.
- Voice recognition is handled by the browser's speech service; it is not an offline speech model.
- Recent searches stay in the current browser's local storage and are not synced to a server.
- YouTube playback may be affected by video owner embedding restrictions, regional availability, or browser autoplay policies.

## Project scope

This repository is the YouTube-only version of the original voice assistant. Gmail functionality has intentionally been excluded from the product interface and backend.
