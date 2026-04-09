// ── Role picker pill ──────────────────────────────────────────────────
function buildRolePicker() {
  const dropdown = $("role-pill-dropdown");
  const btnLabel = $("role-pill-label");
  const btnIcon  = $("role-pill-icon");
  const btn      = $("role-pill-btn");

  function closeDropdown() {
    dropdown.classList.remove("open");
    btn.classList.remove("open");
  }

  function selectRole(key) {
    selectedRole = key;
    const role = ROLES[key];
    btnLabel.textContent = role.label;
    btnIcon.innerHTML    = role.icon;
    dropdown.querySelectorAll(".model-card").forEach(c =>
      c.classList.toggle("active", c.dataset.role === key));
    buildSuggestions();
    closeDropdown();
  }

  dropdown.innerHTML = Object.entries(ROLES).map(([k, v]) =>
    `<div class="model-card${k === selectedRole ? " active" : ""}" data-role="${k}">
      <div class="model-card-icon">${v.icon}</div>
      <div class="model-card-info">
        <div class="model-card-name">${esc(v.label)}</div>
        <div class="model-card-meta">${esc(v.desc)}</div>
      </div>
      <span class="model-card-check">&#x2713;</span>
    </div>`
  ).join("");

  dropdown.querySelectorAll(".model-card").forEach(card => {
    card.onclick = () => selectRole(card.dataset.role);
  });

  const initRole = ROLES[selectedRole];
  btnLabel.textContent = initRole.label;
  btnIcon.innerHTML    = initRole.icon;

  btn.onclick = e => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle("open");
    btn.classList.toggle("open", isOpen);
  };
  document.addEventListener("click", closeDropdown);
  dropdown.addEventListener("click", e => e.stopPropagation());
}

// ── Model picker pill ─────────────────────────────────────────────────
function buildModelPicker() {
  const dropdown = $("model-pill-dropdown");
  const btnLabel = $("model-pill-label");
  const btn      = $("model-pill-btn");

  function closeDropdown() {
    dropdown.classList.remove("open");
    btn.classList.remove("open");
  }

  function selectModel(key) {
    selectedModel = key;
    btnLabel.textContent = MODELS[key].label;
    dropdown.querySelectorAll(".model-card").forEach(c =>
      c.classList.toggle("active", c.dataset.key === key));
    closeDropdown();
  }

  dropdown.innerHTML = Object.entries(MODELS).map(([k, v]) => {
    const m = MODEL_META[k] || { icon: "&#x1F4AC;", meta: "" };
    return `<div class="model-card${k === selectedModel ? " active" : ""}" data-key="${k}">
      <div class="model-card-icon">${m.icon}</div>
      <div class="model-card-info">
        <div class="model-card-name">${esc(v.label)}</div>
        <div class="model-card-meta">${m.meta}</div>
      </div>
      <span class="model-card-check">&#x2713;</span>
    </div>`;
  }).join("");

  dropdown.querySelectorAll(".model-card").forEach(card => {
    card.onclick = () => selectModel(card.dataset.key);
  });

  btnLabel.textContent = MODELS[selectedModel].label;

  btn.onclick = e => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle("open");
    btn.classList.toggle("open", isOpen);
  };
  document.addEventListener("click", closeDropdown);
  dropdown.addEventListener("click", e => e.stopPropagation());
}
