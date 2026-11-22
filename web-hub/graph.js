// Graphify-Grade Organic Knowledge Network Engine (Powered by vis-network)
// Features: Barnes-Hut Physics, God Node Gravitational Centers, Click-to-Expand Clusters,
// Free Pan & Zoom Navigation, and INR (₹) Financial Telemetry.

let network = null;
let networkData = null;
let currentApp = null;
let allRawNodes = [];
let allRawEdges = [];
let expandedNodes = new Set();

// Currency formatter: replaces any stray $ with ₹
function formatINR(text) {
  if (!text) return "";
  return text
    .replace(/\$15,000\+?\/yr/gi, "₹12,50,000+/yr")
    .replace(/\$10,000\+?\/yr/gi, "₹8,30,000+/yr")
    .replace(/\$700\+?/gi, "₹58,000+")
    .replace(/\$180\+?\/month/gi, "₹15,000+/month")
    .replace(/\$180\+?\/mo/gi, "₹15,000+/mo")
    .replace(/\$0\.00/g, "₹0.00")
    .replace(/\$/g, "₹");
}

// Smart line breaker to keep node labels compact and prevent giant stretching
function wrapText(str, maxChars = 28) {
  if (!str) return "";
  const words = str.split(' ');
  const lines = [];
  let currentLine = '';

  for (const w of words) {
    if (w.includes('\n')) {
      const parts = w.split('\n');
      currentLine += (currentLine ? ' ' : '') + parts[0];
      lines.push(currentLine);
      currentLine = parts[1] || '';
      continue;
    }
    if ((currentLine + ' ' + w).trim().length > maxChars) {
      if (currentLine) lines.push(currentLine);
      currentLine = w;
    } else {
      currentLine += (currentLine ? ' ' : '') + w;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.join('\n');
}


function initCytoscape(app) {
  // Alias for backward compatibility; launches vis-network
  initVisNetwork(app);
}

function initVisNetwork(app) {
  currentApp = app;
  const container = document.getElementById('visNetwork');
  if (!container) return;

  const safeId = (app.id || 'target').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

  // Load raw graph specification
  if (safeId.includes('bhaskar')) {
    const raw = getBhaskarGraphData();
    allRawNodes = raw.nodes;
    allRawEdges = raw.edges;
  } else if (safeId.includes('windy')) {
    const raw = getWindyGraphData();
    allRawNodes = raw.nodes;
    allRawEdges = raw.edges;
  } else if (safeId.includes('drik')) {
    const raw = getDrikGraphData();
    allRawNodes = raw.nodes;
    allRawEdges = raw.edges;
  } else {
    const raw = getGenericGraphData(app, safeId);
    allRawNodes = raw.nodes;
    allRawEdges = raw.edges;
  }

  // Initial State: Primary clusters visible, sub-leaf nodes ready for click-to-expand
  expandedNodes.clear();
  expandedNodes.add('bhaskar_core');
  expandedNodes.add('windy_core');
  expandedNodes.add('drik_core');
  expandedNodes.add(`root_${safeId}`);

  renderVisGraph(container);
}

function renderVisGraph(container) {
  const visNodes = [];
  const visEdges = [];

  allRawNodes.forEach(n => {
    // Determine visibility based on expansion
    const isVisible = isNodeVisible(n);
    if (!isVisible) return;

    let shape = 'box';
    let size = 25;
    let bgColor = '#1E293B';
    let borderColor = '#475569';
    let fontColor = '#F8FAFC';
    let fontSize = 12;
    let borderWidth = 1.5;

    if (n.type === 'god') {
      shape = 'circle';
      size = 45;
      bgColor = '#1D4ED8';
      borderColor = '#60A5FA';
      fontColor = '#FFFFFF';
      fontSize = 13;
      borderWidth = 3;
    } else if (n.type === 'target') {
      bgColor = '#0369A1';
      borderColor = '#38BDF8';
      fontSize = 11;
    } else if (n.type === 'proprietary') {
      bgColor = '#881337';
      borderColor = '#F43F5E';
      borderWidth = 2;
      fontSize = 11;
    } else if (n.type === 'opensource') {
      bgColor = '#064E3B';
      borderColor = '#10B981';
      borderWidth = 2;
      fontSize = 11;
    } else if (n.type === 'metric') {
      shape = 'ellipse';
      bgColor = '#78350F';
      borderColor = '#F59E0B';
      borderWidth = 2;
      fontColor = '#FEF3C7';
      fontSize = 11;
    }

    // Has collapsible children indicator
    const hasChildren = allRawEdges.some(e => e.from === n.id);
    const isExpanded = expandedNodes.has(n.id);
    const expandIndicator = hasChildren ? (isExpanded ? ' ▾' : ' ▸') : '';

    visNodes.push({
      id: n.id,
      label: wrapText(formatINR(n.label), 28) + expandIndicator,
      title: n.tooltip ? formatINR(n.tooltip) : formatINR(n.label),
      shape: shape,
      size: size,
      color: {
        background: bgColor,
        border: borderColor,
        highlight: { background: borderColor, border: '#FFFFFF' },
        hover: { background: borderColor, border: '#FFFFFF' }
      },
      font: {
        color: fontColor,
        size: fontSize,
        face: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      borderWidth: borderWidth,
      margin: 10,
      shadow: n.type === 'god' ? { enabled: true, color: '#3B82F6', size: 15, x: 0, y: 0 } : false
    });
  });

  const visibleNodeIds = new Set(visNodes.map(n => n.id));

  allRawEdges.forEach((e, idx) => {
    if (visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)) {
      visEdges.push({
        id: `e_${idx}`,
        from: e.from,
        to: e.to,
        label: formatINR(e.label || ''),
        font: { size: 9, color: '#94A3B8', strokeWidth: 0, align: 'horizontal' },
        arrows: { to: { enabled: true, scaleFactor: 0.6 } },
        color: { color: '#475569', highlight: '#38BDF8', hover: '#94A3B8' },
        smooth: { type: 'continuous', roundness: 0.2 },
        width: 1.5
      });
    }
  });

  const data = {
    nodes: new vis.DataSet(visNodes),
    edges: new vis.DataSet(visEdges)
  };
  networkData = data;

  const options = {
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true,
      hover: true,
      tooltipDelay: 150,
      navigationButtons: false
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -7000,
        centralGravity: 0.25,
        springLength: 160,
        springConstant: 0.04,
        damping: 0.12,
        avoidOverlap: 0.4
      },
      stabilization: {
        enabled: true,
        iterations: 150,
        updateInterval: 25
      }
    }
  };

  network = new vis.Network(container, data, options);

  // Progressive Click-to-Expand Interaction
  network.on('click', function(params) {
    if (params.nodes.length > 0) {
      const clickedId = params.nodes[0];
      const clickedNode = allRawNodes.find(n => n.id === clickedId);
      
      // Toggle expansion state
      if (expandedNodes.has(clickedId)) {
        expandedNodes.delete(clickedId);
      } else {
        expandedNodes.add(clickedId);
      }

      showNodeInfo(clickedNode);
      renderVisGraph(container);
    } else {
      closeNodeInfo();
    }
  });

  network.on('doubleClick', function(params) {
    if (params.nodes.length > 0) {
      network.focus(params.nodes[0], { scale: 1.2, animation: true });
    }
  });
}

