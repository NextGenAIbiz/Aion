# Aion 🧠

AI-powered toolkit for embedded systems and software development — pure static web app, no backend required.

---

## Features

- **AI Chat** — chat with multiple LLM models directly from the browser
- **Role selector** — switch between General, Embedded Automotive, and Cybersecurity personas
- **Model selector** — choose between DeepSeek R1, GPT-OSS 120B, and GPT-5 Mini
- **Knowledge-base mode** — upload documents (PDF, DOCX, XLSX, TXT, CSV…) and ask questions about them
- **Multi-document** — load several files at once; each gets its own chip
- **Streaming** — token-by-token streaming with think-chain reasoning display
- **Chat history** — sessions persisted in browser `localStorage`
- **Settings panel** — temperature and max-token sliders
- **No backend needed** — runs entirely in the browser; `serve.py` is only needed for local development

---

## Structure

```
Aion/
├── index.html                    ← Home dashboard
├── serve.py                      ← Local static server (stdlib only)
├── tools/
│   └── chat/
│       ├── index.html            ← Standalone chat UI
│       ├── css/
│       │   └── style.css         ← All styling
│       └── js/
│           ├── config.js         ← API endpoint, models, roles
│           ├── state.js          ← Global state + DOM references
│           ├── utils.js          ← Helpers: markdown, escape, toast
│           ├── sessions.js       ← Chat history, localStorage, rendering
│           ├── pickers.js        ← Role & model pill pickers
│           ├── documents.js      ← File upload & text extraction
│           ├── send.js           ← API call, streaming, think-tag parser
│           └── boot.js           ← App bootstrap / event wiring
├── .gitignore
└── README.md
```

---

## Quick Start (local)

**No installation required.** Python stdlib only.

```powershell
python serve.py
```

Browser opens automatically at **http://localhost:8080**.  
Navigate to the **AI Chat** card to start chatting.

---

## Configuration

Edit `tools/chat/js/config.js` to change the API endpoint, add models, or add roles:

```js
const API_BASE = "http://your-llm-server/v1";
const API_KEY  = "your-api-key";

const MODELS = {
  mymodel: {
    label:      "My Model",
    model_name: "model-id-on-server",
    stream:     true,
    reasoning:  "think_tags",   // or "reasoning_content" or null
  },
};
```

### Model flags

| Flag | Effect |
|---|---|
| `stream: true` | Use SSE streaming |
| `reasoning: "think_tags"` | Parse `<think>…</think>` blocks |
| `reasoning: "reasoning_content"` | Read `reasoning_content` field (non-stream) |
| `use_completion_tokens: true` | Send `max_completion_tokens` instead of `max_tokens` |
| `no_temperature: true` | Omit `temperature` from the request |

---

## Document Upload

Supported formats: **PDF**, **DOCX**, **XLSX / XLS**, **TXT**, **CSV**, **MD**, **LOG**

- Click the 📎 button or drag-and-drop files onto the input box
- Multiple files can be loaded at once — each appears as a chip
- The model answers **only from the document content**
- Remove individual files with ✕ on the chip, or clear all via the banner

---

## Deploying to GitHub Pages

1. Push the repo to GitHub
2. Go to **Settings → Pages → Source: main / root**
3. Update `API_BASE` in `js/config.js` to a **public HTTPS** endpoint

> ⚠️ The default API is on a private network (`10.x.x.x`). It must be exposed via HTTPS for GitHub Pages to reach it (browsers block HTTP calls from HTTPS pages).

---

## Adding a New Tool

1. Create `tools/<toolname>/index.html` (copy the chat structure as a template)
2. Add a card to `index.html` (the root dashboard)


| Key | What it does |
|-----|-------------|
| `label` | Display name in the UI |
| `model_name` | Model ID sent to the API |
| `stream` | `True` for streaming, `False` for single response |
| `reasoning` | `"think_tags"` (DeepSeek) or `"reasoning_content"` (GPT-OSS) |

No other files need changing — the UI picks up new models automatically.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Home dashboard |
| `GET` | `/tools/chat/` | Chat UI |
| `GET` | `/tools/chat/api/models` | List available models |
| `POST` | `/tools/chat/api/chat` | Stream a chat completion (SSE) |

---

## Adding a New Tool

1. Create `tools/<name>/` with `config.py`, `service.py`, `router.py`, `frontend/index.html`.
2. In `app.py`, import the router and add:
   ```python
   from tools.<name>.router import router as <name>_router
   app.include_router(<name>_router, prefix="/tools/<name>")
   ```
3. Add a card for the tool in `frontend/index.html`.

---

## Supported Models

---

## Supported Models

| Model | Key | Notes |
|-------|-----|-------|
| DeepSeek R1 | `deepseek` | Streaming, `<think>` reasoning blocks |
| GPT-OSS 120B | `gptoss` | Non-streaming, `reasoning_content` field |
| GPT-5 Mini | `gpt5mini` | Streaming, `<think>` reasoning blocks |

---

## Standards & Compliance

Tools are designed with awareness of:
- **MISRA-C:2012** and **AUTOSAR C++14** coding standards
- **ISO 26262** functional safety (ASIL A–D)
- **AUTOSAR Classic / Adaptive** architecture
- **ASPICE** process assessment

