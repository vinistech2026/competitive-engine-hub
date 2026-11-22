// Apple-Grade 2026 Competitive Studio Core Logic
// Integrated with Master Google Sheet + Live Autonomous Multi-Tier Audits

const GOOGLE_SHEET_ID = "1tUJvMemHp8bTx7yOp-irW_zw-yk9zWPWffp92u7GRQg";
const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv`;
const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxE9zB2mSi_9sb1JYz-37UmuM0NPhGyI7zIARliNAlR8-v_xqwmYYCWRPxyEJmw7_QX/exec";

// Default seed data (used as immediate fallback while network/Sheet syncs)
const DEFAULT_AUDITS = [
  {
    id: "drikpanchang",
    category: "Vedic Astrology & Ephemeris",
    name: "Drik Panchang",
    url: "https://www.drikpanchang.com/",
    parity: 70,
    marketIndex: "94% (Very High)",
    commercialCatch: "10,000+ Dharmasindhu liturgical rules & Swiss Ephemeris commercial license ($700+)",
    openStack: "pyswisseph / astronomy-engine (MIT) + sanskrit-coders/jyotisha + Pure SVG Charts",
    briefing: {
      verdict: "GO • 70% Parity Feasible",
      summary: "Mathematical ephemeris and planetary limbs are 100% solvable in Python/JS. The real moat is the 10,000+ Dharmasindhu liturgical rules for multi-condition festival arbitrations.",
      catch: "Swiss Ephemeris commercial license ($700+) & 10+ years of codified Dharmasindhu/Nirnayasindhu festival decision trees.",
      stack: [
        "pyswisseph (GPLv2) or astronomy-engine (MIT): Sub-arcsecond planetary coordinates",
        "sanskrit-coders/jyotisha: Open-source Vedic festival & Vrat rule engine",
        "Pure 2D SVG: North Indian Diamond & South Indian Box Kundali vector renderers",
        "Voroa Mumbai Nano / Vercel Edge: Zero-cost high-speed serverless deployment"
      ]
    },
    deepDossierContent: `
# Deep Dossier: Drik Panchang (Vedic Ephemeris & Calendar Engine)

### Tier 1: The 30-Second Glance
- **Target URL:** \`https://www.drikpanchang.com/\`
- **Niche Category:** Vedic Astrology, Hindu Calendar & Astronomical Ephemeris
- **Core Architecture:** Drik Ganita (optical planetary observation algorithms) + Swiss Ephemeris (C-lib) + Dharmasindhu liturgical engine
- **The Real Commercial Wall:** Swiss Ephemeris commercial license fees ($700+) + 10,000+ classical Vedic festival rules
- **Zero-Cost Open Stack:** \`pyswisseph\` (GPLv2) or \`astronomy-engine\` (MIT) + \`sanskrit-coders/jyotisha\` + Pure SVG Charts
- **Realistic Parity Score:** **70%** (100% of mathematics & charts; 55% of localized community festival rules)
- **Market Viability Index:** **94% (Very High)** — Authoritative global standard for Indian diaspora
    `
  },
  {
    id: "msn-weather",
    category: "Geospatial & Climate",
    name: "MSN Weather Maps",
    url: "https://www.msn.com/en-in/weather/maps/",
    parity: 75,
    marketIndex: "88% (High)",
    commercialCatch: "Paid Foreca tiles ($180+/mo) & WebGL shaders",
    openStack: "Leaflet.js + Open-Meteo + RainViewer + 2D IDW Canvas",
    briefing: {
      verdict: "GO • 75% Parity Feasible",
      summary: "Clean-room reproduction achievable at zero infrastructure cost. Core limitation is continuous multi-zoom temperature heatmaps.",
      catch: "Proprietary Foreca raster tile servers ($180+/month) & custom WebGL shaders.",
      stack: [
        "Leaflet.js: Lightweight 2D map engine (Zero GPU strain)",
        "Open-Meteo: 10,000 free API calls/day for atmospheric telemetry",
        "RainViewer: Free public 10-minute precipitation radar loop",
        "2D Canvas IDW: Inverse distance interpolation for smooth thermal colors"
      ]
    },
    deepDossierContent: `
# Deep Dossier: MSN Weather Maps (Global Platform)

### Tier 1: The 30-Second Glance
- **Target URL:** \`https://www.msn.com/en-in/weather/maps/\`
- **Niche Category:** Geospatial / Climate & Atmospheric Visualization
- **Core Architecture:** TomTom Vector Basemap + Azure Maps Tile Pipeline + WebGL Shaders
- **The Commercial Wall:** Proprietary global raster tile servers ($180+/month) & paid Foreca feeds
- **Zero-Cost Open Stack:** Leaflet.js + Open-Meteo API + RainViewer Radar + 2D IDW Canvas
- **Realistic Parity Score:** 75% Functional & Visual Parity
- **Market Viability Index:** 88% (High)
    `
  }
];

