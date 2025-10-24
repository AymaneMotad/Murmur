import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { DrawingStroke } from '@/lib/storage';

interface Point {
  x: number;
  y: number;
}

interface DrawingCanvasProps {
  width: number;
  height: number;
  onDrawingChange?: (strokes: DrawingStroke[]) => void;
  initialStrokes?: DrawingStroke[];
  strokeColor?: string;
  strokeWidth?: number;
  isErasing?: boolean;
  toolType?: string;
}

export default function DrawingCanvas({
  width,
  height,
  onDrawingChange,
  initialStrokes = [],
  strokeColor = '#ffffff',
  strokeWidth = 3,
  isErasing = false,
  toolType = 'pencil',
}: DrawingCanvasProps) {
  const [strokes, setStrokes] = useState<DrawingStroke[]>(initialStrokes || []);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Update strokes when initialStrokes change
  useEffect(() => {
    setStrokes(initialStrokes || []);
  }, [initialStrokes]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: (evt) => {
      try {
        const { locationX, locationY } = evt.nativeEvent;
        setIsDrawing(true);
        setCurrentStroke([{ x: locationX, y: locationY }]);
      } catch (error) {
        console.error('Error starting drawing:', error);
      }
    },
    onPanResponderMove: (evt) => {
      if (isDrawing) {
        try {
          const { locationX, locationY } = evt.nativeEvent;
          const newPoint = { x: locationX, y: locationY };
          
          setCurrentStroke(prev => {
            // Simplified point filtering - only add if distance is significant
            if (prev.length === 0 || 
                Math.abs(prev[prev.length - 1].x - newPoint.x) > 2 || 
                Math.abs(prev[prev.length - 1].y - newPoint.y) > 2) {
              return [...prev, newPoint];
            }
            return prev;
          });
        } catch (error) {
          console.error('Error during drawing:', error);
        }
      }
    },
    onPanResponderRelease: () => {
      try {
        if (isDrawing && currentStroke.length > 0) {
          if (isErasing) {
            // Simple eraser - remove strokes that intersect with current path
            const eraserRadius = strokeWidth * 2;
            const updatedStrokes = strokes.filter(stroke => {
              return !currentStroke.some(eraserPoint => {
                return stroke.points.some(strokePoint => {
                  const distance = Math.sqrt(
                    Math.pow(strokePoint.x - eraserPoint.x, 2) + 
                    Math.pow(strokePoint.y - eraserPoint.y, 2)
                  );
                  return distance <= eraserRadius;
                });
              });
            });
            
            setStrokes(updatedStrokes);
            onDrawingChange?.(updatedStrokes);
          } else {
            // Add new stroke
            const newStroke: DrawingStroke = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              points: [...currentStroke],
              color: strokeColor,
              strokeWidth: strokeWidth,
              toolType: toolType,
            };
            
            const updatedStrokes = [...strokes, newStroke];
            setStrokes(updatedStrokes);
            onDrawingChange?.(updatedStrokes);
          }
        }
      } catch (error) {
        console.error('Error finishing drawing:', error);
      }
      
      setIsDrawing(false);
      setCurrentStroke([]);
    },
  });

  // Simplified stroke rendering using basic shapes
  const renderStroke = (stroke: DrawingStroke, index: number) => {
    if (!stroke || !stroke.points || stroke.points.length < 1) {
      return null;
    }

    // For single point strokes (dots)
    if (stroke.points.length === 1) {
      const point = stroke.points[0];
      return (
        <View
          key={`stroke-${stroke.id || index}`}
          style={[
            styles.strokePoint,
            {
              left: point.x - stroke.strokeWidth / 2,
              top: point.y - stroke.strokeWidth / 2,
              width: stroke.strokeWidth,
              height: stroke.strokeWidth,
              backgroundColor: stroke.color,
              borderRadius: stroke.strokeWidth / 2,
            }
          ]}
        />
      );
    }

    // For multi-point strokes, render as connected segments
    const segments = [];
    for (let i = 0; i < stroke.points.length - 1; i++) {
      const start = stroke.points[i];
      const end = stroke.points[i + 1];
      
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      
      if (distance > 1) { // Only render if distance is significant
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        segments.push(
          <View
            key={`${stroke.id}-segment-${i}`}
            style={[
              styles.strokeSegment,
              {
                left: midX - distance / 2,
                top: midY - stroke.strokeWidth / 2,
                width: distance,
                height: stroke.strokeWidth,
                backgroundColor: stroke.color,
                borderRadius: stroke.strokeWidth / 2,
                transform: [{ rotate: `${angle}rad` }],
              }
            ]}
          />
        );
      }
    }
    
    return segments;
  };

  // Render current stroke being drawn
  const renderCurrentStroke = () => {
    if (!isDrawing || currentStroke.length < 1) return null;

    // For single point
    if (currentStroke.length === 1) {
      const point = currentStroke[0];
      return (
        <View
          key="current-point"
          style={[
            styles.currentStroke,
            {
              left: point.x - strokeWidth / 2,
              top: point.y - strokeWidth / 2,
              width: strokeWidth,
              height: strokeWidth,
              backgroundColor: strokeColor,
              borderRadius: strokeWidth / 2,
            }
          ]}
        />
      );
    }

    // For multi-point current stroke
    const segments = [];
    for (let i = 0; i < currentStroke.length - 1; i++) {
      const start = currentStroke[i];
      const end = currentStroke[i + 1];
      
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      
      if (distance > 1) {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        segments.push(
          <View
            key={`current-segment-${i}`}
            style={[
              styles.currentStroke,
              {
                left: midX - distance / 2,
                top: midY - strokeWidth / 2,
                width: distance,
                height: strokeWidth,
                backgroundColor: strokeColor,
                borderRadius: strokeWidth / 2,
                transform: [{ rotate: `${angle}rad` }],
              }
            ]}
          />
        );
      }
    }
    
    return segments;
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <View
        style={styles.canvas}
        {...panResponder.panHandlers}
      >
        {/* Render completed strokes */}
        {strokes.map((stroke, index) => renderStroke(stroke, index))}
        
        {/* Render current stroke */}
        {renderCurrentStroke()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f1419',
    borderRadius: 0,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#0f1419',
    position: 'relative',
  },
  strokePoint: {
    position: 'absolute',
  },
  strokeSegment: {
    position: 'absolute',
  },
  currentStroke: {
    position: 'absolute',
  },
});