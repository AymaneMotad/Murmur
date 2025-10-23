import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { DrawingStroke } from '@/lib/storage';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  id: string;
  points: Point[];
  color: string;
  strokeWidth: number;
}

interface DrawingCanvasProps {
  width: number;
  height: number;
  onDrawingChange?: (strokes: DrawingStroke[]) => void;
  initialStrokes?: DrawingStroke[];
  strokeColor?: string;
  strokeWidth?: number;
}

export default function DrawingCanvas({
  width,
  height,
  onDrawingChange,
  initialStrokes = [],
  strokeColor = '#ffffff',
  strokeWidth = 3,
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
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setIsDrawing(true);
      setCurrentStroke([{ x: locationX, y: locationY }]);
    },
    onPanResponderMove: (evt) => {
      if (isDrawing) {
        const { locationX, locationY } = evt.nativeEvent;
        const newPoint = { x: locationX, y: locationY };
        
        setCurrentStroke(prev => {
          // Add point if it's different enough from the last point
          if (prev.length === 0 || 
              Math.abs(prev[prev.length - 1].x - newPoint.x) > 0.1 || 
              Math.abs(prev[prev.length - 1].y - newPoint.y) > 0.1) {
            return [...prev, newPoint];
          }
          return prev;
        });
      }
    },
    onPanResponderRelease: () => {
      if (isDrawing && currentStroke.length > 0) {
        const newStroke: DrawingStroke = {
          id: Date.now().toString() + Math.random(),
          points: [...currentStroke],
          color: strokeColor,
          strokeWidth: strokeWidth,
        };
        
        const updatedStrokes = [...strokes, newStroke];
        console.log('Adding new stroke:', newStroke);
        console.log('Updated strokes:', updatedStrokes);
        setStrokes(updatedStrokes);
        onDrawingChange?.(updatedStrokes);
      }
      
      setIsDrawing(false);
      setCurrentStroke([]);
    },
  });

  const renderStroke = (stroke: DrawingStroke) => {
    if (!stroke || !stroke.points || stroke.points.length < 1) {
      return null;
    }
    
    // Handle single point strokes (dots)
    if (stroke.points.length === 1) {
      const point = stroke.points[0];
      return (
        <View
          key={`${stroke.id}-dot`}
          style={[
            styles.strokeLine,
            {
              left: point.x - stroke.strokeWidth / 2,
              top: point.y - stroke.strokeWidth / 2,
              width: stroke.strokeWidth,
              height: stroke.strokeWidth,
              backgroundColor: stroke.color,
              borderRadius: stroke.strokeWidth / 2,
            },
          ]}
        />
      );
    }
    
    // Create continuous lines between points with better rendering
    const lines = [];
    for (let i = 0; i < stroke.points.length - 1; i++) {
      const start = stroke.points[i];
      const end = stroke.points[i + 1];
      
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      
      if (distance > 0.1) { // Only render if distance is meaningful
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        lines.push(
          <View
            key={`${stroke.id}-line-${i}`}
            style={[
              styles.strokeLine,
              {
                left: midX - distance / 2,
                top: midY - stroke.strokeWidth / 2,
                width: distance,
                height: stroke.strokeWidth,
                backgroundColor: stroke.color,
                transform: [{ rotate: `${angle}rad` }],
              },
            ]}
          />
        );
      }
    }
    
    return lines;
  };

  const renderCurrentStroke = () => {
    if (!isDrawing || currentStroke.length < 1) return null;
    
    // Handle single point current stroke (dots)
    if (currentStroke.length === 1) {
      const point = currentStroke[0];
      return (
        <View
          key="current-dot"
          style={[
            styles.strokeLine,
            {
              left: point.x - strokeWidth / 2,
              top: point.y - strokeWidth / 2,
              width: strokeWidth,
              height: strokeWidth,
              backgroundColor: strokeColor,
              borderRadius: strokeWidth / 2,
            },
          ]}
        />
      );
    }
    
    const lines = [];
    for (let i = 0; i < currentStroke.length - 1; i++) {
      const start = currentStroke[i];
      const end = currentStroke[i + 1];
      
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      
      if (distance > 0.1) { // Only render if distance is meaningful
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        lines.push(
          <View
            key={`current-line-${i}`}
            style={[
              styles.strokeLine,
              {
                left: midX - distance / 2,
                top: midY - strokeWidth / 2,
                width: distance,
                height: strokeWidth,
                backgroundColor: strokeColor,
                transform: [{ rotate: `${angle}rad` }],
              },
            ]}
          />
        );
      }
    }
    
    return lines;
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <View
        style={styles.canvas}
        {...panResponder.panHandlers}
      >
        {strokes.filter(stroke => stroke && stroke.points).map(renderStroke)}
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
  strokeLine: {
    position: 'absolute',
    borderRadius: 2,
  },
  strokePoint: {
    position: 'absolute',
  },
});