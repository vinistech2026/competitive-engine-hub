// Graphify-Grade Knowledge & Dependency Visualizer for Competitive Studio
// Generates interconnected knowledge clusters, God Nodes, and dynamic multi-tier dependency networks

function generateArchitectureDAG(app) {
  const nodes = [];
  const edges = [];
  const safeId = (app.id || 'target').replace(/[^a-zA-Z0-9_]/g, '_');

  if (safeId.includes('windy')) {
    // True Architecture & Knowledge Graph for Windy.com
    return generateWindyKnowledgeGraph();
  }

  if (safeId.includes('drik')) {
    // True Architecture & Knowledge Graph for Drik Panchang
    return generateDrikKnowledgeGraph();
  }

  // Generic Graphify Pipeline for dynamically submitted URLs
  return generateGenericKnowledgeGraph(app, safeId);
}

// 1. Windy.com Deep Graphify Knowledge Cluster
function generateWindyKnowledgeGraph() {
  const nodes = [
    // God Node: Core Platform
    { id: 'windy_core', label: '⚡ Windy Platform Core\n(Windyty S.E.)', type: 'god', layer: 0, cluster: 'core' },

    // Cluster 1: Presentation & Map Architecture
    { id: 'leaflet_base', label: 'Leaflet.js Map Frame\n(#leaflet-map container)', type: 'target', layer: 1, cluster: 'ui' },
    { id: 'leaflet_gl', label: 'Proprietary @leafletGl\n(Custom WebGL 2.0 Shaders)', type: 'proprietary', layer: 1, cluster: 'ui' },
    { id: 'leaflet_velocity', label: 'leaflet-velocity (MIT)\n(2D Canvas Fallback • 0% GPU)', type: 'opensource', layer: 1, cluster: 'ui' },
    { id: 'carto_dark', label: 'CartoDB Dark Matter\n(Zero-Cost Vector Basemap)', type: 'opensource', layer: 1, cluster: 'ui' },

    // Cluster 2: Edge CDN & Data Pipeline
    { id: 'node_edge', label: 'node.windy.com\n(Umisteni Geolocation & Minifest)', type: 'target', layer: 2, cluster: 'data' },
    { id: 'ecmwf_hres', label: 'ECMWF HRES 0.1° Feeds\n[License Wall: $15,000+/yr]', type: 'proprietary', layer: 2, cluster: 'data' },
    { id: 'openmeteo_api', label: 'Open-Meteo GFS/ICON\n(10,000 Free Calls/Day)', type: 'opensource', layer: 2, cluster: 'data' },
    { id: 'noaa_gfs', label: 'NOAA NOMADS GRIB2\n(Unfiltered Open Telemetry)', type: 'opensource', layer: 2, cluster: 'data' },

    // Cluster 3: Radar & Satellite Feeds
    { id: 'rdr_windy', label: 'rdr.windy.com & sat.windy.com\n(Proprietary Tile Compositor)', type: 'proprietary', layer: 3, cluster: 'telemetry' },
    { id: 'rainviewer_api', label: 'RainViewer API v2\n(Free 10-Min Global Doppler)', type: 'opensource', layer: 3, cluster: 'telemetry' },
    { id: 'eumetsat_open', label: 'NOAA GOES & EUMETSAT\n(Public Geosynchronous Tiles)', type: 'opensource', layer: 3, cluster: 'telemetry' },

    // Cluster 4: Atmospheric Pressure Slicing & Aviation
    { id: 'pressure_layers', label: 'Multi-Altitude Isobars\n(Surface to 200hPa Jetstream)', type: 'target', layer: 4, cluster: 'analytics' },
    { id: 'aviation_metar', label: 'METAR / TAF / NOTAMs\n(Airport Station Decoders)', type: 'target', layer: 4, cluster: 'analytics' },

    // Cluster 5: Clean-Room Parity Score
    { id: 'windy_verdict', label: 'Clean-Room Parity: 80%\nMarket Viability: 94%\nRunway: $0.00 / mo', type: 'metric', layer: 5, cluster: 'verdict' }
  ];

  const edges = [
    { source: 'windy_core', target: 'leaflet_base', label: 'mounts inside' },
    { source: 'leaflet_base', target: 'leaflet_gl', label: 'powers particles via' },
    { source: 'leaflet_gl', target: 'leaflet_velocity', label: 'clean-room replaced by' },
    { source: 'leaflet_base', target: 'carto_dark', label: 'renders tiles from' },

    { source: 'windy_core', target: 'node_edge', label: 'requests telemetry' },
    { source: 'node_edge', target: 'ecmwf_hres', label: 'subscribes to' },
    { source: 'ecmwf_hres', target: 'openmeteo_api', label: 'reproduced with zero cost via' },
    { source: 'openmeteo_api', target: 'noaa_gfs', label: 'slices data from' },

    { source: 'windy_core', target: 'rdr_windy', label: 'fetches radar tiles' },
    { source: 'rdr_windy', target: 'rainviewer_api', label: 'open equivalent' },
    { source: 'rdr_windy', target: 'eumetsat_open', label: 'open satellite feed' },

    { source: 'openmeteo_api', target: 'pressure_layers', label: 'provides altitude levels' },
    { source: 'windy_core', target: 'aviation_metar', label: 'parses weather codes' },

    { source: 'leaflet_velocity', target: 'windy_verdict', label: 'ensures Dell E6220 60 FPS' },
    { source: 'openmeteo_api', target: 'windy_verdict', label: 'guarantees $0.00 runway' },
    { source: 'rainviewer_api', target: 'windy_verdict', label: 'yields parity' }
  ];

  return { nodes, edges };
}

