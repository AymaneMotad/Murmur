import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import DrawingCanvas from './DrawingCanvas';
import { DrawingStroke } from '@/lib/storage';

interface DrawingModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (drawing: DrawingStroke[]) => void;
  initialDrawing?: DrawingStroke[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CANVAS_HEIGHT = screenHeight * 0.75;

export default function DrawingModal({
  visible,
  onClose,
  onSave,
  initialDrawing = [],
}: DrawingModalProps) {
  const [currentStrokes, setCurrentStrokes] = useState<DrawingStroke[]>(initialDrawing || []);
  
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(3);
  const [isDarkBackground, setIsDarkBackground] = useState(true);

  const handleDrawingChange = useCallback((newStrokes: DrawingStroke[]) => {
    setCurrentStrokes(newStrokes);
  }, []);

  const handleClear = useCallback(() => {
    setCurrentStrokes([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (currentStrokes.length > 0) {
      setCurrentStrokes(currentStrokes.slice(0, -1));
    }
  }, [currentStrokes]);

  const handleSave = useCallback(() => {
    onSave(currentStrokes);
    onClose();
  }, [currentStrokes, onSave, onClose]);

  const handleClose = useCallback(() => {
    setCurrentStrokes(initialDrawing || []);
    onClose();
  }, [initialDrawing, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleClose}>
            <Text style={styles.headerButtonText}>Cancel</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Draw</Text>
          </View>
          <Pressable style={styles.headerButton} onPress={handleSave}>
            <Text style={[styles.headerButtonText, styles.saveText]}>Done</Text>
          </Pressable>
        </View>

        {/* Drawing Canvas */}
        <View style={[styles.canvasContainer, { backgroundColor: isDarkBackground ? '#0f1419' : '#ffffff' }]}>
          <DrawingCanvas
            width={screenWidth}
            height={CANVAS_HEIGHT}
            onDrawingChange={handleDrawingChange}
            initialStrokes={initialDrawing || []}
            strokeColor={selectedColor}
            strokeWidth={selectedStrokeWidth}
          />
        </View>

        {/* Simple Toolbar */}
        <View style={styles.toolbar}>
          <Pressable style={styles.toolButton} onPress={handleUndo}>
            <Text style={styles.toolIcon}>↶</Text>
          </Pressable>
          
          <View style={styles.colorPicker}>
            <Pressable 
              style={[styles.colorButton, { backgroundColor: '#ffffff' }, selectedColor === '#ffffff' && styles.selectedColor]} 
              onPress={() => setSelectedColor('#ffffff')}
            />
            <Pressable 
              style={[styles.colorButton, { backgroundColor: '#000000' }, selectedColor === '#000000' && styles.selectedColor]} 
              onPress={() => setSelectedColor('#000000')}
            />
            <Pressable 
              style={[styles.colorButton, { backgroundColor: '#0066ff' }, selectedColor === '#0066ff' && styles.selectedColor]} 
              onPress={() => setSelectedColor('#0066ff')}
            />
            <Pressable 
              style={[styles.colorButton, { backgroundColor: '#ff3b30' }, selectedColor === '#ff3b30' && styles.selectedColor]} 
              onPress={() => setSelectedColor('#ff3b30')}
            />
            <Pressable 
              style={[styles.colorButton, { backgroundColor: '#34c759' }, selectedColor === '#34c759' && styles.selectedColor]} 
              onPress={() => setSelectedColor('#34c759')}
            />
          </View>
          
          <Pressable style={styles.toolButton} onPress={handleClear}>
            <Text style={styles.toolIcon}>🗑️</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f38',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    color: '#9BA1A6',
    fontSize: 16,
    fontWeight: '600',
  },
  saveText: {
    color: '#0066ff',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1d2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2f38',
  },
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2f38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#2a2f38',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedColor: {
    borderColor: '#ffffff',
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
    shadowColor: '#0066ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
});
