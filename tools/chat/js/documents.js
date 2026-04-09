// ── Icon by file extension ────────────────────────────────────────────
function docIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf')  return '&#x1F4D5;';
  if (['doc', 'docx'].includes(ext)) return '&#x1F4C4;';
  if (['xls', 'xlsx'].includes(ext)) return '&#x1F4CA;';
  return '&#x1F4CB;';
}

// ── Document context management ───────────────────────────────────────
function addDocumentContext(name, text) {
  if (documentContext.find(d => d.name === name)) {
    showToast(`"${name}" is already loaded.`);
    return;
  }
  const truncated = text.length > MAX_DOC_CHARS;
  documentContext.push({ name, text: text.slice(0, MAX_DOC_CHARS) });
  if (truncated) showToast(`"${name}" is large — using first ${MAX_DOC_CHARS.toLocaleString()} characters.`);
  refreshDocUI();
}

function removeDocument(name) {
  documentContext = documentContext.filter(d => d.name !== name);
  refreshDocUI();
}

function clearAllDocuments() {
  documentContext = [];
  refreshDocUI();
}

function refreshDocUI() {
  const banner = $("doc-mode-banner");
  const chips  = $("doc-chips");
  if (!documentContext.length) {
    banner.classList.remove("on");
    chips.innerHTML = "";
    buildSuggestions();
    return;
  }
  banner.classList.add("on");
  const names = documentContext.map(d => d.name);
  $("banner-doc-name").textContent =
    names.length === 1 ? names[0] : `${names.length} documents`;
  chips.innerHTML = documentContext.map(d =>
    `<div class="doc-chip" data-name="${esc(d.name)}">
      <span class="doc-chip-icon">${docIcon(d.name)}</span>
      <span class="doc-chip-name" title="${esc(d.name)}">${esc(d.name)}</span>
      <button class="doc-chip-del" title="Remove">&#x2715;</button>
    </div>`
  ).join("");
  chips.querySelectorAll(".doc-chip-del").forEach(btn => {
    btn.onclick = () => removeDocument(btn.closest(".doc-chip").dataset.name);
  });
  document.querySelector("#welcome p").textContent =
    names.length === 1
      ? `Ask anything about \u201C${names[0]}\u201D \u2014 Aion will answer based on the document.`
      : `Ask anything about your ${names.length} documents \u2014 Aion will answer based on them.`;
}

// ── FileReader helpers ────────────────────────────────────────────────
function readFileAsArrayBuffer(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload  = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsArrayBuffer(file);
  });
}

function readFileAsText(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload  = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsText(file);
  });
}

// ── Text extraction per format ────────────────────────────────────────
async function extractDocument(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    if (typeof pdfjsLib === 'undefined') throw new Error('PDF.js failed to load — check your internet connection.');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const buf = await readFileAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page    = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(s => s.str).join(' ') + '\n';
    }
    return text.trim();
  }

  if (ext === 'docx') {
    if (typeof mammoth === 'undefined') throw new Error('mammoth.js failed to load — check your internet connection.');
    const buf    = await readFileAsArrayBuffer(file);
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value.trim();
  }

  if (ext === 'doc') {
    throw new Error('.doc (old Word format) is not supported. Please save the file as .docx and try again.');
  }

  if (ext === 'xlsx' || ext === 'xls') {
    if (typeof XLSX === 'undefined') throw new Error('SheetJS failed to load — check your internet connection.');
    const buf = await readFileAsArrayBuffer(file);
    const wb  = XLSX.read(buf, { type: 'array' });
    let text = '';
    wb.SheetNames.forEach(sheetName => {
      text += `=== Sheet: ${sheetName} ===\n`;
      text += XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]) + '\n';
    });
    return text.trim();
  }

  // txt, csv, md, log, etc.
  return (await readFileAsText(file)).trim();
}

// ── Upload handler ────────────────────────────────────────────────────
async function handleFileUpload(file) {
  const btn = $("upload-btn");
  btn.classList.add("loading"); btn.disabled = true;
  try {
    const text = await extractDocument(file);
    if (!text) { showToast('No readable text found in this file.'); return; }
    addDocumentContext(file.name, text);
  } catch (err) {
    showToast('Failed to read file: ' + (err.message || String(err)));
  } finally {
    btn.classList.remove("loading"); btn.disabled = false;
  }
}
