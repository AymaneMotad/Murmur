import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions, GestureResponderEvent } from 'react-native';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  level: number;
  connections: string[];
}

interface MindMapViewProps {
  text: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MindMapView({ text }: MindMapViewProps) {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    generateMindMap();
  }, [text]);

  const generateMindMap = useCallback(() => {
    if (!text.trim()) return;

    // Enhanced text analysis with better concept extraction
    const stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
      'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just',
      'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
      'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
      'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were'
    ]);

    // Extract meaningful words with better filtering
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length >= 3 && 
        word.length <= 20 && 
        !stopWords.has(word) &&
        !/^\d+$/.test(word) // Remove pure numbers
      );

    // Count word frequency with importance weighting
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      // Weight words by position (earlier words are more important)
      const weight = 1;
      wordCount[word] = (wordCount[word] || 0) + weight;
    });

    // Get top concepts with better selection
    const topWords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6) // Reduced to 6 for cleaner layout
      .map(([word]) => word);

    if (topWords.length === 0) return;

    // Create nodes with improved layout
    const newNodes: MindMapNode[] = [];
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2 - 80; // Adjusted for better positioning

    // Central node with dynamic text
    const mainTopic = text.split(' ').slice(0, 3).join(' ') || 'Main Topic';
    newNodes.push({
      id: 'center',
      text: mainTopic.length > 20 ? mainTopic.substring(0, 17) + '...' : mainTopic,
      x: centerX,
      y: centerY,
      level: 0,
      connections: topWords.slice(0, 6)
    });

    // Create improved radial layout with better spacing
    const nodeCount = Math.min(topWords.length, 6);
    const baseRadius = 120; // Reduced for cleaner look
    const angleStep = (2 * Math.PI) / nodeCount;
    
    topWords.slice(0, nodeCount).forEach((word, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const radius = baseRadius + (index % 2 === 0 ? 0 : 20); // Alternate radius for visual interest
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      newNodes.push({
        id: word,
        text: word.charAt(0).toUpperCase() + word.slice(1),
        x,
        y,
        level: 1,
        connections: ['center']
      });
    });

    setNodes(newNodes);
  }, [text]);

  // Handle pinch to zoom
  const handlePinch = useCallback((event: GestureResponderEvent) => {
    const { scale: gestureScale } = event.nativeEvent;
    if (gestureScale && gestureScale > 0) {
      const newScale = Math.max(0.5, Math.min(3, scale._value * gestureScale));
      scale.setValue(newScale);
    }
  }, [scale]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
  });

  const renderNode = useCallback((node: MindMapNode) => {
    const isSelected = selectedNode === node.id;
    const isCenter = node.level === 0;

    return (
      <Animated.View
        key={node.id}
        style={[
          styles.node,
          {
            left: node.x - (isCenter ? 50 : 35),
            top: node.y - (isCenter ? 18 : 12),
            backgroundColor: isCenter ? '#0066ff' : isSelected ? '#ff6b35' : '#1a1d2e',
            borderColor: isCenter ? '#0066ff' : isSelected ? '#ff6b35' : '#2a2f38',
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scale }
            ]
          }
        ]}
        onTouchStart={() => setSelectedNode(node.id)}
      >
        <Text style={[
          styles.nodeText,
          { 
            color: isCenter ? '#ffffff' : isSelected ? '#ffffff' : '#ffffff',
            fontSize: isCenter ? 16 : 14,
            fontWeight: isCenter ? '700' : '600'
          }
        ]}>
          {node.text}
        </Text>
      </Animated.View>
    );
  }, [selectedNode, pan, scale]);

  const renderConnection = useCallback((fromNode: MindMapNode, toNode: MindMapNode) => {
    const distance = Math.sqrt(
      Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2)
    );
    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
    
    return (
      <Animated.View
        key={`${fromNode.id}-${toNode.id}`}
        style={[
          styles.connection,
          {
            left: fromNode.x,
            top: fromNode.y,
            width: distance,
            transform: [
              { rotate: angle + 'rad' },
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scale }
            ]
          }
        ]}
      />
    );
  }, [pan, scale]);

  return (
    <View style={styles.container}>
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Drag to pan • Pinch to zoom • Tap to highlight
        </Text>
      </View>
      
      <View 
        style={styles.mindMapContainer} 
        {...panResponder.panHandlers}
        onTouchStart={handlePinch}
      >
        {/* Render connections first (behind nodes) */}
        {nodes.map(node => 
          node.connections.map(connectionId => {
            const connectedNode = nodes.find(n => n.id === connectionId);
            return connectedNode ? renderConnection(node, connectedNode) : null;
          })
        )}
        
        {/* Render nodes */}
        {nodes.map(renderNode)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1d2e',
  },
  instructionsText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  mindMapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0f1419',
  },
  node: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  nodeText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  connection: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: '#374151',
    transformOrigin: 'left center',
    opacity: 0.8,
  },
});