// 2. Drik Panchang Deep Graphify Knowledge Cluster (2,828 Sitemap Baseline)
function generateDrikKnowledgeGraph() {
  const nodes = [
    // God Node: Core Engine
    { id: 'drik_core', label: '⚡ Drik Panchang Core\n(Drik Ganita Astronomical Engine)', type: 'god', layer: 0, cluster: 'core' },

    // Cluster 1: Presentation & Charts (Zero GPU)
    { id: 'client_ui', label: 'Client Web & PWA\n(Multi-Lingual Regional Layouts)', type: 'target', layer: 1, cluster: 'ui' },
    { id: 'dp_canvas_shuddhi', label: 'dp-panchangam-shuddhi-canvas\n(Client-Side Script Engine)', type: 'proprietary', layer: 1, cluster: 'ui' },
    { id: 'pure_svg_charts', label: 'Pure 2D SVG Vector Engine\n(North Diamond / South Box)', type: 'opensource', layer: 1, cluster: 'ui' },

    // Cluster 2: Ephemeris & Astronomical Walls
    { id: 'sweph_c', label: 'Swiss Ephemeris (C-Lib)\n[Commercial License: $700+]', type: 'proprietary', layer: 2, cluster: 'ephemeris' },
    { id: 'astro_engine', label: 'astronomy-engine (MIT)\nor pyswisseph (GPLv2)', type: 'opensource', layer: 2, cluster: 'ephemeris' },
    { id: 'nasa_jpl', label: 'NASA JPL DE440\n(High-Precision Perturbation)', type: 'opensource', layer: 2, cluster: 'ephemeris' },
    { id: 'ayanamsha', label: 'Lahiri Ayanamsha 24°13\'\n(Chitra Paksha Precession)', type: 'target', layer: 2, cluster: 'ephemeris' },

    // Cluster 3: The 5 Limbs (Panchanga Precision)
    { id: 'panchanga_limbs', label: '5 Limbs Mathematical Solver\n(Tithi, Nakshatra, Yoga, Karana, Vara)', type: 'target', layer: 3, cluster: 'math' },
    { id: 'hindu_sunrise', label: 'Hindu Geocentric Sunrise\n(Z0 = 90°50\' Refraction Model)', type: 'target', layer: 3, cluster: 'math' },
    { id: 'brent_root', label: 'Brent\'s Root-Finder\n(Sub-Second Boundary Times)', type: 'opensource', layer: 3, cluster: 'math' },

    // Cluster 4: Liturgical Moat (10,000+ Dharmasindhu Rules)
    { id: 'dharmasindhu_moat', label: '10,000+ Dharmasindhu Rules\n[Decade-Long Codification Moat]', type: 'proprietary', layer: 4, cluster: 'liturgical' },
    { id: 'jyotisha_open', label: 'sanskrit-coders/jyotisha\n(1,500 Open Rules Baseline)', type: 'opensource', layer: 4, cluster: 'liturgical' },
    { id: 'nishita_kaal', label: 'Nishita Midnight & Pradosha\n(Solar Horizon Partition)', type: 'target', layer: 4, cluster: 'liturgical' },

    // Cluster 5: Offering Ecosystem (2,828 Sitemap URLs)
    { id: 'sitemap_ecosystem', label: '2,828 Output Ecosystem\n(345 Lyrics, 220 Festivals, 89 Muhurats)', type: 'target', layer: 5, cluster: 'catalog' },

    // Cluster 6: Parity Verdict
    { id: 'drik_verdict', label: 'Clean-Room Parity: 70%\n(Math: 100% | Community Rules: 55%)\nMarket Viability: 94%', type: 'metric', layer: 6, cluster: 'verdict' }
  ];

  const edges = [
    { source: 'drik_core', target: 'client_ui', label: 'serves to user' },
    { source: 'client_ui', target: 'dp_canvas_shuddhi', label: 'renders charts via' },
    { source: 'dp_canvas_shuddhi', target: 'pure_svg_charts', label: 'clean-room replaced by' },

    { source: 'drik_core', target: 'sweph_c', label: 'traditionally queries' },
    { source: 'sweph_c', target: 'astro_engine', label: 'clean-room equivalent' },
    { source: 'astro_engine', target: 'nasa_jpl', label: 'matches coefficients' },
    { source: 'drik_core', target: 'ayanamsha', label: 'applies sidereal offset' },

    { source: 'astro_engine', target: 'panchanga_limbs', label: 'feeds raw coordinates' },
    { source: 'panchanga_limbs', target: 'hindu_sunrise', label: 'synchronizes with Udaya Tithi' },
    { source: 'panchanga_limbs', target: 'brent_root', label: 'calculates transition seconds' },

    { source: 'panchanga_limbs', target: 'dharmasindhu_moat', label: 'inputs into festival trees' },
    { source: 'dharmasindhu_moat', target: 'jyotisha_open', label: 'open-source community baseline' },
    { source: 'dharmasindhu_moat', target: 'nishita_kaal', label: 'evaluates worship windows' },

    { source: 'dharmasindhu_moat', target: 'sitemap_ecosystem', label: 'powers' },
    { source: 'pure_svg_charts', target: 'drik_verdict', label: 'zero GPU strain' },
    { source: 'astro_engine', target: 'drik_verdict', label: '100% mathematical parity' },
    { source: 'jyotisha_open', target: 'drik_verdict', label: 'evaluates parity' }
  ];

  return { nodes, edges };
}

