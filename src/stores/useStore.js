import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Main state
  nodes: [],
  connections: [],
  zoomLevel: 1,
  draggingConnection: null,
  selectedNode: null,
  placingNodeType: null,
  previewPosition: null,
  history: [],

  // Node actions
  addNode: (node) => {
    // Prevent adding multiple home nodes
    if (node.type === 'Home' && get().nodes.some(n => n.type === 'Home')) {
      return;
    }
    
    set((state) => ({
      nodes: [...state.nodes, {
        ...node,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }],
      history: [...state.history.slice(-9), { nodes: state.nodes, connections: state.connections }]
    }));
  },

  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== id),
    connections: state.connections.filter(c => c.from !== id && c.to !== id),
    history: [...state.history.slice(-9), { nodes: state.nodes, connections: state.connections }]
  })),

  updateNodePosition: (id, x, y) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { 
        ...node, 
        x, 
        y, 
        updatedAt: new Date().toISOString() 
      } : node
    )
  })),

  updateNodeTitle: (id, title) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { 
        ...node, 
        title,
        updatedAt: new Date().toISOString() 
      } : node
    )
  })),

  updateNodeDescription: (id, description) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { 
        ...node, 
        description,
        updatedAt: new Date().toISOString() 
      } : node
    )
  })),

  // Connection actions
  addConnection: (connection) => set((state) => {
    const exists = state.connections.some(c => 
      (c.from === connection.from && c.to === connection.to) ||
      (c.from === connection.to && c.to === connection.from)
    );
    
    return exists ? state : {
      connections: [...state.connections, {
        ...connection,
        id: `conn_${Date.now()}`,
        createdAt: new Date().toISOString()
      }],
      history: [...state.history.slice(-9), { nodes: state.nodes, connections: state.connections }]
    };
  }),

  removeConnection: (id) => set((state) => ({
    connections: state.connections.filter(c => c.id !== id),
    history: [...state.history.slice(-9), { nodes: state.nodes, connections: state.connections }]
  })),

  // Placement actions
  setPlacingNodeType: (type) => set({ placingNodeType: type }),
  setPreviewPosition: (pos) => set({ previewPosition: pos }),
  cancelPlacement: () => set({ placingNodeType: null, previewPosition: null }),

  // Connection dragging
  setDraggingConnection: (connection) => set({ draggingConnection: connection }),
  
  updateConnectionPosition: (x, y) => set((state) => ({
    draggingConnection: state.draggingConnection ? {
      ...state.draggingConnection,
      currentX: x,
      currentY: y
    } : null
  })),

  // Project management
  importState: (newState) => set({
    nodes: newState.nodes || [],
    connections: newState.connections || [],
    history: []
  }),

  clearCanvas: () => {
    if (window.confirm('Clear all nodes and connections?')) {
      set({ nodes: [], connections: [], history: [] });
    }
  },

  // Selection management
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),

  // History management
  pushToHistory: () => set(state => ({
    history: [...state.history.slice(-9), {
      nodes: state.nodes,
      connections: state.connections
    }]
  }))
}));

export default useStore;