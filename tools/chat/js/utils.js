// ── HTML escape ───────────────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Scroll / resize helpers ───────────────────────────────────────────
function scrollBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function autoResize() {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 200) + "px";
}

// ── Toast notification ────────────────────────────────────────────────
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 5000);
}

// ── Markdown renderer ─────────────────────────────────────────────────
function toHTML(t) {
  let h = esc(t);
  h = h.replace(/```(\w*)\n([\s\S]*?)```/g, (_, l, c) => `<pre><code class="lang-${l}">${c}</code></pre>`);
  h = h.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  h = h.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/\*(.+?)\*/g,     "<em>$1</em>");
  h = h.replace(/^### (.+)$/gm, "<h4 style='margin:9px 0 3px;font-size:14px'>$1</h4>");
  h = h.replace(/^## (.+)$/gm,  "<h3 style='margin:11px 0 4px;font-size:16px'>$1</h3>");
  h = h.replace(/^# (.+)$/gm,   "<h2 style='margin:13px 0 5px;font-size:18px'>$1</h2>");
  h = h.replace(/^\- (.+)$/gm,  "<li style='margin-left:18px;list-style:disc'>$1</li>");
  h = h.replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, m => `<ul style='margin:5px 0'>${m}</ul>`);
  h = h.replace(/^---$/gm, "<hr style='border:none;border-top:1px solid #333;margin:10px 0'>");
  h = h.replace(/\n/g, "<br>");
  return h;
}

// ── Reasoning block HTML ──────────────────────────────────────────────
function thinkHTML(text) {
  return `<div class="think-block">
    <div class="think-header" onclick="this.nextElementSibling.classList.toggle('hidden')">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
      Reasoning
    </div>
    <div class="think-body">${esc(text)}</div>
  </div>`;
}

// ── Wire copy buttons onto <pre> code blocks ──────────────────────────
function wireCopy(root) {
  root.querySelectorAll("pre").forEach(pre => {
    if (pre.querySelector(".copy-btn")) return;
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.onclick = () => {
      navigator.clipboard.writeText(pre.querySelector("code")?.textContent || pre.textContent);
      btn.textContent = "Copied!";
      setTimeout(() => btn.textContent = "Copy", 1500);
    };
    pre.appendChild(btn);
  });
}
