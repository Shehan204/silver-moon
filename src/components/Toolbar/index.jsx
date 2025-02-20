import React from 'react';
import useStore from '../../stores/useStore';
import Button from '../Shared/Button';
import { saveProject, loadProject } from '../../utils/fileHandlers';
import './Toolbar.css';

export default function Toolbar() {
  const { nodes, connections, placingNodeType } = useStore();
  const hasHomeNode = nodes.some(node => node.type === 'Home');

  const handleAddNode = (type) => {
    if (type === 'Home' && hasHomeNode) return;
    if (placingNodeType === type) {
      useStore.getState().cancelPlacement();
    } else {
      useStore.getState().setPlacingNodeType(type);
    }
  };

  const handleSave = () => {
    saveProject(nodes, connections);
  };

  const handleLoad = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const data = await loadProject(file);
      useStore.setState({
        nodes: data.nodes || [],
        connections: data.connections || [],
        placingNodeType: null,
        previewPosition: null
      });
    }
  };

  const getButtonStatus = (type) => {
    return placingNodeType === type ? 'placing' : '';
  };

  return (
    <div className="toolbar-container">
      <div className="toolbar">
        {/* Node Creation Buttons */}
        <Button 
          className={`toolbar-btn scene-btn ${getButtonStatus('Scene')}`}
          onClick={() => handleAddNode('Scene')}
          aria-label="Add new scene node"
        >
          <span className="button-icon">✨</span>
          <span className="button-text">Add Scene</span>
        </Button>

        <Button 
          className={`toolbar-btn good-ending-btn ${getButtonStatus('GoodEnding')}`}
          onClick={() => handleAddNode('GoodEnding')}
          aria-label="Add new good ending node"
        >
          <span className="button-icon">✅</span>
          <span className="button-text">Good Ending</span>
        </Button>

        <Button 
          className={`toolbar-btn bad-ending-btn ${getButtonStatus('BadEnding')}`}
          onClick={() => handleAddNode('BadEnding')}
          aria-label="Add new bad ending node"
        >
          <span className="button-icon">❌</span>
          <span className="button-text">Bad Ending</span>
        </Button>

        <Button 
          className={`toolbar-btn home-btn ${getButtonStatus('Home')}`}
          onClick={() => handleAddNode('Home')}
          aria-label="Add home node"
          disabled={hasHomeNode}
        >
          <span className="button-icon">🏠</span>
          <span className="button-text">Home</span>
        </Button>

        {/* Project Management Buttons */}
        <div className="toolbar-divider" />

        <Button 
          className="toolbar-btn save-btn"
          onClick={handleSave}
          aria-label="Save project"
        >
          <span className="button-icon">💾</span>
          <span className="button-text">Save Project</span>
        </Button>

        <Button 
          className="toolbar-btn load-btn"
          onClick={() => document.getElementById('load-input').click()}
          aria-label="Load project"
        >
          <span className="button-icon">📂</span>
          <span className="button-text">Load Project</span>
          <input
            id="load-input"
            type="file"
            accept=".cyoa"
            hidden
            onChange={handleLoad}
          />
        </Button>

        {/* Placement Status Indicator */}
        {placingNodeType && (
          <div className="placement-status">
            Placing: {placingNodeType} Node
            <br />
            <small>(Click anywhere to place or press ESC to cancel)</small>
          </div>
        )}
      </div>
    </div>
  );
}