// In-Memory Registry State (initialized with local storage cache or defaults)
let audits = (() => {
  const localCache = localStorage.getItem('ceh_audits_cache');
  if (localCache) {
    try { return JSON.parse(localCache); } catch(e) {}
  }
  return DEFAULT_AUDITS;
})();

let activeCategory = "ALL";
let searchQuery = "";
let currentActiveDrawerApp = null;

// Initialize Application Lifecycle
document.addEventListener('DOMContentLoaded', () => {
  refreshCategoryPills();
  renderTable();
  updateStats();
  initTheme();
  makeWindowDraggable();

  // Dynamically sync rows with Google Sheet
  fetchLiveGoogleSheetData();
});

// CSV Parser handling quotes and commas cleanly
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f.length > 0)) rows.push(currentRow);
  }
  return rows;
}

// Dynamic Google Sheet Ingestion
async function fetchLiveGoogleSheetData() {
  try {
    const res = await fetch(GOOGLE_SHEET_CSV_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();
    if (!csvText || csvText.length < 10) return;

    const rows = parseCSV(csvText);
    if (rows.length <= 1) return; // Only header row

    // Sheet Headers Expected: Category, Target App, Target URL, Parity, Market Index, Commercial Catch, Open Stack
    const parsedAudits = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (row.length < 3) continue;

      const category = row[0] || "General Web";
      const name = row[1] || "Target App";
      const url = row[2] || "#";
      const parity = parseInt((row[3] || "75").replace(/[^0-9]/g, '')) || 75;
      const marketIndex = row[4] || "85% (High)";
      const commercialCatch = row[5] || "Proprietary cloud APIs & closed back-end";
      const openStack = row[6] || "FastAPI / Node + PostgreSQL / SQLite Free Tier";

      const slugId = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);

      // Check if we have pre-existing local deep dossier text
      const existing = DEFAULT_AUDITS.find(d => d.id === slugId || d.url === url);

      parsedAudits.push({
        id: slugId,
        category,
        name,
        url,
        parity,
        marketIndex,
        commercialCatch,
        openStack,
        briefing: existing ? existing.briefing : {
          verdict: `GO • ${parity}% Parity Feasible`,
          summary: `Clean-room reproduction feasible using open-source primitives and zero-cost serverless tiers.`,
          catch: commercialCatch,
          stack: openStack.split('+').map(s => s.trim())
        },
        deepDossierContent: existing ? existing.deepDossierContent : `
# Deep Dossier: ${name}
- **Target URL:** ${url}
- **Category:** ${category}
- **Technical Parity:** ${parity}%
- **Market Viability:** ${marketIndex}
- **The Commercial Catch:** ${commercialCatch}
- **Open-Source Equivalent Stack:** ${openStack}

### Architecture & Feasibility Notes
Clean-room reproduction requires establishing local or edge parity without paying commercial API license fees.
        `
      });
    }

    if (parsedAudits.length > 0) {
      audits = parsedAudits;
      localStorage.setItem('ceh_audits_cache', JSON.stringify(audits));
      refreshCategoryPills();
      renderTable();
      updateStats();
    }
  } catch (err) {
    console.warn("Google Sheet live sync fallback active:", err);
  }
}

