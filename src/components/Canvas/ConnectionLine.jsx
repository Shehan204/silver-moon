import React, { memo, useEffect, useState } from 'react';
import useStore from '../../stores/useStore';
import { useConfirmation } from '../Shared/ConfirmationDialog';

const ConnectionLine = memo(({ connection, isTemp, x1, y1, x2, y2 }) => {
    const { nodes, zoomLevel, removeConnection } = useStore(state => ({
        nodes: state.nodes,
        zoomLevel: state.zoomLevel,
        removeConnection: state.removeConnection
    }));

    const [calculatedPoints, setCalculatedPoints] = useState(null);
    const [strokeColor, setStrokeColor] = useState('#3b82f6');
    const confirm = useConfirmation();

    useEffect(() => {
        const calculateConnectionPoints = () => {
            if (!connection) return;

            const toNode = nodes.find(n => n.id === connection.to);
            const fromNode = nodes.find(n => n.id === connection.from);
            
            if (!toNode || !fromNode) {
                setCalculatedPoints(null);
                return;
            }

            // Determine stroke color based on target node type
            const newColor = {
                'goodending': '#10b981',
                'badending': '#ef4444',
                'home': '#f59e0b'
            }[toNode.type.toLowerCase()] || '#3b82f6';
            setStrokeColor(newColor);

            // Get DOM elements with slight delay to ensure render
            setTimeout(() => {
                const fromEl = document.querySelector(`[data-node-id="${fromNode.id}"] .connection-dot`);
                const toEl = document.querySelector(`[data-node-id="${toNode.id}"] .connection-dot`);
                const canvas = document.querySelector('.canvas-container');

                if (!fromEl || !toEl || !canvas) {
                    setCalculatedPoints(null);
                    return;
                }

                const canvasRect = canvas.getBoundingClientRect();
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();

                const newPoints = {
                    x1: (fromRect.left + fromRect.width/2 - canvasRect.left + canvas.scrollLeft) / zoomLevel,
                    y1: (fromRect.top + fromRect.height/2 - canvasRect.top + canvas.scrollTop) / zoomLevel,
                    x2: (toRect.left + toRect.width/2 - canvasRect.left + canvas.scrollLeft) / zoomLevel,
                    y2: (toRect.top + toRect.height/2 - canvasRect.top + canvas.scrollTop) / zoomLevel
                };

                setCalculatedPoints(newPoints);
            }, 50);
        };

        calculateConnectionPoints();
    }, [nodes, connection, zoomLevel]);

    const handleDelete = async (e) => {
        e.stopPropagation();
        const shouldDelete = await confirm('Are you sure you want to delete this connection?');
        if (shouldDelete && connection?.id) {
            removeConnection(connection.id);
        }
    };

    if (!calculatedPoints || 
        calculatedPoints.x1 === undefined || 
        calculatedPoints.y1 === undefined || 
        calculatedPoints.x2 === undefined || 
        calculatedPoints.y2 === undefined) {
        return null;
    }

    return (
        <g 
            onClick={handleDelete}
            className="connection-group"
            style={{ cursor: 'pointer' }}
        >
            <line
                x1={calculatedPoints.x1}
                y1={calculatedPoints.y1}
                x2={calculatedPoints.x2}
                y2={calculatedPoints.y2}
                stroke={isTemp ? '#3b82f6' : strokeColor}
                strokeWidth={3.5}
                className={isTemp ? 'temporary-connection' : 'permanent-connection'}
            />
            <title>Click to delete connection</title>
        </g>
    );
});

export default ConnectionLine;