// 3. Generic Autonomous Knowledge Graph Synthesizer
function generateGenericKnowledgeGraph(app, safeId) {
  const nodes = [];
  const edges = [];

  const rootId = `root_${safeId}`;
  nodes.push({
    id: rootId,
    label: `⚡ ${app.name || 'Target Application'}\n(${app.category || 'Web Application'})`,
    type: 'god',
    layer: 0,
    cluster: 'core'
  });

  const uiId = `ui_${safeId}`;
  nodes.push({
    id: uiId,
    label: `Client Presentation Layer\n(${app.url || 'Web Client'})`,
    type: 'target',
    layer: 1,
    cluster: 'ui'
  });
  edges.push({ source: rootId, target: uiId, label: 'presents interface' });

  const catchText = app.commercialCatch || 'Proprietary Cloud Services & APIs';
  const catchParts = catchText.split(/[&;+]/).map(s => s.trim()).filter(Boolean);
  const wallIds = [];

  catchParts.forEach((part, index) => {
    const wallId = `wall_${safeId}_${index}`;
    wallIds.push(wallId);
    nodes.push({
      id: wallId,
      label: `Commercial Catch:\n${part}`,
      type: 'proprietary',
      layer: 2,
      cluster: 'commercial'
    });
    edges.push({ source: uiId, target: wallId, label: 'locked by' });
  });

  const stackText = app.openStack || 'Open-Source Primitives + Free Serverless';
  const stackParts = stackText.split(/[+;,]/).map(s => s.trim()).filter(Boolean);
  const openIds = [];

  stackParts.forEach((part, index) => {
    const openId = `open_${safeId}_${index}`;
    openIds.push(openId);
    nodes.push({
      id: openId,
      label: `Open Equivalent:\n${part}`,
      type: 'opensource',
      layer: 3,
      cluster: 'open'
    });

    if (wallIds.length > 0) {
      edges.push({ source: wallIds[index % wallIds.length], target: openId, label: 'clean-room replaced by' });
    } else {
      edges.push({ source: uiId, target: openId, label: 'powered by' });
    }
  });

  const metricId = `metric_${safeId}`;
  nodes.push({
    id: metricId,
    label: `Overall Parity: ${app.parity || 75}%\nMarket Index: ${app.marketIndex || 'High'}\nRunway: $0.00 / mo`,
    type: 'metric',
    layer: 4,
    cluster: 'verdict'
  });

  openIds.forEach(oId => {
    edges.push({ source: oId, target: metricId, label: 'yields parity' });
  });

  return { nodes, edges };
}

