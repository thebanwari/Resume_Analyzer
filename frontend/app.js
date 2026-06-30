const API_URL = "http://localhost:8000";
let resumeCount = 0;

/* ── Toast ── */
function showToast(msg, type = "error") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === "error" ? "⚠️" : "✅"}</span>
    <span>${msg}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}


/* ── Resume Blocks ── */
function updateResumeCounter() {
  const count = document.querySelectorAll(".resume-block").length;
  document.getElementById("resume-counter").textContent = `${count} added`;
}

function addResume(name = "", text = "") {
  resumeCount++;
  const list = document.getElementById("resume-list");
  const block = document.createElement("div");
  block.className = "resume-block";
  block.id = `rb-${resumeCount}`;
  const num = resumeCount;

  block.innerHTML = `
    <div class="rb-top">
      <div class="rb-num">${num}</div>
      <input class="rb-name-input" type="text" placeholder="Candidate name..." value="${name}" />
      <button class="rb-remove" onclick="removeResume('rb-${num}')" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <textarea class="rb-textarea" placeholder="Paste resume text — skills, experience, education, projects...">${text}</textarea>
  `;

  list.appendChild(block);
  updateResumeCounter();
}

function removeResume(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(-8px)";
    el.style.transition = "all 0.2s";
    setTimeout(() => { el.remove(); updateResumeCounter(); }, 200);
  }
}

/* ── JD helpers ── */
function updateCharCount() {
  const len = document.getElementById("jd").value.length;
  document.getElementById("jd-count").textContent = `${len.toLocaleString()} chars`;
}

function clearJD() {
  document.getElementById("jd").value = "";
  updateCharCount();
}

function loadSampleJD() {
  document.getElementById("jd").value =
    "We are looking for a skilled Python Developer with 3+ years of experience. " +
    "The ideal candidate should be proficient in Django, PostgreSQL, REST API design, and Docker. " +
    "Experience with AWS or GCP is a plus. Strong knowledge of Git, agile methodologies, " +
    "and excellent communication skills are required. Familiarity with machine learning or scikit-learn is a bonus.";
  updateCharCount();
}

/* ── Score helpers ── */
function scoreClass(s) { return s >= 65 ? "high" : s >= 35 ? "mid" : "low"; }
const MEDALS = ["🥇", "🥈", "🥉"];

/* ── Summary Bar ── */
function buildSummary(results) {
  const scores = results.map(r => r.match_score);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const best = Math.max(...scores);
  const strong = scores.filter(s => s >= 65).length;
  const weak = scores.filter(s => s < 35).length;

  document.getElementById("summary-bar").innerHTML = `
    <div class="sbar-item">
      <span class="sbar-label">Total Screened</span>
      <span class="sbar-value indigo">${results.length}</span>
      <span class="sbar-sub">candidates</span>
    </div>
    <div class="sbar-item">
      <span class="sbar-label">Avg Score</span>
      <span class="sbar-value indigo">${avg}</span>
      <span class="sbar-sub">out of 100</span>
    </div>
    <div class="sbar-item">
      <span class="sbar-label">Strong Match</span>
      <span class="sbar-value green">${strong}</span>
      <span class="sbar-sub">score ≥ 65</span>
    </div>
    <div class="sbar-item">
      <span class="sbar-label">Best Score</span>
      <span class="sbar-value yellow">${best}</span>
      <span class="sbar-sub">top candidate</span>
    </div>
  `;
}

/* ── SVG Ring ── */
function buildRing(score) {
  const cls = scoreClass(score);
  const circumference = 201;
  const offset = circumference - (score / 100) * circumference;
  const id = `ring-${Math.random().toString(36).slice(2)}`;
  return {
    html: `
      <div class="score-ring-wrap">
        <svg width="76" height="76" viewBox="0 0 76 76">
          <circle class="score-ring-bg" cx="38" cy="38" r="32"/>
          <circle class="score-ring-fg ${cls}" id="${id}" cx="38" cy="38" r="32"/>
        </svg>
        <div class="score-text">
          <span class="score-num ${cls}">${score}</span>
          <span class="score-denom">/100</span>
        </div>
      </div>
    `,
    id,
    offset,
  };
}

