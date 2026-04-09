// ── Runtime state ─────────────────────────────────────────────────────
let sessions        = [];
let activeId        = null;
let abortCtrl       = null;
let selectedModel   = Object.keys(MODELS)[0];
let selectedRole    = "automotive";
let documentContext = [];        // [{ name, text }] — knowledge-base documents
const MAX_DOC_CHARS = 60000;     // ~15k tokens — safe context window limit

// ── DOM references ────────────────────────────────────────────────────
const $          = id => document.getElementById(id);
const sidebar    = $("sidebar");
const histList   = $("history-list");
const titleEl    = $("chat-title");
const messagesEl = $("messages");
const welcomeEl  = $("welcome");
const sugGrid    = $("suggest-grid");
const inputEl    = $("user-input");
const sendBtn    = $("send-btn");
const stopBtn    = $("stop-btn");
const tempEl     = $("temp");
const tempValEl  = $("temp-val");
const tokensEl   = $("tokens");
const tokensValEl = $("tokens-val");
const toastEl    = $("toast");
