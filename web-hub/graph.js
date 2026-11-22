// Universal Dynamic Graph Architecture Engine for Competitive Studio
// Replaces static hardcoded if/else with dynamic DAG synthesis from any audited target

function generateArchitectureDAG(app) {
  // If app has manually provided graphNodes/graphEdges with custom depth, use them
  if (app.graphNodes && app.graphNodes.length > 0 && app.graphEdges && app.graphEdges.length > 0) {
    return { nodes: app.graphNodes, edges: app.graphEdges };
  }

  const nodes = [];
  const edges = [];
  const safeId = (app.id || 'target').replace(/[^a-zA-Z0-9_]/g, '_');

  // Layer 0: Target Client / Product Presentation
  const rootId = `root_${safeId}`;
  nodes.push({
    id: rootId,
    label: `${app.name || 'Target Application'}\n(${app.category || 'Web Application'})`,
    type: 'target',
    layer: 0
  });

  // Layer 0 Sub-system: Frontend / UI Engine
  const uiId = `ui_${safeId}`;
  const uiLabel = app.url && app.url.includes('http') 
    ? `Client Web Presentation\n${new URL(app.url).hostname}` 
    : `Client Web Presentation\n(Interactive UI Layer)`;
  nodes.push({
    id: uiId,
    label: uiLabel,
    type: 'target',
    layer: 0
  });
  edges.push({ source: rootId, target: uiId, label: 'presents via' });

  // Layer 1: Commercial Walls / Proprietary Catch
  // Parse catch into individual proprietary bottlenecks
  const catchText = app.commercialCatch || (app.briefing && app.briefing.catch) || 'Proprietary Cloud Services & APIs';
  const catchParts = catchText.split(/[&;+]/).map(s => s.trim()).filter(Boolean);
  
  const wallIds = [];
  catchParts.forEach((part, index) => {
    const wallId = `wall_${safeId}_${index}`;
    wallIds.push(wallId);
    // Wrap text for Cytoscape node readability
    const shortLabel = part.length > 40 ? part.slice(0, 38) + '...' : part;
    nodes.push({
      id: wallId,
      label: `Proprietary Wall:\n${shortLabel}`,
      type: 'proprietary',
      layer: 1
    });
    edges.push({ source: uiId, target: wallId, label: 'locked by' });
  });

  // Layer 2: Zero-Cost Open Source Replacements
  // Parse open stack into modular alternatives
  const stackText = app.openStack || (app.briefing && app.briefing.stack ? app.briefing.stack.join(' + ') : 'Open Source Primitives');
  const stackParts = stackText.split(/[+;,]/).map(s => s.trim()).filter(Boolean);

  const openIds = [];
  stackParts.forEach((part, index) => {
    const openId = `open_${safeId}_${index}`;
    openIds.push(openId);
    const shortPart = part.length > 42 ? part.slice(0, 40) + '...' : part;
    nodes.push({
      id: openId,
      label: `Zero-Cost Alternative:\n${shortPart}`,
      type: 'opensource',
      layer: 2
    });

    // Wire to corresponding wall or client
    if (wallIds.length > 0) {
      const targetWall = wallIds[index % wallIds.length];
      edges.push({ source: targetWall, target: openId, label: 'clean-room replaced by' });
    } else {
      edges.push({ source: uiId, target: openId, label: 'powered by' });
    }
  });

  // Layer 3: Evaluation & Parity Verdict
  const metricId = `metric_${safeId}`;
  const parityVal = app.parity || 75;
  const marketVal = app.marketIndex || 'High';
  nodes.push({
    id: metricId,
    label: `Overall Parity: ${parityVal}%\nMarket Viability: ${marketVal}\nRunway: $0.00 / mo`,
    type: 'metric',
    layer: 3
  });

  // Connect open source replacements to the final metric node
  if (openIds.length > 0) {
    openIds.forEach(oId => {
      edges.push({ source: oId, target: metricId, label: 'yields parity' });
    });
  } else {
    edges.push({ source: rootId, target: metricId, label: 'evaluated' });
  }

  return { nodes, edges };
}

function initCytoscape(app) {
  const container = document.getElementById('cy');
  if (!container) return;

  // Dynamically generate the DAG for any application
  const { nodes: graphNodes, edges: graphEdges } = generateArchitectureDAG(app);

  const elements = {
    nodes: graphNodes.map(n => ({ data: n })),
    edges: graphEdges.map(e => ({ data: e }))
  };

  const cy = cytoscape({
    container: container,
    boxSelectionEnabled: false,
    autounselectify: true,
    wheelSensitivity: 0.25,
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
          'height': '46px',
          'padding': '16px',
          'shape': 'round-rectangle',
          'border-width': 1.5,
          'border-color': '#475569',
          'text-wrap': 'wrap'
        }
      },
      {
        selector: 'node[type = "target"]',
        style: {
          'background-color': '#0284C7',
          'border-color': '#38BDF8',
          'font-weight': 'bold',
          'font-size': '12px'
        }
      },
      {
        selector: 'node[type = "proprietary"]',
        style: {
          'background-color': '#881337',
          'border-color': '#F43F5E',
          'font-weight': '500'
        }
      },
      {
        selector: 'node[type = "opensource"]',
        style: {
          'background-color': '#064E3B',
          'border-color': '#10B981',
          'font-weight': '500'
        }
      },
      {
        selector: 'node[type = "metric"]',
        style: {
          'background-color': '#78350F',
          'border-color': '#F59E0B',
          'font-weight': 'bold'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#334155',
          'target-arrow-color': '#64748B',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': '9px',
          'color': '#94A3B8',
          'text-rotation': 'autorotate'
        }
      }
    ],
    elements: elements,
    layout: {
      name: 'breadthfirst',
      directed: true,
      spacingFactor: 1.4,
      padding: 35,
      avoidOverlap: true,
      animate: false
    }
  });

  window.cy = cy;
  cy.fit(undefined, 30);
}

// Zoom / Fit Controls
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
  window.cy.fit(undefined, 30);
}

function resetGraphLayout() {
  if (!window.cy) return;
  window.cy.layout({
    name: 'breadthfirst',
    directed: true,
    spacingFactor: 1.4,
    padding: 35,
    avoidOverlap: true,
    animate: false
  }).run();
  window.cy.fit(undefined, 30);
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
      window.cy.nodes().style('opacity', 0.25);
      window.cy.edges().style('opacity', 0.1);
      matched.style('opacity', 1);
      matched.neighborhood().style('opacity', 0.85);
      window.cy.animate({ center: { eles: matched.first() }, duration: 250 });
    }
  });
}
