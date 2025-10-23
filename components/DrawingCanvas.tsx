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
  isErasing?: boolean;
  toolType?: string; // 'pencil', 'marker', 'brush'
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
  const [eraserPosition, setEraserPosition] = useState<Point | null>(null);

  // Update strokes when initialStrokes change
  useEffect(() => {
    setStrokes(initialStrokes || []);
  }, [initialStrokes]);

  // Get tool-specific stroke characteristics
  const getToolCharacteristics = (tool: string) => {
    switch (tool) {
      case 'pencil':
        return {
          opacity: 0.8 + Math.random() * 0.2, // 0.8-1.0 - slightly transparent
          widthVariation: 0.7 + Math.random() * 0.6, // 0.7-1.3 - more variation
          smoothness: 0.3, // Less smooth, more jagged
        };
      case 'marker':
        return {
          opacity: 0.95 + Math.random() * 0.05, // 0.95-1.0 - very opaque
          widthVariation: 0.9 + Math.random() * 0.2, // 0.9-1.1 - less variation
          smoothness: 0.8, // Very smooth
        };
      case 'brush':
        return {
          opacity: 0.6 + Math.random() * 0.4, // 0.6-1.0 - more transparent
          widthVariation: 0.5 + Math.random() * 1.0, // 0.5-1.5 - high variation
          smoothness: 0.9, // Very smooth
        };
      default:
        return {
          opacity: 0.9 + Math.random() * 0.1,
          widthVariation: 0.9 + Math.random() * 0.2,
          smoothness: 0.5,
        };
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setIsDrawing(true);
      setCurrentStroke([{ x: locationX, y: locationY }]);
      if (isErasing) {
        setEraserPosition({ x: locationX, y: locationY });
      }
    },
    onPanResponderMove: (evt) => {
      if (isDrawing) {
        const { locationX, locationY } = evt.nativeEvent;
        const newPoint = { x: locationX, y: locationY };
        
        setCurrentStroke(prev => {
          // Add point if it's different enough from the last point
          // Increased threshold for better performance on real devices
          if (prev.length === 0 || 
              Math.abs(prev[prev.length - 1].x - newPoint.x) > 1 || 
              Math.abs(prev[prev.length - 1].y - newPoint.y) > 1) {
            return [...prev, newPoint];
          }
          return prev;
        });
        
        if (isErasing) {
          setEraserPosition(newPoint);
        }
      }
    },
    onPanResponderRelease: () => {
      if (isDrawing && currentStroke.length > 0) {
        if (isErasing) {
          // Eraser mode - remove parts of strokes that intersect with eraser path
          const eraserRadius = strokeWidth * 1.5; // Slightly larger for better erasing
          const updatedStrokes = strokes.map(stroke => {
            // Create a more precise erasing by checking each point against the eraser path
            const filteredPoints = stroke.points.filter(strokePoint => {
              // Check if this point is within eraser radius of any point in the eraser path
              return !currentStroke.some(eraserPoint => {
                const distance = Math.sqrt(
                  Math.pow(strokePoint.x - eraserPoint.x, 2) + 
                  Math.pow(strokePoint.y - eraserPoint.y, 2)
                );
                return distance <= eraserRadius;
              });
            });
            
            // Only keep the stroke if it has enough points left (at least 2 for a line)
            return filteredPoints.length >= 2 ? {
              ...stroke,
              points: filteredPoints
            } : null;
          }).filter(Boolean); // Remove null strokes
          
          setStrokes(updatedStrokes);
          onDrawingChange?.(updatedStrokes);
        } else {
          // Drawing mode - add new stroke
          const newStroke: DrawingStroke = {
            id: Date.now().toString() + Math.random(),
            points: [...currentStroke],
            color: strokeColor,
            strokeWidth: strokeWidth,
          };
          
          const updatedStrokes = [...strokes, newStroke];
          setStrokes(updatedStrokes);
          onDrawingChange?.(updatedStrokes);
        }
      }
      
      setIsDrawing(false);
      setCurrentStroke([]);
      if (isErasing) {
        setEraserPosition(null);
      }
    },
  });

  const renderStroke = (stroke: DrawingStroke) => {
    if (!stroke || !stroke.points || stroke.points.length < 1) {
      return null;
    }
    
    // Handle single point strokes (dots)
    if (stroke.points.length === 1) {
      const point = stroke.points[0];
      const toolChars = getToolCharacteristics(toolType);
      const naturalSize = stroke.strokeWidth * toolChars.widthVariation;
      return (
        <View
          key={`${stroke.id}-dot`}
          style={[
            styles.strokeLine,
            {
              left: point.x - naturalSize / 2,
              top: point.y - naturalSize / 2,
              width: naturalSize,
              height: naturalSize,
              backgroundColor: stroke.color,
              borderRadius: naturalSize / 2,
              opacity: toolChars.opacity,
            },
          ]}
        />
      );
    }
    
    // Create tool-specific stroke rendering
    const lines = [];
    const toolChars = getToolCharacteristics(toolType);
    
    for (let i = 0; i < stroke.points.length - 1; i++) {
      const start = stroke.points[i];
      const end = stroke.points[i + 1];
      
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      
      // Use tool-specific smoothness threshold
      const threshold = toolChars.smoothness > 0.7 ? 0.3 : 0.8;
      
      if (distance > threshold) {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        // Apply tool-specific characteristics
        const naturalWidth = stroke.strokeWidth * toolChars.widthVariation;
        
        lines.push(
          <View
            key={`${stroke.id}-line-${i}`}
            style={[
              styles.strokeLine,
              {
                left: midX - distance / 2,
                top: midY - naturalWidth / 2,
                width: distance,
                height: naturalWidth,
                backgroundColor: stroke.color,
                opacity: toolChars.opacity,
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
      const toolChars = getToolCharacteristics(toolType);
      const naturalSize = strokeWidth * toolChars.widthVariation;
      return (
        <View
          key="current-dot"
          style={[
            styles.strokeLine,
            {
              left: point.x - naturalSize / 2,
              top: point.y - naturalSize / 2,
              width: naturalSize,
              height: naturalSize,
              backgroundColor: strokeColor,
              borderRadius: naturalSize / 2,
              opacity: toolChars.opacity,
            },
          ]}
        />
      );
    }
    
    const lines = [];
    const toolChars = getToolCharacteristics(toolType);
    
    for (let i = 0; i < currentStroke.length - 1; i++) {
      const start = currentStroke[i];
      const end = currentStroke[i + 1];
      
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      
      // Use tool-specific smoothness threshold
      const threshold = toolChars.smoothness > 0.7 ? 0.3 : 0.8;
      
      if (distance > threshold) {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        // Apply tool-specific characteristics
        const naturalWidth = strokeWidth * toolChars.widthVariation;
        
        lines.push(
          <View
            key={`current-line-${i}`}
            style={[
              styles.strokeLine,
              {
                left: midX - distance / 2,
                top: midY - naturalWidth / 2,
                width: distance,
                height: naturalWidth,
                backgroundColor: strokeColor,
                opacity: toolChars.opacity,
                transform: [{ rotate: `${angle}rad` }],
              },
            ]}
          />
        );
      }
    }
    
    return lines;
  };

  const renderEraserCursor = () => {
    if (!isErasing || !eraserPosition) return null;
    
    const eraserSize = strokeWidth * 2; // Make cursor visible
    return (
      <View
        style={[
          styles.eraserCursor,
          {
            left: eraserPosition.x - eraserSize / 2,
            top: eraserPosition.y - eraserSize / 2,
            width: eraserSize,
            height: eraserSize,
            borderRadius: eraserSize / 2,
          },
        ]}
      />
    );
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <View
        style={styles.canvas}
        {...panResponder.panHandlers}
      >
        {strokes.filter(stroke => stroke && stroke.points).map(renderStroke)}
        {renderCurrentStroke()}
        {renderEraserCursor()}
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
  eraserCursor: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#ff3b30',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    zIndex: 1000,
  },
});