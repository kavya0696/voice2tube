"""Lightweight YouTube search with an optional official Data API integration.

Set YOUTUBE_API_KEY to use YouTube Data API v3. Without a key, the app
uses YouTube's public search results page as a best-effort fallback.
"""
import html
import json
import os
import re
import urllib.parse
import urllib.request


def _from_video_url(query):
    patterns = [
        r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, query)
        if match:
            video_id = match.group(1)
            return {
                "video_id": video_id,
                "title": "YouTube video",
                "channel": "YouTube",
                "thumbnail": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
                "watch_url": f"https://www.youtube.com/watch?v={video_id}",
                "embed_url": f"https://www.youtube-nocookie.com/embed/{video_id}?autoplay=1&rel=0",
            }
    return None


def _search_data_api(query, api_key):
    params = urllib.parse.urlencode({
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 1,
        "key": api_key,
    })
    url = "https://www.googleapis.com/youtube/v3/search?" + params
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "Voice2Tube/1.0"})
    with urllib.request.urlopen(req, timeout=8) as response:
        payload = json.loads(response.read().decode("utf-8"))
    items = payload.get("items", [])
    if not items:
        return None
    item = items[0]
    video_id = item.get("id", {}).get("videoId")
    snippet = item.get("snippet", {})
    if not video_id:
        return None
    return _video_result(video_id, snippet.get("title", "YouTube video"),
                         snippet.get("channelTitle", "YouTube"),
                         snippet.get("thumbnails", {}).get("high", {}).get("url"))


def _video_result(video_id, title, channel, thumbnail=None):
    return {
        "video_id": video_id,
        "title": html.unescape(title or "YouTube video"),
        "channel": html.unescape(channel or "YouTube"),
        "thumbnail": thumbnail or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
        "watch_url": f"https://www.youtube.com/watch?v={video_id}",
        "embed_url": f"https://www.youtube-nocookie.com/embed/{video_id}?autoplay=1&rel=0",
    }


def _search_public_page(query):
    url = "https://www.youtube.com/results?" + urllib.parse.urlencode({"search_query": query})
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    })
    with urllib.request.urlopen(req, timeout=8) as response:
        page = response.read().decode("utf-8", errors="ignore")

    match = re.search(r'"videoRenderer":\{.*?"videoId":"([A-Za-z0-9_-]{11})".*?"title":\{"runs":\[\{"text":"(.*?)"\}\]', page)
    if not match:
        # Fallback for YouTube page variants where title metadata is arranged differently.
        id_match = re.search(r'"videoId":"([A-Za-z0-9_-]{11})"', page)
        if not id_match:
            return None
        return _video_result(id_match.group(1), query, "YouTube")

    video_id, raw_title = match.groups()
    title = bytes(raw_title, "utf-8").decode("unicode_escape", errors="ignore")
    return _video_result(video_id, title, "YouTube")


def search_youtube(query):
    direct = _from_video_url(query)
    if direct:
        return direct

    api_key = os.getenv("YOUTUBE_API_KEY", "").strip()
    if api_key:
        return _search_data_api(query, api_key)
    return _search_public_page(query)
