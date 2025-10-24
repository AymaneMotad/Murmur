import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
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

  // Optimized PanResponder for Android
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
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
            // More aggressive point filtering for better performance
            if (prev.length === 0 || 
                Math.abs(prev[prev.length - 1].x - newPoint.x) > 3 || 
                Math.abs(prev[prev.length - 1].y - newPoint.y) > 3) {
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
            // Improved eraser logic
            const eraserRadius = strokeWidth * 3;
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
            // Add new stroke with better performance
            const newStroke: DrawingStroke = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              points: [...currentStroke],
              color: strokeColor,
              strokeWidth: strokeWidth,
              toolType: toolType,
            };
            
            const updatedStrokes = [...strokes, newStroke];
            // Limit strokes to prevent memory issues
            const limitedStrokes = updatedStrokes.slice(-30);
            setStrokes(limitedStrokes);
            onDrawingChange?.(limitedStrokes);
          }
        }
      } catch (error) {
        console.error('Error finishing drawing:', error);
      }
      
      setIsDrawing(false);
      setCurrentStroke([]);
    },
  });

  // Convert points to SVG path string
  const pointsToPath = (points: Point[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M${points[0].x},${points[0].y}`;
    }
    
    let path = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L${points[i].x},${points[i].y}`;
    }
    return path;
  };

  // Get stroke properties based on tool
  const getStrokeProps = (stroke: DrawingStroke) => {
    const baseProps = {
      stroke: stroke.color,
      strokeWidth: stroke.strokeWidth,
      fill: 'none',
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
    };

    switch (stroke.toolType) {
      case 'marker':
        return {
          ...baseProps,
          strokeOpacity: 0.8,
        };
      case 'brush':
        return {
          ...baseProps,
          strokeOpacity: 0.7,
        };
      case 'pencil':
      default:
        return {
          ...baseProps,
          strokeOpacity: 1,
        };
    }
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg
        width={width}
        height={height}
        style={styles.canvas}
        {...panResponder.panHandlers}
      >
        {/* Render completed strokes */}
        {strokes.map((stroke, index) => {
          if (!stroke || !stroke.points || stroke.points.length === 0) return null;
          
          const path = pointsToPath(stroke.points);
          if (!path) return null;
          
          return (
            <Path
              key={`stroke-${stroke.id || index}`}
              d={path}
              {...getStrokeProps(stroke)}
            />
          );
        })}
        
        {/* Render current stroke */}
        {isDrawing && currentStroke.length > 0 && (
          <Path
            key="current-stroke"
            d={pointsToPath(currentStroke)}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={toolType === 'eraser' ? 0 : 1}
          />
        )}
      </Svg>
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
  },
});