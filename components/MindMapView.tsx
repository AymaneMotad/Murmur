import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';

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

  const generateMindMap = () => {
    if (!text.trim()) return;

    // Simple text analysis to extract key concepts
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'where', 'much', 'some', 'these', 'would', 'into', 'has', 'more', 'her', 'two', 'like', 'him', 'see', 'time', 'very', 'when', 'come', 'here', 'just', 'into', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'].includes(word));

    // Count word frequency
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Get top words
    const topWords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);

    if (topWords.length === 0) return;

    // Create nodes
    const newNodes: MindMapNode[] = [];
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2 - 100;

    // Central node
    newNodes.push({
      id: 'center',
      text: 'Main Topic',
      x: centerX,
      y: centerY,
      level: 0,
      connections: topWords.slice(0, 6)
    });

    // Create radial layout for other nodes
    topWords.slice(0, 6).forEach((word, index) => {
      const angle = (index * 2 * Math.PI) / Math.min(topWords.length, 6);
      const radius = 150;
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
  };

  const panResponder = PanResponder.create({
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
  });

  const renderNode = (node: MindMapNode) => {
    const isSelected = selectedNode === node.id;
    const isCenter = node.level === 0;

    return (
      <Animated.View
        key={node.id}
        style={[
          styles.node,
          {
            left: node.x - (isCenter ? 60 : 40),
            top: node.y - (isCenter ? 20 : 15),
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
          { color: isCenter ? '#ffffff' : isSelected ? '#ffffff' : '#ffffff' }
        ]}>
          {node.text}
        </Text>
      </Animated.View>
    );
  };

  const renderConnection = (fromNode: MindMapNode, toNode: MindMapNode) => {
    return (
      <Animated.View
        key={`${fromNode.id}-${toNode.id}`}
        style={[
          styles.connection,
          {
            left: fromNode.x,
            top: fromNode.y,
            width: Math.sqrt(
              Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2)
            ),
            transform: [
              { 
                rotate: Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x) + 'rad' 
              },
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scale }
            ]
          }
        ]}
      />
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Pinch to zoom • Drag to pan • Tap nodes to highlight
        </Text>
      </View>
      
      <View style={styles.mindMapContainer}>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f38',
  },
  instructionsText: {
    color: '#9BA1A6',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mindMapContainer: {
    flex: 1,
    position: 'relative',
  },
  node: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nodeText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  connection: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#2a2f38',
    transformOrigin: 'left center',
  },
});
