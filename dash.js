// admin.js (improved)
// Replaces previous IIFE. Keeps localStorage, pagination, mobile rendering.
// Uses Edit modal (existing) and new Delete modal (soft UI).
(function () {
  const STORAGE_KEY = "mixlab_admin_activity_v1";

  // Default data (kept)
  const defaultData = [
    { user: "Guitarkid01", lesson: "Chord Theory I Quiz", score: "+500 XP", time: "5 mins ago" },
    { user: "DrummerDude", lesson: "Percussion Rhythms Module", score: "Completed", time: "1 hour ago" },
    { user: "PianoProdigy", lesson: "Melody Composition Quest", score: "+1200 XP", time: "3 hours ago" },
    { user: "BassBoss", lesson: "Basslines 101", score: "+300 XP", time: "2 days ago" },
    { user: "SynthSam", lesson: "Synth Patch Design", score: "Completed", time: "4 hours ago" },
    { user: "VocalVera", lesson: "Vocal Warmups", score: "+150 XP", time: "30 mins ago" },
    { user: "LoopLord", lesson: "Looping Techniques", score: "+80 XP", time: "yesterday" },
    { user: "HarmonyHank", lesson: "Advanced Harmony", score: "+950 XP", time: "6 hours ago" },
    { user: "RhythmRita", lesson: "Polyrhythms Practice", score: "Completed", time: "2 hours ago" },
    { user: "KidCoder", lesson: "Music & Code Integration", score: "+60 XP", time: "3 days ago" },
    { user: "DJNova", lesson: "Mixing Basics", score: "+420 XP", time: "1 day ago" },
    { user: "SamplerSue", lesson: "Creative Sampling", score: "+200 XP", time: "5 hours ago" },
  ];

  // Elements
  const searchInput = document.getElementById("searchInput");
  const table = document.getElementById("activityTable");
  const tbody = table?.tBodies[0];
  const exportBtn = document.getElementById("exportCsvBtn");
  const statusFilter = document.getElementById("statusFilter");
  const pageSizeSelect = document.getElementById("pageSizeSelect");
  const paginationEl = document.getElementById("pagination");
  const runTestBtn = document.getElementById("runTestBtn");

  // Modals / Buttons
  const editModal = document.getElementById("editModal");
  const modalClose = editModal?.querySelector(".modal-close");
  const modalCancel = document.getElementById("modalCancel");
  const editForm = document.getElementById("editForm");
  const modalUser = document.getElementById("modalUser");
  const modalLesson = document.getElementById("modalLesson");
  const modalScore = document.getElementById("modalScore");

  // Delete modal (new)
  const deleteModal = createDeleteModal();
  document.body.appendChild(deleteModal.modalEl);
  const deleteConfirmBtn = deleteModal.confirmBtn;
  const deleteCancelBtn = deleteModal.cancelBtn;
  const deleteMessageEl = deleteModal.messageEl;

  // Sidebar collapse
  const sidebar = document.querySelector(".sidebar");
  const collapseBtn = document.querySelector(".collapse-btn");
  if (collapseBtn) collapseBtn.addEventListener("click", () => sidebar.classList.toggle("open"));

  // Responsive
  const MOBILE_WIDTH = 800;
  let isMobileView = window.innerWidth <= MOBILE_WIDTH;

  // State
  let data = load();
  let filtered = data.slice();
  let currentPage = 1;
  let pageSize = parseInt(pageSizeSelect?.value || "10", 10);

  // ---------- storage ----------
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Unable to save data:", err);
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse storage, loading defaults.");
    }
    return generateLargeSample();
  }

  function generateLargeSample() {
    const lessons = [
      "Chord Theory I Quiz", "Percussion Rhythms Module", "Melody Composition Quest",
      "Basslines 101", "Synth Patch Design", "Vocal Warmups", "Looping Techniques",
      "Advanced Harmony", "Polyrhythms Practice", "Music & Code Integration",
      "Mixing Basics", "Creative Sampling", "Songwriting Lab", "Stage Performance",
      "Ear Training", "Music Production Basics", "Sound Design", "Arrangement Tips"
    ];

    const nameSeeds = [
      "Aero", "Beat", "Chord", "Drum", "Echo", "Fret", "Groove", "Harmony",
      "Ion", "Jive", "Kick", "Loop", "Muse", "Nova", "Pulse", "Quint", "Riff", "Sync", "Tone", "Vibe"
    ];

    const base = defaultData.slice();
    const extra = [];
    const target = 60;

    for (let i = 0; i < target - base.length; i++) {
      const name = nameSeeds[i % nameSeeds.length] + (Math.floor(i / nameSeeds.length) + 1);
      const lesson = lessons[i % lessons.length];
      const isCompleted = i % 7 === 0;
      const xp = isCompleted ? "Completed" : "+" + ((i * 37) % 1300 + 20) + " XP";
      const times = ["now", "5 mins ago", "30 mins ago", "1 hour ago", "2 hours ago", "6 hours ago", "yesterday", "2 days ago", "3 days ago", "1 week ago"];
      const time = times[i % times.length];
      extra.push({ user: name, lesson, score: xp, time });
    }
    return base.concat(extra);
  }

  // ---------- utilities ----------
  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function debounce(fn, wait = 120) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // ---------- render ----------
  function renderTable() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const status = statusFilter?.value || "all";

    filtered = data.filter((r) => {
      const text = (r.user + " " + r.lesson + " " + r.score + " " + r.time).toLowerCase();
      if (q && !text.includes(q)) return false;
      if (status === "completed" && !r.score.toLowerCase().includes("completed")) return false;
      if (status === "xp" && !/\d+/.test(r.score)) return false;
      return true;
    });

    pageSize = parseInt(pageSizeSelect?.value || "10", 10);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    isMobileView = window.innerWidth <= MOBILE_WIDTH;
    const mobileListId = "mobileActivityList";
    let mobileList = document.getElementById(mobileListId);

    if (isMobileView) {
      table.style.display = "none";
      if (!mobileList) {
        mobileList = document.createElement("div");
        mobileList.id = mobileListId;
        mobileList.className = "mobile-list";
        table.parentNode.insertBefore(mobileList, table.nextSibling);
      }
      mobileList.innerHTML = "";
      pageRows.forEach((r) => {
        const idx = data.indexOf(r);
        const card = document.createElement("div");
        card.className = "mobile-card";
        card.dataset.index = idx;
        card.innerHTML = `
          <div class="mobile-card-top">
            <strong>${escapeHtml(r.user)}</strong>
            <small class="muted">${escapeHtml(r.time)}</small>
          </div>
          <div class="mobile-card-lesson">${escapeHtml(r.lesson)}</div>
          <div class="mobile-card-bottom">
            <span class="score">${escapeHtml(r.score)}</span>
            <span class="mobile-actions">
              <button class="btn-small btn-edit" data-idx="${idx}">Edit</button>
              <button class="btn-small btn-remove" data-idx="${idx}">Delete</button>
            </span>
          </div>
        `;
        mobileList.appendChild(card);
      });
    } else {
      table.style.display = "";
      if (mobileList) mobileList.remove();
      if (!tbody) return;
      tbody.innerHTML = "";
      pageRows.forEach((r) => {
        const idx = data.indexOf(r);
        const tr = document.createElement("tr");
        tr.dataset.index = idx;
        tr.innerHTML = `
          <td>${escapeHtml(r.user)}</td>
          <td>${escapeHtml(r.lesson)}</td>
          <td>${escapeHtml(r.score)}</td>
          <td>${escapeHtml(r.time)}</td>
        `;
        const tdAct = document.createElement("td");
        tdAct.className = "action-buttons";
        tdAct.innerHTML = `
          <button class="btn-small btn-edit" data-idx="${idx}">Edit</button>
          <button class="btn-small btn-remove" data-idx="${idx}">Delete</button>
        `;
        tr.appendChild(tdAct);
        tbody.appendChild(tr);
      });
    }
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    paginationEl.innerHTML = "";
    if (totalPages <= 1) return;
    const prev = createEl("button", "btn-small", "‹ Prev");
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => { currentPage = Math.max(1, currentPage - 1); renderTable(); });

    const info = createEl("span", "muted", `Page ${currentPage} of ${totalPages}`);

    const next = createEl("button", "btn-small", "Next ›");
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => { currentPage = Math.min(totalPages, currentPage + 1); renderTable(); });

    paginationEl.appendChild(prev);
    paginationEl.appendChild(info);
    paginationEl.appendChild(next);
  }

  function createEl(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  // ---------- events ----------
  // Table / mobile action delegation
  document.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".btn-edit");
    const delBtn = e.target.closest(".btn-remove");

    if (editBtn) {
      const idx = parseInt(editBtn.dataset.idx, 10);
      if (!Number.isFinite(idx)) return;
      openEditModal(idx);
    }

    if (delBtn) {
      const idx = parseInt(delBtn.dataset.idx, 10);
      if (!Number.isFinite(idx)) return;
      openDeleteModal(idx);
    }
  });

  // Filters / search
  [statusFilter, pageSizeSelect].forEach((el) => {
    if (!el) return;
    el.addEventListener("change", () => { currentPage = 1; renderTable(); });
  });

  if (searchInput) searchInput.addEventListener("input", debounce(() => { currentPage = 1; renderTable(); }, 120));

  // Export CSV
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const rows = [["User", "Lesson", "Score/XP", "Time"]].concat(data.map((r) => [r.user, r.lesson, r.score, r.time]));
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "activity-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Self-test button
  if (runTestBtn) {
    runTestBtn.addEventListener("click", () => {
      data.push({ user: "TestUser", lesson: "Auto Test", score: "+1 XP", time: "now" });
      save();
      if (data[0]) data[0].score += " [edited]";
      save();
      data = data.filter((d) => d.user !== "TestUser");
      save();
      renderTable();
      alert("Self-test completed.");
    });
  }

  // Sidebar close on outside click (mobile)
  document.addEventListener("click", (e) => {
    if (!isMobileView) return;
    if (!sidebar.classList.contains("open")) return;
    const insideSidebar = e.composedPath().includes(sidebar);
    const toggle = e.target.closest(".collapse-btn");
    if (!insideSidebar && !toggle) sidebar.classList.remove("open");
  });

  // Resize handler
  window.addEventListener("resize", debounce(() => {
    const wasMobile = isMobileView;
    isMobileView = window.innerWidth <= MOBILE_WIDTH;
    if (wasMobile !== isMobileView) renderTable();
  }, 150));

  // ---------- Edit modal behavior ----------
  let editingIndex = null;
  function openEditModal(idx) {
    editingIndex = idx;
    const item = data[idx];
    if (!item) return;
    modalUser.textContent = item.user;
    modalLesson.value = item.lesson;
    modalScore.value = item.score;
    showModal(editModal);
    modalLesson.focus();
  }

  function closeEditModal() {
    hideModal(editModal);
    editingIndex = null;
  }

  if (modalClose) modalClose.addEventListener("click", closeEditModal);
  if (modalCancel) modalCancel.addEventListener("click", closeEditModal);
  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (editingIndex === null) return;
      data[editingIndex].lesson = modalLesson.value.trim();
      data[editingIndex].score = modalScore.value.trim();
      save();
      renderTable();
      closeEditModal();
    });
  }
  editModal.addEventListener("click", (e) => { if (e.target === editModal) closeEditModal(); });

  // ---------- Delete modal behavior ----------
  let deletingIndex = null;
  function openDeleteModal(idx) {
    deletingIndex = idx;
    const item = data[idx];
    if (!item) return;
    deleteMessageEl.textContent = `Are you sure you want to permanently delete activity for "${item.user}"?`;
    showModal(deleteModal);
  }

  function confirmDelete() {
    if (!Number.isFinite(deletingIndex)) return;
    data.splice(deletingIndex, 1);
    save();
    renderTable();
    hideModal(deleteModal);
    deletingIndex = null;
  }

  function cancelDelete() {
    hideModal(deleteModal);
    deletingIndex = null;
  }

  deleteConfirmBtn.addEventListener("click", confirmDelete);
  deleteCancelBtn.addEventListener("click", cancelDelete);
  deleteModal.addEventListener("click", (e) => { if (e.target === deleteModal) cancelDelete(); });

  // ---------- helpers ----------
  function showModal(el) {
    el.classList.add("show");
  }
  function hideModal(el) {
    el.classList.remove("show");
  }

  // create delete modal dynamically (used above)
  function createDeleteModal() {
    const wrapper = document.createElement("div");
    wrapper.id = "deleteModal";
    wrapper.className = "modal";
    wrapper.innerHTML = `
      <div class="modal-dialog">
        <header class="modal-header">
          <h3>Confirm Delete</h3>
          <button class="modal-close" aria-label="Close">&times;</button>
        </header>
        <div class="modal-body">
          <p id="deleteMessage" style="margin-bottom:14px;"></p>
          <div style="display:flex;gap:10px;justify-content:flex-end">
            <button id="deleteCancelBtn" class="action-btn">Cancel</button>
            <button id="deleteConfirmBtn" class="action-btn danger">Delete</button>
          </div>
        </div>
      </div>
    `;
    // hook buttons
    const confirmBtn = wrapper.querySelector("#deleteConfirmBtn");
    const cancelBtn = wrapper.querySelector("#deleteCancelBtn");
    const messageEl = wrapper.querySelector("#deleteMessage");
    // close (x) button
    const closeX = wrapper.querySelector(".modal-close");
    closeX.addEventListener("click", () => { hideModal(wrapper); });
    return { modalEl: wrapper, confirmBtn, cancelBtn, messageEl };
  }

  // ---------- init ----------
  renderTable();
})();
