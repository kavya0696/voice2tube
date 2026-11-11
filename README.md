# Voice2Tube — Voice Controlled YouTube & Gmail Assistant

Voice2Tube is a Flask-based voice assistant built from the original `agent` project. It keeps the original YouTube playback and Gmail email-drafting modules, with a refreshed, responsive interface.

## Features

- Voice commands using the browser's Web Speech API.
- Text command input as an alternative to speaking.
- YouTube song/video search with direct playback navigation.
- Gmail email drafting with Gemini AI.
- Review and edit the generated email before opening it in Gmail.
- Responsive pastel lavender and peach interface with a recent-search sidebar.

## Example commands

- `Play Believer by Imagine Dragons`
- `Play lo-fi music`
- `Create an email to professor@example.com asking for an assignment extension`

For Gmail, mention **email**, **mail**, or **Gmail** in the command. For YouTube, you can type a song/video name or say a command such as **play [name]**.

## Tech stack

- Frontend: HTML, CSS and vanilla JavaScript.
- Backend: Python 3.11+, Flask and Flask-CORS.
- YouTube: public YouTube search page lookup and embedded playback URL.
- Email generation: Google Gemini API.
- Deployment: Gunicorn; compatible with Render Web Services.

## Run locally (Windows PowerShell)

From the project folder:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Set the Gemini API key in the current PowerShell session (required for email generation):

```powershell
$env:GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
```

Optional model setting:

```powershell
$env:GEMINI_MODEL = "gemini-3.6-flash"
```

Start the app:

```powershell
python -m flask --app wsgi:app run --debug
```

Open http://127.0.0.1:5000 in Chrome or Edge. Allow microphone permission for voice commands. Text commands work without microphone permission.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | For Gmail email drafting | Google Gemini API key |
| `GEMINI_MODEL` | No | Gemini model name; defaults to `gemini-3.6-flash` |

Never commit real API keys. Use Render's Environment settings for deployed secrets.

## API endpoints

- `GET /` — assistant interface.
- `GET /health` — health check.
- `POST /youtube/play` — accepts JSON `{"command":"play a song"}` and returns a YouTube playback URL.
- `POST /agent` — accepts JSON `{"command":"create email ..."}` and returns an editable email draft.

## Deploy the live application

**GitHub Pages cannot host this application.** Voice2Tube uses a Python Flask backend, and GitHub Pages only serves static files; it cannot run Python server-side code. The `github.io` URL may therefore show this README instead of the working application.

This repository now includes a `render.yaml` Blueprint for deployment on Render:

1. Sign in to [Render](https://render.com/) and choose **New + → Blueprint**.
2. Connect the GitHub account and select `kavya0696/voice2tube`.
3. Render reads `render.yaml` and configures the Flask web service.
4. In the service's Environment settings, add `GEMINI_API_KEY` with your own Gemini API key. Keep it secret; do not commit it to GitHub.
5. Deploy the service and wait for the deployment to finish.
6. Open the generated `https://voice2tube.onrender.com`-style URL shown by Render (the exact URL is assigned by Render).

Use that Render URL as your **live project/demo link**. Keep the GitHub repository URL as your **source-code link**. The app's microphone, Flask routes, YouTube lookup and Gmail drafting need the Flask service running.

## Browser and service notes

- Voice input uses the browser Web Speech API. Use the latest Chrome or Edge, allow microphone access for the site, and keep an internet connection available for browser speech recognition. The app displays specific messages for blocked permission, missing microphone, network errors, and unsupported browsers.
- Text commands are available if speech recognition is unavailable.
- YouTube lookup uses the original project's public search-page parsing approach; it may be affected by YouTube page changes or request restrictions.
- Gmail draft generation requires a valid Gemini API key and internet access.
- Opening Gmail or YouTube may require the browser to allow pop-ups.
- The assistant prepares an email draft and opens Gmail with the draft details; the user reviews and sends it manually.

## Project scope

This version retains the original Flask routes and YouTube/Gmail service modules. The presentation layer has been refreshed and a typed-command entry point has been added. The original `agent` repository remains separate.