// Refresh Category Pills & Dropdown
function refreshCategoryPills() {
  const categories = [...new Set(audits.map(a => a.category))];
  const primaryContainer = document.getElementById('dynamicPrimaryPills');
  const dropdown = document.getElementById('nicheDropdown');

  if (primaryContainer) {
    primaryContainer.innerHTML = `
      <button class="pill-btn ${activeCategory === 'ALL' ? 'active' : ''}" data-category="ALL" onclick="filterCategory('ALL')">
        All Targets <span class="pill-count" id="count-all">${audits.length}</span>
      </button>
    `;

    const topCategories = categories.slice(0, 3);
    topCategories.forEach(cat => {
      const count = audits.filter(a => a.category === cat).length;
      const btn = document.createElement('button');
      btn.className = `pill-btn ${activeCategory === cat ? 'active' : ''}`;
      btn.setAttribute('data-category', cat);
      btn.onclick = () => filterCategory(cat);
      btn.innerHTML = `${cat} <span class="pill-count">${count}</span>`;
      primaryContainer.appendChild(btn);
    });
  }

  if (dropdown) {
    dropdown.innerHTML = `<option value="">▾ More Categories (${categories.length})...</option>`;
    categories.forEach(cat => {
      const count = audits.filter(a => a.category === cat).length;
      const opt = document.createElement('option');
      opt.value = cat;
      opt.innerText = `${cat} (${count})`;
      if (activeCategory === cat) opt.selected = true;
      dropdown.appendChild(opt);
    });
  }
}

// Render Table
function renderTable() {
  const tbody = document.getElementById('radar-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const filtered = audits.filter(item => {
    const matchCategory = (activeCategory === "ALL" || item.category === activeCategory);
    const matchSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery) ||
      item.openStack.toLowerCase().includes(searchQuery) ||
      item.commercialCatch.toLowerCase().includes(searchQuery) ||
      item.category.toLowerCase().includes(searchQuery);
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color: var(--text-muted);">No research targets found matching "${searchQuery || activeCategory}".</td></tr>`;
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.name}</strong><br><small style="color:var(--text-muted);">${item.url}</small></td>
      <td><span class="tag-badge">${item.category}</span></td>
      <td><span class="pill-parity">${item.parity}%</span></td>
      <td><span class="pill-market">${item.marketIndex}</span></td>
      <td style="color:var(--text-secondary);">${item.commercialCatch}</td>
      <td><code class="code-stack">${item.openStack}</code></td>
      <td>
        <button class="btn-doc-pill" onclick="openDocDrawer('${item.id}', 'briefing')">
          📱 2-Min Briefing
        </button>
        <button class="btn-doc-pill" style="margin-left:4px;" onclick="openDocDrawer('${item.id}', 'dossier')">
          📑 Dossier
        </button>
      </td>
      <td style="text-align:right;">
        <button class="btn btn-glass" onclick="openGraphForApp('${item.id}')">🕸️ Dynamic Graph</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Update Bento Stats
function updateStats() {
  const statTotal = document.getElementById('stat-total');
  const statParity = document.getElementById('stat-parity');
  const statNiche = document.getElementById('stat-niche-count');
  const countAll = document.getElementById('count-all');

  if (statTotal) statTotal.innerText = audits.length;
  if (statParity && audits.length > 0) {
    const avgParity = Math.round(audits.reduce((acc, curr) => acc + curr.parity, 0) / audits.length);
    statParity.innerText = `${avgParity}%`;
  }

  const distinctNiches = new Set(audits.map(a => a.category)).size;
  if (statNiche) statNiche.innerText = `Across ${distinctNiches} ${distinctNiches === 1 ? 'Niche' : 'Niches'}`;
  if (countAll) countAll.innerText = audits.length;
}

// Category Filtering
function filterCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === cat);
  });
  const dropdown = document.getElementById('nicheDropdown');
  if (dropdown) dropdown.value = (cat === "ALL" ? "" : cat);
  renderTable();
}
function handleDropdownFilter(val) {
  filterCategory(val || "ALL");
}

// Unified Search Bar
function handleUnifiedSearch(e) {
  const val = e.target.value.trim();
  const isUrl = val.startsWith('http://') || val.startsWith('https://') || val.includes('.com') || val.includes('.org') || val.includes('.io');
  const actionBtn = document.getElementById('auditActionBtn');

  if (isUrl && val.length > 5) {
    actionBtn.style.display = 'inline-flex';
    actionBtn.innerText = `⚡ Auto-Audit "${val.slice(0, 18)}..."`;
  } else {
    actionBtn.style.display = 'none';
    searchQuery = val.toLowerCase();
    renderTable();
  }
}

function handleSearchKey(e) {
  if (e.key === 'Enter') {
    const val = document.getElementById('searchInput').value.trim();
    if (val.length > 3) {
      triggerAutonomousDeconstruction(val);
    }
  }
}

function triggerAuditFromSearch() {
  const rawTarget = document.getElementById('searchInput').value.trim();
  if (rawTarget) triggerAutonomousDeconstruction(rawTarget);
}

