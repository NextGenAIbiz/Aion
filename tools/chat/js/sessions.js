// ── Persist sessions to localStorage ─────────────────────────────────
function loadSessions() {
  try { sessions = JSON.parse(localStorage.getItem("aion_chat_sessions") || "[]"); } catch { sessions = []; }
  renderHistory();
}

function saveSessions() {
  try { localStorage.setItem("aion_chat_sessions", JSON.stringify(sessions)); } catch {}
}

function activeSession() {
  return sessions.find(s => s.id === activeId);
}

// ── Chat lifecycle ────────────────────────────────────────────────────
function startNewChat() {
  const id = crypto.randomUUID();
  sessions.unshift({ id, title: "New Chat", messages: [] });
  activeId = id;
  saveSessions(); renderHistory(); renderThread();
}

function switchChat(id) {
  activeId = id;
  renderHistory();
  renderThread();
}

function deleteChat(id) {
  sessions = sessions.filter(s => s.id !== id);
  if (activeId === id) {
    sessions.length ? (activeId = sessions[0].id) : startNewChat();
  }
  saveSessions(); renderHistory();
  if (sessions.length) renderThread();
}

// ── Sidebar history list ──────────────────────────────────────────────
function renderHistory() {
  histList.innerHTML = "";
  sessions.forEach(s => {
    const el = document.createElement("div");
    el.className = "hist-item" + (s.id === activeId ? " active" : "");
    el.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span class="hist-title">${esc(s.title)}</span>
      <button class="hist-del" title="Delete">&#x2715;</button>`;
    el.querySelector(".hist-title").onclick = () => switchChat(s.id);
    el.onclick = e => { if (!e.target.classList.contains("hist-del")) switchChat(s.id); };
    el.querySelector(".hist-del").onclick = e => { e.stopPropagation(); deleteChat(s.id); };
    histList.appendChild(el);
  });
}

// ── Message thread rendering ──────────────────────────────────────────
function renderThread() {
  const s = activeSession(); if (!s) return;
  titleEl.textContent = s.title;
  if (!s.messages.length) {
    messagesEl.innerHTML = "";
    welcomeEl.style.display = "flex";
    messagesEl.appendChild(welcomeEl);
    return;
  }
  welcomeEl.style.display = "none";
  messagesEl.innerHTML = "";
  s.messages.forEach(m => addMsgDOM(m.role, m.content, m.reasoning, false));
  scrollBottom();
}

function addMsgDOM(role, content, reasoning, animate) {
  if (welcomeEl.parentNode === messagesEl) messagesEl.removeChild(welcomeEl);
  const isUser = role === "user";
  const row = document.createElement("div");
  row.className = "msg-row";
  row.innerHTML = `
    <div class="avatar ${isUser ? "user" : "bot"}">${isUser ? "U" : "AI"}</div>
    <div class="msg-body">
      <div class="msg-role">${isUser ? "You" : "Aion"}</div>
      ${reasoning ? thinkHTML(reasoning) : ""}
      <div class="bubble">${isUser ? esc(content) : toHTML(content)}${animate ? '<span class="cursor"></span>' : ""}</div>
    </div>`;
  wireCopy(row);
  messagesEl.appendChild(row);
  return row;
}

// ── Welcome suggestion cards ──────────────────────────────────────────
function buildSuggestions() {
  const role = ROLES[selectedRole] || ROLES.general;
  document.querySelector("#welcome p").textContent = role.desc + " — powered by Aion.";
  sugGrid.innerHTML = role.suggestions.map(s =>
    `<div class="suggest-card" data-text="${esc(s.text)}">
      <strong>${esc(s.title)}</strong>${esc(s.text.slice(0, 56))}&#x2026;
    </div>`).join("");
  sugGrid.querySelectorAll(".suggest-card").forEach(c =>
    c.addEventListener("click", () => { inputEl.value = c.dataset.text; autoResize(); sendMessage(); })
  );
}