/* ── Render Results ── */
function renderResults(data) {
  const section = document.getElementById("results-section");
  const grid = document.getElementById("results-grid");

  grid.innerHTML = "";
  buildSummary(data.results);

  document.getElementById("results-sub").textContent =
    `${data.total_resumes} candidate${data.total_resumes !== 1 ? "s" : ""} ranked by match score`;

  const rings = [];

  data.results.forEach((r, i) => {
    const cls = scoreClass(r.match_score);
    const ring = buildRing(r.match_score);
    rings.push(ring);

    const matchedChips = r.matched_skills.length
      ? r.matched_skills.map(s => `<span class="chip match">${s}</span>`).join("")
      : `<span class="chip none">None matched</span>`;

    const missingChips = r.missing_skills.length
      ? r.missing_skills.map(s => `<span class="chip miss">${s}</span>`).join("")
      : `<span class="chip none">All skills present ✓</span>`;

    const card = document.createElement("div");
    card.className = "result-card";
    card.setAttribute("data-rank", i + 1);

    card.innerHTML = `
      <div class="rc-topbar ${cls}"></div>
      <div class="rc-body">
        <div class="rc-header-row">
          <div class="rc-left">
            <div class="rc-rank-badge">
              <span>${i < 3 ? MEDALS[i] : ""}</span>
              <span class="rc-rank-text">Rank #${i + 1}</span>
            </div>
            <div class="rc-name">${r.name}</div>
          </div>
          ${ring.html}
        </div>

        <div class="rc-bar-wrap">
          <div class="rc-bar ${cls}" id="bar-${ring.id}" style="width:0%"></div>
        </div>

        <div class="rc-skills">
          <div class="skill-row">
            <div class="skill-row-label">
              ✅ Matched Skills
              <span class="skill-count">${r.matched_skills.length}</span>
            </div>
            <div class="chips">${matchedChips}</div>
          </div>
          <div class="skill-row">
            <div class="skill-row-label">
              ❌ Missing Skills
              <span class="skill-count">${r.missing_skills.length}</span>
            </div>
            <div class="chips">${missingChips}</div>
          </div>
        </div>

        <div class="rc-divider"></div>

        <div class="rc-explanation">
          <div class="expl-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="#818cf8" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="expl-text">${r.explanation}</p>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  section.classList.remove("hidden");

  // Animate rings and bars after DOM paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      rings.forEach(ring => {
        const el = document.getElementById(ring.id);
        if (el) el.style.strokeDashoffset = ring.offset;
        const bar = document.getElementById(`bar-${ring.id}`);
        const score = data.results[rings.indexOf(ring)]?.match_score ?? 0;
        if (bar) bar.style.width = `${score}%`;
      });
    });
  });

  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ── Main Screen Action ── */
async function screenResumes() {
  const jd = document.getElementById("jd").value.trim();
  const btn = document.getElementById("screen-btn");
  const btnContent = document.getElementById("btn-content");

  if (!jd) { showToast("Please enter a Job Description.", "error"); return; }

  const blocks = document.querySelectorAll(".resume-block");
  if (blocks.length === 0) { showToast("Add at least one candidate resume.", "error"); return; }

  const resumes = [];
  let valid = true;
  for (const block of blocks) {
    const name = block.querySelector(".rb-name-input").value.trim();
    const text = block.querySelector(".rb-textarea").value.trim();
    if (!name || !text) {
      showToast("Each candidate needs a name and resume text.", "error");
      valid = false; break;
    }
    resumes.push({ name, text });
  }
  if (!valid) return;

  btn.disabled = true;
  btnContent.innerHTML = `<span class="spinner"></span> Screening ${resumes.length} candidate${resumes.length !== 1 ? "s" : ""}...`;

  try {
    const res = await fetch(`${API_URL}/screen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_description: jd, resumes }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "API error.");
    }

    const data = await res.json();
    renderResults(data);
    showToast(`${data.total_resumes} resumes screened successfully!`, "success");
  } catch (e) {
    if (e.message.includes("fetch") || e.message.includes("Failed")) {
      showToast("Cannot reach backend. Is it running on localhost:8000?", "error");
    } else {
      showToast(e.message, "error");
    }
  } finally {
    btn.disabled = false;
    btnContent.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
        <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Screen Resumes
    `;
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── Init ── */

addResume(
  "Alice Johnson",
  "Python developer with 4 years of experience. Skilled in Django, PostgreSQL, REST API, Docker, Git, and Linux. Strong communication, agile teamwork, and problem solving skills. Has worked with AWS and CI/CD pipelines."
);
addResume(
  "Bob Kumar",
  "Java developer with 2 years of experience in Spring Boot, MySQL, Angular, and Kubernetes. Familiar with Jenkins and GitHub Actions for CI/CD. Good teamwork and leadership skills."
);