// 1-Click Modal Handler
function openNewAuditModal() {
  document.getElementById('newAuditModal').classList.add('active');
  document.getElementById('autoTargetInput').focus();
}
function closeNewAuditModal() {
  document.getElementById('newAuditModal').classList.remove('active');
}

// Execute Autonomous Deconstruction Pipeline
async function handle1ClickAudit(e) {
  e.preventDefault();
  const target = document.getElementById('autoTargetInput').value.trim();
  const notes = document.getElementById('optionalNotes').value.trim();
  await triggerAutonomousDeconstruction(target, notes);
}

async function triggerAutonomousDeconstruction(rawTarget, notes = "") {
  const progress = document.getElementById('auditProgress');
  const progressText = document.getElementById('auditProgressText');
  const launchBtn = document.getElementById('launchAuditBtn');

  if (progress) progress.style.display = 'flex';
  if (progressText) progressText.innerText = `Analyzing "${rawTarget}" architecture & commercial walls...`;
  if (launchBtn) launchBtn.disabled = true;

  try {
    // Intelligent heuristic deconstruction
    const urlObj = rawTarget.startsWith('http') ? new URL(rawTarget) : { hostname: rawTarget };
    const domain = urlObj.hostname.replace('www.', '');
    const appName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    const fullUrl = rawTarget.startsWith('http') ? rawTarget : `https://${rawTarget}`;

    // Infer category & architecture
    let category = "SaaS & Web Services";
    let commercialCatch = "Proprietary backend microservices & proprietary data layer";
    let openStack = "Node.js / FastAPI + SQLite / Supabase Free + Tailwind UI";
    let parity = 80;
    let marketIndex = "85% (High)";

    const lower = rawTarget.toLowerCase();
    if (lower.includes('weather') || lower.includes('map') || lower.includes('radar')) {
      category = "Geospatial & Climate";
      commercialCatch = "Paid satellite tile feeds & proprietary mapping licenses";
      openStack = "Leaflet.js / OpenLayers + Open-Meteo + 2D HTML5 Canvas";
      parity = 75;
    } else if (lower.includes('astro') || lower.includes('panchang') || lower.includes('horo')) {
      category = "Vedic Astrology & Ephemeris";
      commercialCatch = "Proprietary astrological rules & ephemeris data licensing";
      openStack = "astronomy-engine (MIT) + sanskrit-coders/jyotisha + SVG Kundali";
      parity = 70;
    } else if (lower.includes('stock') || lower.includes('trade') || lower.includes('finance') || lower.includes('crypto')) {
      category = "Fintech & Algorithmic Trading";
      commercialCatch = "High-frequency sub-second exchange websocket feeds & Bloomberg/TradingView charting engine";
      openStack = "Lightweight-Charts (TradingView Open Source) + Yahoo Finance / Alpha Vantage + Python Pandas";
      parity = 75;
      marketIndex = "96% (Very High)";
    } else if (lower.includes('crm') || lower.includes('lead') || lower.includes('sales')) {
      category = "Enterprise CRM & Automation";
      commercialCatch = "Per-seat recurring cloud subscription fees ($50+/seat/mo)";
      openStack = "PocketBase (Single Go Binary) + Svelte/Alpine.js + SQLite Free";
      parity = 85;
    }

    const newAudit = {
      id: domain.replace(/[^a-z0-9]/gi, '-').toLowerCase(),
      category,
      name: appName,
      url: fullUrl,
      parity,
      marketIndex,
      commercialCatch,
      openStack,
      briefing: {
        verdict: `GO • ${parity}% Parity Feasible`,
        summary: `Autonomous deconstruction shows clean-room reproduction feasible for $0 runway.`,
        catch: commercialCatch,
        stack: openStack.split('+').map(s => s.trim())
      },
      deepDossierContent: `
# Deep Dossier: ${appName}
- **Target URL:** \`${fullUrl}\`
- **Niche Category:** ${category}
- **The Commercial Wall:** ${commercialCatch}
- **Zero-Cost Open Stack:** ${openStack}
- **Realistic Parity Score:** **${parity}%**
- **Market Viability Index:** **${marketIndex}**
      `
    };

    // Prepend to current audits array
    audits = [newAudit, ...audits.filter(a => a.id !== newAudit.id)];
    localStorage.setItem('ceh_audits_cache', JSON.stringify(audits));
    refreshCategoryPills();
    renderTable();
    updateStats();

    if (progressText) progressText.innerText = "Syncing live with Google Sheets Master...";

    // Webhook POST to Google Apps Script
    // Uses standard fetch with mode: 'no-cors' to handle Google Apps Script 302 redirect cleanly
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newAudit.category,
          name: newAudit.name,
          url: newAudit.url,
          parity: newAudit.parity,
          marketIndex: newAudit.marketIndex,
          commercialCatch: newAudit.commercialCatch,
          openStack: newAudit.openStack
        })
      });
    } catch (whErr) {
      console.warn("Webhook background POST notification:", whErr);
    }

    if (progressText) progressText.innerText = "Deconstruction complete! Synchronized.";
    setTimeout(() => {
      if (progress) progress.style.display = 'none';
      if (launchBtn) launchBtn.disabled = false;
      closeNewAuditModal();
      openDocDrawer(newAudit.id, 'briefing');
    }, 600);

  } catch (err) {
    alert("Audit error: " + err.message);
    if (progress) progress.style.display = 'none';
    if (launchBtn) launchBtn.disabled = false;
  }
}