function isNodeVisible(node) {
  if (node.type === 'god') return true;
  if (node.level === 1) return true; // Primary clusters always visible

  // Visible if its parent node is expanded
  const incomingEdges = allRawEdges.filter(e => e.to === node.id);
  if (incomingEdges.length === 0) return true;
  return incomingEdges.some(e => expandedNodes.has(e.from));
}

function showNodeInfo(node) {
  if (!node) return;
  const bar = document.getElementById('nodeInfoBar');
  const text = document.getElementById('nodeInfoText');
  if (bar && text) {
    bar.style.display = 'flex';
    text.innerHTML = `<strong>${node.id.toUpperCase()}:</strong> ${formatINR(node.label).replace(/\n/g, ' ')} &nbsp;·&nbsp; <em>${node.type.toUpperCase()}</em>`;
  }
}

function closeNodeInfo() {
  const bar = document.getElementById('nodeInfoBar');
  if (bar) bar.style.display = 'none';
}

// Controls
function zoomGraph(factor) {
  if (!network) return;
  const scale = network.getScale();
  network.moveTo({ scale: scale * factor, animation: { duration: 200 } });
}

function fitGraph() {
  if (!network) return;
  network.fit({ animation: { duration: 300 } });
}

function resetGraphPhysics() {
  if (!network) return;
  network.stabilize(100);
  network.fit({ animation: { duration: 300 } });
}

