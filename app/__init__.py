from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

from app.youtube.search import search_youtube


def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.get("/")
    def home():
        return render_template("index.html")

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "service": "Voice2Tube"})

    @app.post("/api/search")
    def search():
        payload = request.get_json(silent=True) or {}
        query = str(payload.get("query", "")).strip()

        if not query:
            return jsonify({"success": False, "message": "Enter or say what you want to watch."}), 400
        if len(query) > 200:
            return jsonify({"success": False, "message": "Search query is too long (maximum 200 characters)."}), 400

        try:
            result = search_youtube(query)
            if not result:
                return jsonify({"success": False, "message": "No video found. Try a different search."}), 404
            return jsonify({"success": True, "video": result, "query": query})
        except Exception:
            app.logger.exception("YouTube search failed")
            return jsonify({"success": False, "message": "YouTube search is temporarily unavailable. Please try again."}), 502

    return app
