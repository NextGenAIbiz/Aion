// ── Send a message to the LLM ─────────────────────────────────────────
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || abortCtrl) return;
  const session = activeSession(); if (!session) return;

  session.messages.push({ role: "user", content: text });
  if (session.messages.length === 1) session.title = text.slice(0, 44) + (text.length > 44 ? "…" : "");
  inputEl.value = ""; autoResize(); saveSessions(); renderHistory();
  titleEl.textContent = session.title;
  addMsgDOM("user", text, null, false); scrollBottom();

  const botRow   = addMsgDOM("assistant", "", null, true);
  const bubbleEl = botRow.querySelector(".bubble");
  const bodyEl   = botRow.querySelector(".msg-body");
  scrollBottom();

  sendBtn.disabled = true; stopBtn.classList.add("on");
  abortCtrl = new AbortController();

  const cfg = MODELS[selectedModel];
  let fullContent = "", reasoning = "", reasonDiv = null;

  // ── Think-tag state machine ───────────────────────────────────────
  // Handles <think>…</think> blocks that may span multiple SSE chunks.
  let tkState = "normal"; // "normal" | "think"
  let tkBuf   = "";       // partial-tag guard buffer

  function updateBubble() {
    bubbleEl.innerHTML = toHTML(fullContent) + '<span class="cursor"></span>';
    wireCopy(bubbleEl); scrollBottom();
  }

  function updateThink(text) {
    reasoning = text;
    if (!reasonDiv) {
      const rb = document.createElement("div");
      rb.innerHTML = thinkHTML(""); bodyEl.insertBefore(rb.firstElementChild, bubbleEl);
      reasonDiv = bodyEl.querySelector(".think-body");
    }
    reasonDiv.textContent = reasoning; scrollBottom();
  }

  function feedToken(tok) {
    tkBuf += tok;
    let changed = true;
    while (changed) {
      changed = false;
      if (tkState === "normal") {
        const idx = tkBuf.indexOf("<think>");
        if (idx === -1) {
          const safe = tkBuf.length > 6 ? tkBuf.slice(0, -6) : "";
          if (safe) { fullContent += safe; updateBubble(); tkBuf = tkBuf.slice(safe.length); changed = true; }
          if (!tkBuf.includes("<") && tkBuf.length > 0) { fullContent += tkBuf; updateBubble(); tkBuf = ""; changed = true; }
        } else {
          if (idx > 0) { fullContent += tkBuf.slice(0, idx); updateBubble(); }
          tkBuf = tkBuf.slice(idx + 7); // skip '<think>'
          tkState = "think"; changed = true;
        }
      } else {
        const idx = tkBuf.indexOf("</think>");
        if (idx === -1) {
          const safe = tkBuf.length > 8 ? tkBuf.slice(0, -8) : "";
          if (safe) { reasoning += safe; updateThink(reasoning); tkBuf = tkBuf.slice(safe.length); changed = true; }
          if (!tkBuf.includes("<") && tkBuf.length > 0) { reasoning += tkBuf; updateThink(reasoning); tkBuf = ""; changed = true; }
        } else {
          reasoning += tkBuf.slice(0, idx);
          updateThink(reasoning);
          tkBuf = tkBuf.slice(idx + 8); // skip '</think>'
          tkState = "normal"; changed = true;
        }
      }
    }
  }

  function flushTkBuf() {
    if (tkState === "think") { if (tkBuf) { reasoning += tkBuf; updateThink(reasoning); } }
    else                     { if (tkBuf) { fullContent += tkBuf; } }
    tkBuf = "";
  }

  // ── Build system prompt ───────────────────────────────────────────
  const baseSystem = (ROLES[selectedRole] || ROLES.general).system;
  const SYSTEM_PROMPT = {
    role: "system",
    content: documentContext.length
      ? baseSystem +
        `\n\nThe user has uploaded ${documentContext.length} document(s) for reference. Answer questions based ONLY on the content of these documents. If the answer is not found in the documents, say so clearly.\n\n` +
        documentContext.map(d =>
          `--- DOCUMENT: ${d.name} ---\n${d.text}\n--- END: ${d.name} ---`
        ).join("\n\n")
      : baseSystem,
  };

  // ── API call ──────────────────────────────────────────────────────
  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model:    cfg.model_name,
        messages: [SYSTEM_PROMPT, ...session.messages.map(m => ({ role: m.role, content: m.content }))],
        ...(cfg.no_temperature ? {} : { temperature: +tempEl.value }),
        ...(cfg.use_completion_tokens
          ? { max_completion_tokens: +tokensEl.value }
          : { max_tokens:            +tokensEl.value }),
        stream: cfg.stream,
      }),
      signal: abortCtrl.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}${errText ? ": " + errText.slice(0, 200) : ""}`);
    }

    if (cfg.stream) {
      // ── Streaming path (SSE) ──────────────────────────────────────
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") { buf = ""; break; }
          let obj; try { obj = JSON.parse(raw); } catch { continue; }
          const tok = obj?.choices?.[0]?.delta?.content || "";
          if (!tok) continue;
          cfg.reasoning === "think_tags" ? feedToken(tok) : (fullContent += tok, updateBubble());
        }
      }
      flushTkBuf();

    } else {
      // ── Non-streaming path ────────────────────────────────────────
      const data = await res.json();
      const msg  = data?.choices?.[0]?.message || {};
      if (cfg.reasoning === "reasoning_content") {
        const r = msg.reasoning_content || "";
        if (r) updateThink(r);
      }
      fullContent = msg.content || "";
    }

  } catch (err) {
    if (err.name !== "AbortError") {
      const msg = err.message || String(err);
      showToast(msg.startsWith("HTTP") ? msg : "Error: " + msg);
      fullContent = fullContent || "\u26A0\uFE0F " + (err.message || "Unknown error");
    }
  }

  // ── Finalize bot message ──────────────────────────────────────────
  bubbleEl.innerHTML = toHTML(fullContent || "*(no response)*");
  wireCopy(bubbleEl);
  session.messages.push({ role: "assistant", content: fullContent, reasoning });
  saveSessions();
  abortCtrl = null; sendBtn.disabled = false; stopBtn.classList.remove("on");
  scrollBottom();
}