// Cytoscape Renderer with Graphify Visual Polish
function initCytoscape(app) {
  const container = document.getElementById('cy');
  if (!container) return;

  const { nodes: graphNodes, edges: graphEdges } = generateArchitectureDAG(app);

  const elements = {
    nodes: graphNodes.map(n => ({ data: n })),
    edges: graphEdges.map(e => ({ data: e }))
  };

  const cy = cytoscape({
    container: container,
    boxSelectionEnabled: false,
    autounselectify: true,
    wheelSensitivity: 0.2,
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'color': '#F8FAFC',
          'font-size': '11px',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          'text-valign': 'center',
          'text-halign': 'center',
          'background-color': '#1E293B',
          'width': 'label',
          'height': '48px',
          'padding': '16px',
          'shape': 'round-rectangle',
          'border-width': 1.5,
          'border-color': '#475569',
          'text-wrap': 'wrap'
        }
      },
      // Graphify God Nodes (Central Pillars)
      {
        selector: 'node[type = "god"]',
        style: {
          'background-color': '#3B82F6',
          'border-color': '#93C5FD',
          'border-width': 2.5,
          'font-weight': 'bold',
          'font-size': '13px',
          'shadow-blur': 12,
          'shadow-color': '#3B82F6',
          'shadow-opacity': 0.4
        }
      },
      {
        selector: 'node[type = "target"]',
        style: {
          'background-color': '#0284C7',
          'border-color': '#38BDF8',
          'font-weight': '600'
        }
      },
      // The Commercial Wall
      {
        selector: 'node[type = "proprietary"]',
        style: {
          'background-color': '#881337',
          'border-color': '#F43F5E',
          'border-width': 2,
          'font-weight': '600'
        }
      },
      // Zero-Cost Open Alternatives
      {
        selector: 'node[type = "opensource"]',
        style: {
          'background-color': '#064E3B',
          'border-color': '#10B981',
          'border-width': 2,
          'font-weight': '600'
        }
      },
      // Metric & Verdict
      {
        selector: 'node[type = "metric"]',
        style: {
          'background-color': '#78350F',
          'border-color': '#F59E0B',
          'border-width': 2,
          'font-weight': 'bold',
          'font-size': '11px'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 1.8,
          'line-color': '#475569',
          'target-arrow-color': '#94A3B8',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': '9px',
          'color': '#CBD5E1',
          'text-rotation': 'autorotate',
          'text-background-opacity': 0.8,
          'text-background-color': '#0F172A',
          'text-background-padding': '2px',
          'text-background-shape': 'roundrectangle'
        }
      }
    ],
    elements: elements,
    layout: {
      name: 'breadthfirst',
      directed: true,
      spacingFactor: 1.5,
      padding: 40,
      avoidOverlap: true,
      animate: false
    }
  });

  window.cy = cy;
  cy.fit(undefined, 35);
}

// Controls
function zoomGraph(factor) {
  if (!window.cy) return;
  const zoom = window.cy.zoom();
  window.cy.zoom({
    level: zoom * factor,
    renderedPosition: { x: window.cy.width() / 2, y: window.cy.height() / 2 }
  });
}

function fitGraph() {
  if (!window.cy) return;
  window.cy.fit(undefined, 35);
}

function resetGraphLayout() {
  if (!window.cy) return;
  window.cy.layout({
    name: 'breadthfirst',
    directed: true,
    spacingFactor: 1.5,
    padding: 40,
    avoidOverlap: true,
    animate: false
  }).run();
  window.cy.fit(undefined, 35);
}

function searchGraphNode(query) {
  if (!window.cy) return;
  const q = query.trim().toLowerCase();
  window.cy.batch(() => {
    if (!q) {
      window.cy.nodes().style('opacity', 1);
      window.cy.edges().style('opacity', 1);
      return;
    }
    const matched = window.cy.nodes().filter(n => (n.data('label') || '').toLowerCase().includes(q));
    if (matched.length > 0) {
      window.cy.nodes().style('opacity', 0.2);
      window.cy.edges().style('opacity', 0.1);
      matched.style('opacity', 1);
      matched.neighborhood().style('opacity', 0.85);
      window.cy.animate({ center: { eles: matched.first() }, duration: 250 });
    }
  });
}