function searchGraphNode(query) {
  if (!network || !networkData) return;
  const q = query.trim().toLowerCase();
  if (!q) {
    network.fit({ animation: { duration: 250 } });
    return;
  }
  const matched = allRawNodes.find(n => (n.label || '').toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
  if (matched) {
    expandedNodes.add(matched.id);
    const container = document.getElementById('visNetwork');
    renderVisGraph(container);
    network.focus(matched.id, { scale: 1.3, animation: { duration: 350 } });
    showNodeInfo(matched);
  }
}

// 1. Windy Deep Knowledge Data
function getWindyGraphData() {
  const nodes = [
    { id: 'windy_core', label: '⚡ Windy Platform Core\n(Windyty S.E.)', type: 'god', level: 0 },

    // Cluster 1: Presentation & Rendering
    { id: 'leaflet_base', label: 'Leaflet.js Map Frame\n(#leaflet-map container)', type: 'target', level: 1 },
    { id: 'leaflet_gl', label: 'Proprietary @leafletGl\n(Custom WebGL 2.0 Shaders)', type: 'proprietary', level: 2 },
    { id: 'leaflet_velocity', label: 'leaflet-velocity (MIT)\n(2D Canvas • ₹0.00 Runway)', type: 'opensource', level: 2 },
    { id: 'carto_dark', label: 'CartoDB Dark Matter\n(Free Vector Basemap)', type: 'opensource', level: 2 },

    // Cluster 2: Edge CDN & Numerical Models
    { id: 'node_edge', label: 'node.windy.com\n(Umisteni Geolocation)', type: 'target', level: 1 },
    { id: 'ecmwf_hres', label: 'ECMWF HRES 0.1° Feeds\n[Wall: ₹12,50,000+/yr]', type: 'proprietary', level: 2 },
    { id: 'openmeteo_api', label: 'Open-Meteo GFS/ICON\n(10,000 Free Calls/Day)', type: 'opensource', level: 2 },
    { id: 'noaa_gfs', label: 'NOAA NOMADS GRIB2\n(Unfiltered Telemetry)', type: 'opensource', level: 2 },

    // Cluster 3: Radar & Satellite Feeds
    { id: 'rdr_windy', label: 'rdr.windy.com & sat.windy.com\n(Proprietary Compositor)', type: 'proprietary', level: 1 },
    { id: 'rainviewer_api', label: 'RainViewer API v2\n(Free 10-Min Global Doppler)', type: 'opensource', level: 2 },
    { id: 'eumetsat_open', label: 'NOAA GOES & EUMETSAT\n(Public Weather Downlink)', type: 'opensource', level: 2 },

    // Cluster 4: Atmospheric Pressure Slicing
    { id: 'pressure_layers', label: 'Multi-Altitude Isobars\n(Surface to 200hPa Jetstream)', type: 'target', level: 1 },
    { id: 'aviation_metar', label: 'METAR / TAF / NOTAMs\n(Aviation Station Decoders)', type: 'target', level: 2 },

    // Cluster 5: Clean-Room Verdict
    { id: 'windy_verdict', label: 'Clean-Room Parity: 80%\nMarket Viability: 94%\nRunway: ₹0.00 / mo', type: 'metric', level: 1 }
  ];

  const edges = [
    { from: 'windy_core', to: 'leaflet_base', label: 'mounts' },
    { from: 'leaflet_base', to: 'leaflet_gl', label: 'shaders via' },
    { from: 'leaflet_gl', to: 'leaflet_velocity', label: 'replaced by' },
    { from: 'leaflet_base', to: 'carto_dark', label: 'basemap from' },

    { from: 'windy_core', to: 'node_edge', label: 'requests edge' },
    { from: 'node_edge', to: 'ecmwf_hres', label: 'commercial wall' },
    { from: 'ecmwf_hres', to: 'openmeteo_api', label: 'reproduced via' },
    { from: 'openmeteo_api', to: 'noaa_gfs', label: 'slices' },

    { from: 'windy_core', to: 'rdr_windy', label: 'downloads radar' },
    { from: 'rdr_windy', to: 'rainviewer_api', label: 'open alternative' },
    { from: 'rdr_windy', to: 'eumetsat_open', label: 'open satellite' },

    { from: 'openmeteo_api', to: 'pressure_layers', label: 'provides isobars' },
    { from: 'pressure_layers', to: 'aviation_metar', label: 'parses' },

    { from: 'leaflet_velocity', to: 'windy_verdict', label: 'ensures Dell E6220 60 FPS' },
    { from: 'openmeteo_api', to: 'windy_verdict', label: '₹0.00 cost' },
    { from: 'rainviewer_api', to: 'windy_verdict', label: 'verified parity' }
  ];

  return { nodes, edges };
}

// 2. Drik Panchang Deep Knowledge Data (2,828 Sitemap Baseline)
function getDrikGraphData() {
  const nodes = [
    { id: 'drik_core', label: '⚡ Drik Panchang Core\n(Drik Ganita Astronomical Engine)', type: 'god', level: 0 },

    // Cluster 1: Presentation & Charts (Zero GPU)
    { id: 'client_ui', label: 'Client Web & PWA\n(Multi-Lingual Regional Layouts)', type: 'target', level: 1 },
    { id: 'dp_canvas_shuddhi', label: 'dp-panchangam-shuddhi-canvas\n(Client-Side Script Engine)', type: 'proprietary', level: 2 },
    { id: 'pure_svg_charts', label: 'Pure 2D SVG Vector Engine\n(North Diamond / South Box)', type: 'opensource', level: 2 },

    // Cluster 2: Ephemeris & Astronomical Walls
    { id: 'sweph_c', label: 'Swiss Ephemeris (C-Lib)\n[License Wall: ₹58,000+]', type: 'proprietary', level: 1 },
    { id: 'astro_engine', label: 'astronomy-engine (MIT)\nor pyswisseph (GPLv2)', type: 'opensource', level: 2 },
    { id: 'nasa_jpl', label: 'NASA JPL DE440\n(High-Precision Perturbation)', type: 'opensource', level: 2 },
    { id: 'ayanamsha', label: 'Lahiri Ayanamsha 24°13\'\n(Chitra Paksha Precession)', type: 'target', level: 2 },

    // Cluster 3: The 5 Limbs (Panchanga Precision)
    { id: 'panchanga_limbs', label: '5 Limbs Mathematical Solver\n(Tithi, Nakshatra, Yoga, Karana, Vara)', type: 'target', level: 1 },
    { id: 'hindu_sunrise', label: 'Hindu Geocentric Sunrise\n(Z0 = 90°50\' Refraction Model)', type: 'target', level: 2 },
    { id: 'brent_root', label: 'Brent\'s Root-Finder\n(Sub-Second End Times)', type: 'opensource', level: 2 },

    // Cluster 4: Liturgical Moat (10,000+ Dharmasindhu Rules)
    { id: 'dharmasindhu_moat', label: '10,000+ Dharmasindhu Rules\n[Decade-Long Codification Moat]', type: 'proprietary', level: 1 },
    { id: 'jyotisha_open', label: 'sanskrit-coders/jyotisha\n(1,500 Open Rules Baseline)', type: 'opensource', level: 2 },
    { id: 'nishita_kaal', label: 'Nishita Midnight & Pradosha\n(Solar Horizon Partition)', type: 'target', level: 2 },

    // Cluster 5: Offering Ecosystem (2,828 Sitemap URLs)
    { id: 'sitemap_ecosystem', label: '2,828 Output Ecosystem\n(345 Lyrics, 220 Festivals, 89 Muhurats)', type: 'target', level: 1 },

    // Cluster 6: Parity Verdict
    { id: 'drik_verdict', label: 'Clean-Room Parity: 70%\n(Math: 100% | Rules: 55%)\nMarket Viability: 94%', type: 'metric', level: 1 }
  ];

  const edges = [
    { from: 'drik_core', to: 'client_ui', label: 'serves UI' },
    { from: 'client_ui', to: 'dp_canvas_shuddhi', label: 'renders via' },
    { from: 'dp_canvas_shuddhi', to: 'pure_svg_charts', label: 'clean-room replaced by' },

    { from: 'drik_core', to: 'sweph_c', label: 'queries' },
    { from: 'sweph_c', to: 'astro_engine', label: 'replaced by' },
    { from: 'astro_engine', to: 'nasa_jpl', label: 'matches coefficients' },
    { from: 'drik_core', to: 'ayanamsha', label: 'applies sidereal' },

    { from: 'drik_core', to: 'panchanga_limbs', label: 'calculates' },
    { from: 'panchanga_limbs', to: 'hindu_sunrise', label: 'synchronizes' },
    { from: 'panchanga_limbs', to: 'brent_root', label: 'transition times' },

    { from: 'panchanga_limbs', to: 'dharmasindhu_moat', label: 'feeds into' },
    { from: 'dharmasindhu_moat', to: 'jyotisha_open', label: 'open baseline' },
    { from: 'dharmasindhu_moat', to: 'nishita_kaal', label: 'evaluates' },

    { from: 'dharmasindhu_moat', to: 'sitemap_ecosystem', label: 'powers' },
    { from: 'pure_svg_charts', to: 'drik_verdict', label: 'zero GPU strain' },
    { from: 'astro_engine', to: 'drik_verdict', label: '100% math parity' },
    { from: 'jyotisha_open', to: 'drik_verdict', label: 'evaluates' }
  ];

  return { nodes, edges };
}

// 3. Dainik Bhaskar Deep Knowledge Data
function getBhaskarGraphData() {
  const nodes = [
    { id: 'bhaskar_core', label: '⚡ Dainik Bhaskar Core\n(DB Corp Newsroom Engine)', type: 'god', level: 0 },

    // Cluster 1: Presentation & Vernacular Web
    { id: 'web_frontend', label: 'Next.js SSR Frontend\n(Hindi/Gujarati/Marathi PWA)', type: 'target', level: 1 },
    { id: 'epaper_viewer', label: 'epaper.bhaskar.com\n(Vector PDF Slicing Engine)', type: 'proprietary', level: 2 },
    { id: 'pdf_svg_reader', label: 'PDF.js + Pure 2D SVG\n(Lightweight Clipping Reader)', type: 'opensource', level: 2 },

    // Cluster 2: Commercial Wall & Media Infrastructure
    { id: 'ground_bureau', label: '65+ Print Bureau Network\n[3,000+ Ground Journalists]', type: 'proprietary', level: 1 },
    { id: 'media_cdn', label: 'images.bhaskarassets.com\n[Akamai Multi-CDN: ₹18,00,000+/mo]', type: 'proprietary', level: 2 },
    { id: 'cloudflare_img', label: 'Cloudflare Images / Photon\n(Zero-Cost WebP Optimization)', type: 'opensource', level: 2 },

    // Cluster 3: Headless Content Management
    { id: 'news_cms', label: 'api.bhaskar.com\n(GraphQL & Breaking Tickers)', type: 'target', level: 1 },
    { id: 'pocketbase_db', label: 'PocketBase / Strapi (Free)\n(Single Binary SQLite Newsroom)', type: 'opensource', level: 2 },
    { id: 'open_rss', label: 'Open RSS / Wire Feeds\n(Automated News Webhooks)', type: 'opensource', level: 2 },

    // Cluster 4: Ad-Tech & Analytics
    { id: 'adtech_wrapper', label: 'Prebid.js Header Bidding\n(Programmatic Ad Units)', type: 'target', level: 1 },
    { id: 'hardware_guard', label: 'Astro Zero-JS Islands\n(Dell E6220 < 15 MB RAM)', type: 'opensource', level: 2 },

    // Cluster 5: Clean-Room Verdict
    { id: 'bhaskar_verdict', label: 'Clean-Room Parity: 85%\nMarket Viability: 96%\nRunway: ₹0.00 / mo', type: 'metric', level: 1 }
  ];

  const edges = [
    { from: 'bhaskar_core', to: 'web_frontend', label: 'renders UI' },
    { from: 'web_frontend', to: 'epaper_viewer', label: 'serves editions' },
    { from: 'epaper_viewer', to: 'pdf_svg_reader', label: 'clean-room replaced by' },

    { from: 'bhaskar_core', to: 'ground_bureau', label: 'primary moat' },
    { from: 'bhaskar_core', to: 'media_cdn', label: 'hosts images' },
    { from: 'media_cdn', to: 'cloudflare_img', label: 'reproduced via' },

    { from: 'bhaskar_core', to: 'news_cms', label: 'serves articles' },
    { from: 'news_cms', to: 'pocketbase_db', label: 'reproduced via' },
    { from: 'pocketbase_db', to: 'open_rss', label: 'ingests' },

    { from: 'web_frontend', to: 'adtech_wrapper', label: 'monetizes via' },
    { from: 'adtech_wrapper', to: 'hardware_guard', label: 'optimized for low-spec' },

    { from: 'pdf_svg_reader', to: 'bhaskar_verdict', label: '60 FPS 2D Canvas' },
    { from: 'pocketbase_db', to: 'bhaskar_verdict', label: '₹0.00 infrastructure' },
    { from: 'hardware_guard', to: 'bhaskar_verdict', label: 'verified parity' }
  ];

  return { nodes, edges };
}

// 4. Generic Autonomous Knowledge Data
function getGenericGraphData(app, safeId) {
  const rootId = `root_${safeId}`;
  const name = app.name || 'Target App';
  const category = app.category || 'Web Application';
  const catchText = app.commercialCatch || 'Proprietary Cloud & Operations';
  const stackText = app.openStack || 'Modern Open Source Primitives';
  const parity = app.parity || 75;
  const market = app.marketIndex || '85% (High)';

  const nodes = [
    // God Node (Center)
    { 
      id: rootId, 
      label: `⚡ ${name}\n[${category}]`, 
      type: 'god', 
      level: 0,
      tooltip: `${name} • Core Ecosystem God Node`
    },

    // Cluster 1: Presentation & User Experience (Blue)
    { 
      id: `ui_${safeId}`, 
      label: `Client Interface Layer\n${wrapText(app.url || 'Web Client', 24)}`, 
      type: 'target', 
      level: 1 
    },
    { 
      id: `ui_nav_${safeId}`, 
      label: 'Adaptive Navigation & Search\n[Debounced Instant Autocomplete]', 
      type: 'target', 
      level: 2 
    },
    { 
      id: `ui_pdp_${safeId}`, 
      label: 'Interactive Detail Engine\n[Optimistic Cart & Care Matrix]', 
      type: 'target', 
      level: 2 
    },

    // Cluster 2: Commercial Wall & Moat (Red / Amber)
    { 
      id: `wall_cluster_${safeId}`, 
      label: `Commercial Moat\n[Enterprise Barrier]`, 
      type: 'proprietary', 
      level: 1 
    },
    { 
      id: `wall_detail_${safeId}`, 
      label: `The Core Catch:\n${wrapText(catchText, 26)}`, 
      type: 'proprietary', 
      level: 2 
    },
    { 
      id: `wall_cdn_${safeId}`, 
      label: 'Multi-CDN & Egress Fees\n[₹3,00,000 - ₹8,00,000/mo]', 
      type: 'proprietary', 
      level: 2 
    },

    // Cluster 3: Zero-Cost Open Equivalent Stack (Green)
    { 
      id: `open_cluster_${safeId}`, 
      label: `Zero-Cost Open Stack\n[₹0.00 / mo Runway]`, 
      type: 'opensource', 
      level: 1 
    },
    { 
      id: `open_frontend_${safeId}`, 
      label: 'Vanilla JS / Astro SSR\n[< 15 MB RAM • E6220 Safe]', 
      type: 'opensource', 
      level: 2 
    },
    { 
      id: `open_backend_${safeId}`, 
      label: `Serverless Core:\n${wrapText(stackText, 24)}`, 
      type: 'opensource', 
      level: 2 
    },

    // Cluster 4: Parity & Financial Index (Gold / Orange)
    { 
      id: `metric_${safeId}`, 
      label: `Overall Parity: ${parity}%\nMarket Index: ${market}\nRunway: ₹0.00 / mo`, 
      type: 'metric', 
      level: 1 
    }
  ];

  const edges = [
    // Primary Cluster Connections from God Node
    { from: rootId, to: `ui_${safeId}`, label: 'renders' },
    { from: rootId, to: `wall_cluster_${safeId}`, label: 'constrained by' },
    { from: rootId, to: `open_cluster_${safeId}`, label: 'reproducible via' },
    { from: rootId, to: `metric_${safeId}`, label: 'evaluated as' },

    // Sub-cluster Edges
    { from: `ui_${safeId}`, to: `ui_nav_${safeId}`, label: 'includes' },
    { from: `ui_${safeId}`, to: `ui_pdp_${safeId}`, label: 'features' },
    { from: `wall_cluster_${safeId}`, to: `wall_detail_${safeId}`, label: 'demands' },
    { from: `wall_cluster_${safeId}`, to: `wall_cdn_${safeId}`, label: 'incurs' },
    { from: `open_cluster_${safeId}`, to: `open_frontend_${safeId}`, label: 'uses' },
    { from: `open_cluster_${safeId}`, to: `open_backend_${safeId}`, label: 'deploys' },

    // Cross-link Bridge: Open Stack replaces Commercial Wall
    { from: `open_cluster_${safeId}`, to: `wall_cluster_${safeId}`, label: 'replaces (₹0)' }
  ];

  return { nodes, edges };
}


