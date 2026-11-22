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
  if (safeId.includes('windy')) {
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
      label: formatINR(n.label) + expandIndicator,
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
        gravitationalConstant: -4000,
        centralGravity: 0.35,
        springLength: 120,
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

// 3. Generic Autonomous Knowledge Data
function getGenericGraphData(app, safeId) {
  const rootId = `root_${safeId}`;
  const uiId = `ui_${safeId}`;
  const wallId = `wall_${safeId}`;
  const openId = `open_${safeId}`;
  const metricId = `metric_${safeId}`;

  const nodes = [
    { id: rootId, label: `⚡ ${app.name || 'Target Application'}\n(${app.category || 'Web Application'})`, type: 'god', level: 0 },
    { id: uiId, label: `Client Presentation Layer\n(${app.url || 'Web Client'})`, type: 'target', level: 1 },
    { id: wallId, label: `Commercial Wall:\n${formatINR(app.commercialCatch || 'Proprietary Cloud Services')}`, type: 'proprietary', level: 1 },
    { id: openId, label: `Zero-Cost Alternative:\n${formatINR(app.openStack || 'Open-Source Primitives')}`, type: 'opensource', level: 2 },
    { id: metricId, label: `Overall Parity: ${app.parity || 75}%\nMarket Index: ${app.marketIndex || 'High'}\nRunway: ₹0.00 / mo`, type: 'metric', level: 1 }
  ];

  const edges = [
    { from: rootId, to: uiId, label: 'presents UI' },
    { from: uiId, to: wallId, label: 'locked by' },
    { from: wallId, to: openId, label: 'replaced by' },
    { from: openId, to: metricId, label: 'yields parity' }
  ];

  return { nodes, edges };
}
