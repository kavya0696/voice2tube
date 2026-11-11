# VoiceTube — Voice Controlled YouTube & Gmail Assistant

VoiceTube is a Flask-based voice assistant built from the original `agent` project. It keeps the original YouTube playback and Gmail email-drafting modules, with a refreshed, responsive interface.

## Features

- Voice commands using the browser's Web Speech API.
- Text command input as an alternative to speaking.
- YouTube song/video search and playback in a new browser tab.
- Gmail email drafting with Gemini AI.
- Review and edit the generated email before opening it in Gmail.
- Responsive dark interface with a restrained slate-blue accent palette.

## Example commands

- `Play Believer by Imagine Dragons`
- `Play lo-fi music`
- `Create an email to professor@example.com asking for an assignment extension`

For Gmail, include the words **create email** in the command. For YouTube, you can type a song/video name or say a command such as **play [name]**.

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

## Deploy to Render

1. Push this repository to GitHub.
2. Create a **Web Service** in Render and connect the repository.
3. Runtime: Python 3.
4. Build command: `pip install -r requirements.txt`.
5. Start command: `gunicorn wsgi:app`.
6. Add `GEMINI_API_KEY` in Render's Environment settings to enable email drafting.
7. Deploy and open the generated Render URL.

## Browser and service notes

- Voice input depends on browser support for Web Speech API and microphone permission. Chrome or Edge is recommended.
- Text commands are available if speech recognition is unavailable.
- YouTube lookup uses the original project's public search-page parsing approach; it may be affected by YouTube page changes or request restrictions.
- Gmail draft generation requires a valid Gemini API key and internet access.
- Opening Gmail or YouTube may require the browser to allow pop-ups.
- The assistant prepares an email draft and opens Gmail with the draft details; the user reviews and sends it manually.

## Project scope

This version retains the original Flask routes and YouTube/Gmail service modules. The presentation layer has been refreshed and a typed-command entry point has been added. The original `agent` repository remains separate.
