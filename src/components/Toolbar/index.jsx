import React, { useState, useEffect } from 'react';
import useStore from '../../stores/useStore';
import Button from '../Shared/Button';
import { saveProject, loadProject } from '../../utils/fileHandlers';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import './Toolbar.css';

// Initialize Firestore
const db = getFirestore();

export default function Toolbar() {
  const { nodes, connections, placingNodeType } = useStore();
  const hasHomeNode = nodes.some(node => node.type === 'Home');
  
  // State variables
  const [uploadStatus, setUploadStatus] = useState({ visible: false, progress: 0, message: '' });
  const [showFirebaseLoad, setShowFirebaseLoad] = useState(false);
  const [firebaseProjects, setFirebaseProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

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

  const handleUploadToFirebase = async () => {
    try {
      const homeNode = nodes.find(n => n.type === 'Home');
      if (!homeNode) {
        alert('Please create a Home node before uploading');
        return;
      }

      setUploadStatus({ visible: true, progress: 0, message: 'Preparing upload...' });
      
      // Sanitize project name
      const projectName = homeNode.title
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .substring(0, 50);

      const projectRef = doc(db, 'projects', projectName);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      await setDoc(projectRef, {
        nodes,
        connections,
        createdAt: new Date().toISOString(),
        projectName: homeNode.title
      });

      clearInterval(progressInterval);
      setUploadStatus({ visible: true, progress: 100, message: 'Upload complete!' });
      setTimeout(() => setUploadStatus({ ...uploadStatus, visible: false }), 2000);
    } catch (error) {
      console.error('Error uploading project: ', error);
      setUploadStatus({ visible: true, progress: 0, message: `Error: ${error.message}` });
      setTimeout(() => setUploadStatus({ ...uploadStatus, visible: false }), 3000);
    }
  };

  const loadFirebaseProject = async (projectId) => {
    try {
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        useStore.setState({
          nodes: data.nodes || [],
          connections: data.connections || [],
          placingNodeType: null,
          previewPosition: null
        });
        setShowFirebaseLoad(false);
        alert(`Successfully loaded project: ${data.projectName}`);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Error loading project from Firebase');
    }
  };

  const fetchFirebaseProjects = async () => {
    try {
      setLoadingProjects(true);
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projects = [];
      querySnapshot.forEach((doc) => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setFirebaseProjects(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (showFirebaseLoad) {
      fetchFirebaseProjects();
    }
  }, [showFirebaseLoad]);

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

        <Button 
          className="toolbar-btn firebase-btn"
          onClick={handleUploadToFirebase}
          aria-label="Upload to Firebase"
        >
          <span className="button-icon">🔥</span>
          <span className="button-text">Upload to Cloud</span>
        </Button>

        <Button 
          className="toolbar-btn firebase-load-btn"
          onClick={() => setShowFirebaseLoad(true)}
          aria-label="Load from Firebase"
        >
          <span className="button-icon">☁️</span>
          <span className="button-text">Load from Cloud</span>
        </Button>

        {/* Placement Status Indicator */}
        {placingNodeType && (
          <div className="placement-status">
            Placing: {placingNodeType} Node
            <br />
            <small>(Click anywhere to place or press ESC to cancel)</small>
          </div>
        )}

        {/* Upload Status Bar */}
        {uploadStatus.visible && (
          <div className="upload-status-bar">
            <div className="upload-progress" style={{ width: `${uploadStatus.progress}%` }} />
            <div className="upload-message">{uploadStatus.message}</div>
          </div>
        )}

        {/* Firebase Load Modal */}
        {showFirebaseLoad && (
          <div className="firebase-load-modal">
            <div className="modal-content">
              <h3>Cloud Saves</h3>
              <button className="close-modal" onClick={() => setShowFirebaseLoad(false)}>×</button>
              
              {loadingProjects ? (
                <div className="loading-projects">
                  <div className="loading-spinner"></div>
                  Loading cloud projects...
                </div>
              ) : (
                <div className="project-list">
                  {firebaseProjects.length > 0 ? (
                    firebaseProjects.map(project => (
                      <div 
                        key={project.id} 
                        className="project-item"
                        onClick={() => loadFirebaseProject(project.id)}
                      >
                        <div className="project-name">{project.projectName || 'Untitled Project'}</div>
                        <div className="project-meta">
                          <span className="project-id">ID: {project.id}</span>
                          <span className="project-date">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-projects">No projects found in cloud storage</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}