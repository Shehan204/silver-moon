import React, { memo } from 'react';
import useStore from '../../stores/useStore';
import { useConfirmation } from '../Shared/ConfirmationDialog';

const ConnectionLine = memo(({ connection, isTemp, x1, y1, x2, y2 }) => {
    const { nodes, zoomLevel, removeConnection } = useStore(state => ({
        nodes: state.nodes,
        zoomLevel: state.zoomLevel,
        removeConnection: state.removeConnection
    }));

    const confirm = useConfirmation();

    let finalX1 = x1, finalY1 = y1, finalX2 = x2, finalY2 = y2;
    let strokeColor = '#3b82f6'; // Default blue for scenes

    if (connection) {
        const toNode = nodes.find(n => n.id === connection.to);
        if (toNode) {
            switch(toNode.type.toLowerCase()) {
                case 'goodending':
                    strokeColor = '#10b981'; // Green for good endings
                    break;
                case 'badending':
                    strokeColor = '#ef4444'; // Red for bad endings
                    break;
                case 'home':
                    strokeColor = '#f59e0b'; // Orange for home node
                    break;
                default:
                    strokeColor = '#3b82f6'; // Blue for regular scenes
            }
        }

        const fromNode = nodes.find(n => n.id === connection.from);
        if (fromNode && toNode) {
            const fromNodeEl = document.querySelector(`[data-node-id="${fromNode.id}"] .connection-dot`);
            const toNodeEl = document.querySelector(`[data-node-id="${toNode.id}"] .connection-dot`);

            if (fromNodeEl && toNodeEl) {
                const fromRect = fromNodeEl.getBoundingClientRect();
                const toRect = toNodeEl.getBoundingClientRect();
                const canvasRect = document.querySelector('.canvas-container').getBoundingClientRect();

                finalX1 = (fromRect.left + fromRect.width/2 - canvasRect.left + 
                          document.querySelector('.canvas-container').scrollLeft) / zoomLevel;
                finalY1 = (fromRect.top + fromRect.height/2 - canvasRect.top + 
                          document.querySelector('.canvas-container').scrollTop) / zoomLevel;

                finalX2 = (toRect.left + toRect.width/2 - canvasRect.left + 
                          document.querySelector('.canvas-container').scrollLeft) / zoomLevel;
                finalY2 = (toRect.top + toRect.height/2 - canvasRect.top + 
                          document.querySelector('.canvas-container').scrollTop) / zoomLevel;
            }
        }
    }

    const handleDelete = async (e) => {
        e.stopPropagation();
        const shouldDelete = await confirm('Are you sure you want to delete this connection?');
        if (shouldDelete && connection?.id) {
            removeConnection(connection.id);
        }
    };

    if (finalX1 === undefined || finalY1 === undefined || 
        finalX2 === undefined || finalY2 === undefined) return null;

    return (
        <g 
            onClick={handleDelete}
            className="connection-group"
            style={{ cursor: 'pointer' }}
        >
            <line
                x1={finalX1}
                y1={finalY1}
                x2={finalX2}
                y2={finalY2}
                stroke={isTemp ? '#3b82f6' : strokeColor}
                strokeWidth={3.5}
                className={isTemp ? 'temporary-connection' : 'permanent-connection'}
            />
            <title>Click to delete connection</title>
        </g>
    );
});

export default ConnectionLine;