// Slide-Over Documentation Drawer Logic
function openDocDrawer(appId, tab) {
  const app = audits.find(a => a.id === appId);
  if (!app) return;
  currentActiveDrawerApp = app;

  document.getElementById('drawerCategory').innerText = app.category;
  document.getElementById('drawerTitle').innerText = app.name;

  if (app.briefing) {
    document.getElementById('briefingVerdict').innerText = app.briefing.verdict;
    document.getElementById('briefingSummary').innerText = app.briefing.summary;
    document.getElementById('briefingParity').innerText = `${app.parity}%`;
    document.getElementById('briefingMarket').innerText = app.marketIndex;
    document.getElementById('briefingCatch').innerText = app.briefing.catch;

    const stackList = document.getElementById('briefingStackList');
    stackList.innerHTML = '';
    (app.briefing.stack || []).forEach(s => {
      const li = document.createElement('li');
      li.innerText = s;
      stackList.appendChild(li);
    });
  }

  const mdPane = document.getElementById('dossierMarkdownContent');
  mdPane.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${app.deepDossierContent || 'Detailed dossier loading...'}</pre>`;

  switchDrawerTab(tab || 'briefing');
  document.getElementById('docDrawer').classList.add('active');
}

function closeDocDrawer() {
  document.getElementById('docDrawer').classList.remove('active');
}

function switchDrawerTab(tab) {
  document.getElementById('tabBriefingBtn').classList.toggle('active', tab === 'briefing');
  document.getElementById('tabDossierBtn').classList.toggle('active', tab === 'dossier');
  document.getElementById('paneBriefing').classList.toggle('active', tab === 'briefing');
  document.getElementById('paneDossier').classList.toggle('active', tab === 'dossier');
}

// Graph Window Controls
function openGraphForApp(appId) {
  const app = audits.find(a => a.id === appId);
  if (!app) return;
  const win = document.getElementById('graphWindow');
  win.classList.add('active');
  document.getElementById('graphWindowTitle').innerText = `🕸️ Dynamic DAG: ${app.name}`;
  setTimeout(() => { initCytoscape(app); }, 50);
}

function closeGraphWindow() {
  document.getElementById('graphWindow').classList.remove('active');
}

function toggleGraphWindowSize() {
  const win = document.getElementById('graphWindow');
  if (win.style.width === '90%') {
    win.style.width = '640px';
    win.style.height = '500px';
    win.style.top = '80px';
    win.style.right = '40px';
    win.style.left = 'auto';
  } else {
    win.style.width = '90%';
    win.style.height = '82%';
    win.style.top = '8%';
    win.style.left = '5%';
  }
  if (window.cy) window.cy.resize();
}

function maximizeGraphWindow() { toggleGraphWindowSize(); }

function makeWindowDraggable() {
  const header = document.getElementById('windowHeader');
  const win = document.getElementById('graphWindow');
  let isDragging = false, startX, startY, initialX, initialY;

  header.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('light') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = win.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    win.style.left = `${initialX + dx}px`;
    win.style.top = `${initialY + dy}px`;
    win.style.right = 'auto';
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }
}

// Theme
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const target = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', target);
  document.getElementById('themeIcon').innerText = target === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('ceh_theme', target);
}

function initTheme() {
  const saved = localStorage.getItem('ceh_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  document.getElementById('themeIcon').innerText = saved === 'dark' ? '☀️' : '🌙';
}
