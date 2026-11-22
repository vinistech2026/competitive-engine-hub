// Cytoscape Deterministic Hierarchical Initializer
// 1. Static Layout: Zero physics bouncing, zero endless drifting
// 2. Hardware Guard: 2D HTML5 Canvas rendering for Dell Latitude E6220 (Intel HD 3000)
// 3. 100+ Node Safe: Focused grid with zoom, fit, and node search capabilities

function initCytoscape(app) {
  const container = document.getElementById('cy');
  if (!container) return;

  const elements = {
    nodes: app.graphNodes.map(n => ({ data: n })),
    edges: app.graphEdges.map(e => ({ data: e }))
  };

  const cy = cytoscape({
    container: container,
    boxSelectionEnabled: false,
    autounselectify: true,
    wheelSensitivity: 0.25, // Smooth Apple-grade scroll zoom
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'color': '#F8FAFC',
          'font-size': '11px',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          'text-valign': 'center',
          'text-halign': 'center',
          'background-color': '#1E293B',
          'width': 'label',
          'height': '38px',
          'padding': '12px',
          'shape': 'round-rectangle',
          'border-width': 1.5,
          'border-color': '#475569',
          'text-wrap': 'wrap'
        }
      },
      {
        selector: 'node[type = "target"]',
        style: {
          'background-color': '#0A84FF',
          'border-color': '#38BDF8',
          'font-weight': 'bold',
          'font-size': '12px',
          'shape': 'round-rectangle',
          'padding': '16px'
        }
      },
      {
        selector: 'node[type = "proprietary"]',
        style: {
          'background-color': '#7F1D1D',
          'border-color': '#EF4444'
        }
      },
      {
        selector: 'node[type = "opensource"]',
        style: {
          'background-color': '#064E3B',
          'border-color': '#10B981'
        }
      },
      {
        selector: 'node[type = "metric"]',
        style: {
          'background-color': '#78350F',
          'border-color': '#F59E0B'
        }
      },
      {
        selector: 'node:selected',
        style: {
          'border-width': 3,
          'border-color': '#38BDF8'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#334155',
          'target-arrow-color': '#64748B',
          'target-arrow-shape': 'triangle',
          'curve-style': 'straight', // Clean straight orthogonal edges (no erratic curves)
          'label': 'data(label)',
          'font-size': '9px',
          'color': '#94A3B8',
          'text-rotation': 'autorotate'
        }
      }
    ],
    elements: elements,
    // Deterministic Breadthfirst / Grid Layout (STATIC - NEVER MOVES ON ITS OWN)
    layout: {
      name: 'breadthfirst',
      directed: true,
      spacingFactor: 1.3,
      padding: 30,
      avoidOverlap: true,
      animate: false // ZERO PHYSICS BOUNCING
    }
  });

  window.cy = cy;
  cy.fit(undefined, 30);
}

// Zoom In / Out Controls
function zoomGraph(factor) {
  if (!window.cy) return;
  const zoom = window.cy.zoom();
  window.cy.zoom({
    level: zoom * factor,
    renderedPosition: { x: window.cy.width() / 2, y: window.cy.height() / 2 }
  });
}

// Fit to Canvas
function fitGraph() {
  if (!window.cy) return;
  window.cy.fit(undefined, 30);
}

// Reset Layout
function resetGraphLayout() {
  if (!window.cy) return;
  window.cy.layout({
    name: 'breadthfirst',
    directed: true,
    spacingFactor: 1.3,
    padding: 30,
    avoidOverlap: true,
    animate: false
  }).run();
  window.cy.fit(undefined, 30);
}

// Search and Highlight specific node in 100+ node graphs
function searchGraphNode(query) {
  if (!window.cy) return;
  const q = query.trim().toLowerCase();
  
  window.cy.batch(() => {
    if (!q) {
      window.cy.nodes().style('opacity', 1);
      window.cy.edges().style('opacity', 1);
      return;
    }

    const matched = window.cy.nodes().filter(node => {
      const label = (node.data('label') || '').toLowerCase();
      return label.includes(q);
    });

    if (matched.length > 0) {
      window.cy.nodes().style('opacity', 0.25);
      window.cy.edges().style('opacity', 0.1);
      matched.style('opacity', 1);
      matched.neighborhood().style('opacity', 0.8);
      
      // Pan camera to the first match
      window.cy.animate({
        center: { eles: matched.first() },
        duration: 250
      });
    }
  });
}
