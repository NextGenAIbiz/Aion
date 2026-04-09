// ── Application bootstrap ─────────────────────────────────────────────
(() => {
  buildModelPicker();
  buildRolePicker();
  buildSuggestions();
  loadSessions();
  startNewChat();

  // Sidebar
  $("toggle-sidebar").onclick = () => sidebar.classList.toggle("collapsed");
  $("close-sidebar").onclick  = () => sidebar.classList.add("collapsed");
  $("new-chat-btn").onclick   = startNewChat;

  // Input
  sendBtn.onclick = sendMessage;
  stopBtn.onclick = () => abortCtrl?.abort();
  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  inputEl.addEventListener("input", autoResize);

  // Settings sliders
  tempEl.oninput   = () => tempValEl.textContent   = (+tempEl.value).toFixed(2);
  tokensEl.oninput = () => tokensValEl.textContent = tokensEl.value;

  // Settings panel
  const settingsPanel   = $("settings-panel");
  const settingsOverlay = $("settings-overlay");
  const openSettings    = () => { settingsPanel.classList.add("open"); settingsOverlay.classList.add("open"); };
  const closeSettings   = () => { settingsPanel.classList.remove("open"); settingsOverlay.classList.remove("open"); };
  $("gear-btn").onclick        = openSettings;
  $("close-settings").onclick  = closeSettings;
  settingsOverlay.onclick      = closeSettings;

  // Document upload (click)
  const fileInput = $("file-input");
  $("upload-btn").onclick       = () => fileInput.click();
  $("banner-clear-btn").onclick = clearAllDocuments;
  fileInput.onchange = async e => {
    const files = Array.from(e.target.files);
    for (const file of files) await handleFileUpload(file);
    fileInput.value = "";
  };

  // Document upload (drag-and-drop)
  const inputWrap = $("input-wrap");
  inputWrap.addEventListener("dragover",  e => { e.preventDefault(); inputWrap.style.borderColor = "var(--accent)"; });
  inputWrap.addEventListener("dragleave", ()  => { inputWrap.style.borderColor = ""; });
  inputWrap.addEventListener("drop", async e => {
    e.preventDefault(); inputWrap.style.borderColor = "";
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) await handleFileUpload(file);
  });
})();
