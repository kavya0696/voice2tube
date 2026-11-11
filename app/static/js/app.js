const $ = (selector) => document.querySelector(selector);
const micButton = $("#micButton");
const orbWrap = $("#orbWrap");
const voiceStatus = $("#voiceStatus");
const voiceHint = $("#voiceHint");
const queryInput = $("#queryInput");
const searchForm = $("#searchForm");
const languageSelect = $("#languageSelect");
const resultsSection = $("#resultsSection");
const historyView = $("#historyView");
const homeView = $("#homeView");
const toast = $("#toast");
const HISTORY_KEY = "voice2tube-history-v1";
let recognition = null;
let listening = false;
let toastTimer = null;

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
function setVoiceState(state, message, hint) {
  orbWrap.classList.toggle("listening", state === "listening");
  voiceStatus.textContent = message;
  voiceHint.textContent = hint || "";
}
function showHome() {
  homeView.classList.remove("hidden");
  historyView.classList.add("hidden");
  $("#crumbCurrent").textContent = "Home";
}
function showHistory() {
  homeView.classList.add("hidden");
  resultsSection.classList.add("hidden");
  historyView.classList.remove("hidden");
  $("#crumbCurrent").textContent = "Recent searches";
  renderHistory();
}
function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}
function saveHistory(query, video) {
  const items = getHistory().filter(item => item.query.toLowerCase() !== query.toLowerCase());
  items.unshift({ query, title: video.title, videoId: video.video_id, date: new Date().toISOString() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 12)));
}
function renderHistory() {
  const items = getHistory();
  const list = $("#historyList");
  list.innerHTML = "";
  $("#emptyHistory").classList.toggle("hidden", items.length > 0);
  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "history-item";
    const info = document.createElement("div");
    const title = document.createElement("div");
    title.className = "history-query";
    title.textContent = item.query;
    const date = document.createElement("div");
    date.className = "history-date";
    date.textContent = item.title || new Date(item.date).toLocaleString();
    info.append(title, date);
    const button = document.createElement("button");
    button.className = "history-play";
    button.textContent = "Search again ↗";
    button.addEventListener("click", () => { showHome(); queryInput.value = item.query; searchForVideo(item.query); });
    row.append(info, button);
    list.append(row);
  });
}
function showVideo(video, query) {
  $("#videoTitle").textContent = video.title || "YouTube video";
  $("#videoChannel").textContent = video.channel || "YouTube";
  $("#watchLink").href = video.watch_url;
  const frame = document.createElement("iframe");
  frame.src = video.embed_url;
  frame.title = video.title || "YouTube video";
  frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  frame.allowFullscreen = true;
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  const player = $("#playerWrap");
  player.replaceChildren(frame);
  resultsSection.classList.remove("hidden");
  saveHistory(query, video);
  window.scrollTo({ top: resultsSection.offsetTop - 25, behavior: "smooth" });
}
async function searchForVideo(rawQuery) {
  const query = rawQuery.trim();
  if (!query) { notify("Type or say something to search for."); queryInput.focus(); return; }
  if (listening && recognition) recognition.stop();
  setVoiceState("processing", "Finding your video…", "Searching YouTube");
  const submit = searchForm.querySelector("button");
  submit.disabled = true;
  submit.textContent = "Searching…";
  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Search failed.");
    showVideo(data.video, query);
    setVoiceState("idle", "Your video is ready", "Search again whenever you're ready.");
    notify("Found a video for you.");
  } catch (error) {
    setVoiceState("idle", "Couldn't find that video", "Try another phrase or check your connection.");
    notify(error.message || "Something went wrong. Please try again.");
  } finally {
    submit.disabled = false;
    submit.innerHTML = 'Search <span>↗</span>';
  }
}
function startVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    notify("Voice search is not supported in this browser. Try Chrome or Edge, or type your search.");
    return;
  }
  if (listening && recognition) { recognition.stop(); return; }
  recognition = new SpeechRecognition();
  recognition.lang = languageSelect.value;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => {
    listening = true;
    micButton.setAttribute("aria-label", "Stop voice search");
    setVoiceState("listening", "I'm listening…", "Speak clearly. Your words will appear in the search box.");
  };
  recognition.onresult = (event) => {
    let finalText = "";
    let interimText = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
      else interimText += event.results[i][0].transcript;
    }
    if (finalText) queryInput.value = finalText.trim();
    else if (interimText) queryInput.value = interimText.trim();
  };
  recognition.onerror = (event) => {
    const messages = {
      "not-allowed": "Microphone access is blocked. Allow it in your browser settings.",
      "no-speech": "I didn't hear anything. Please try again.",
      "audio-capture": "No microphone was detected.",
      "network": "Voice recognition needs an internet connection."
    };
    notify(messages[event.error] || "Voice recognition stopped. Please try again.");
  };
  recognition.onend = () => {
    listening = false;
    micButton.setAttribute("aria-label", "Start voice search");
    setVoiceState("idle", queryInput.value ? "Voice captured — ready to search" : "Tap the microphone to speak",
      queryInput.value ? "You can edit the words before searching." : "Try “Play lo-fi music” or “Find Python tutorials”");
  };
  try { recognition.start(); }
  catch { notify("Voice search couldn't start. Please try again."); }
}

micButton.addEventListener("click", startVoiceSearch);
searchForm.addEventListener("submit", event => { event.preventDefault(); searchForVideo(queryInput.value); });
document.querySelectorAll("[data-query]").forEach(button => button.addEventListener("click", () => {
  queryInput.value = button.dataset.query;
  searchForVideo(button.dataset.query);
}));
$("#homeNav").addEventListener("click", () => { showHome(); resultsSection.classList.add("hidden"); });
$("#historyNav").addEventListener("click", showHistory);
$("#newSearchButton").addEventListener("click", () => { resultsSection.classList.add("hidden"); queryInput.focus(); window.scrollTo({top:0,behavior:"smooth"}); });
$("#clearHistoryButton").addEventListener("click", () => { localStorage.removeItem(HISTORY_KEY); renderHistory(); notify("Search history cleared."); });
$("#historyHomeButton").addEventListener("click", () => { showHome(); queryInput.focus(); });
