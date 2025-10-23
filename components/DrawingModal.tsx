import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  PanResponder,
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

// Draggable Size Selector Component
const SizeSelector = ({ 
  value, 
  onValueChange, 
  min = 0.1, 
  max = 2.0, 
  width = 200 
}: {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  width?: number;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const percentage = ((value - min) / (max - min)) * 100;
  const thumbPosition = (percentage / 100) * width;
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setIsDragging(true),
    onPanResponderMove: (_, gestureState) => {
      if (isDragging) {
        const newPercentage = Math.max(0, Math.min(100, (gestureState.moveX / width) * 100));
        const newValue = min + (newPercentage / 100) * (max - min);
        onValueChange(newValue);
      }
    },
    onPanResponderRelease: () => setIsDragging(false),
  });
  
  return (
    <View style={styles.sizeSelectorContainer}>
      <View style={[styles.sizeSelectorTrack, { width }]}>
        <View style={styles.sizeSelectorFill} />
        <View
          style={[
            styles.sizeSelectorThumb,
            { left: thumbPosition - 8 }
          ]}
          {...panResponder.panHandlers}
        />
      </View>
      <Text style={styles.sizeSelectorValue}>{value.toFixed(1)}</Text>
    </View>
  );
};

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
  const [selectedTool, setSelectedTool] = useState('pencil'); // 'pencil', 'marker', 'brush', 'eraser'
  const [eraserSize, setEraserSize] = useState(0.2); // Start smaller, max 0.4
  
  // Tool-specific stroke widths
  const [pencilWidth, setPencilWidth] = useState(2);
  const [markerWidth, setMarkerWidth] = useState(4);
  const [brushWidth, setBrushWidth] = useState(6);

  const handleDrawingChange = useCallback((newStrokes: DrawingStroke[]) => {
    setCurrentStrokes(newStrokes);
  }, []);

  const handleClear = useCallback(() => {
    setCurrentStrokes([]);
    handleDrawingChange([]);
  }, [handleDrawingChange]);

  const handleToolSelect = useCallback((tool: string) => {
    setSelectedTool(tool);
  }, []);

  // Get current stroke width based on selected tool
  const getCurrentStrokeWidth = () => {
    switch (selectedTool) {
      case 'pencil':
        return pencilWidth;
      case 'marker':
        return markerWidth;
      case 'brush':
        return brushWidth;
      case 'eraser':
        return eraserSize * 10; // Convert to pixel size
      default:
        return selectedStrokeWidth;
    }
  };

  const handleUndo = useCallback(() => {
    if (currentStrokes.length > 0) {
      const newStrokes = currentStrokes.slice(0, -1);
      setCurrentStrokes(newStrokes);
      handleDrawingChange(newStrokes);
    }
  }, [currentStrokes, handleDrawingChange]);

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
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
      statusBarTranslucent={false}
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
            initialStrokes={currentStrokes}
            strokeColor={selectedTool === 'eraser' ? 'transparent' : selectedColor}
            strokeWidth={getCurrentStrokeWidth()}
            isErasing={selectedTool === 'eraser'}
            toolType={selectedTool}
          />
        </View>

        {/* Tool Selection */}
        <View style={styles.toolSelection}>
          <Pressable 
            style={[styles.toolButton, selectedTool === 'pencil' && styles.activeTool]} 
            onPress={() => handleToolSelect('pencil')}
          >
            <Text style={styles.toolIcon}>✏️</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.toolButton, selectedTool === 'marker' && styles.activeTool]} 
            onPress={() => handleToolSelect('marker')}
          >
            <Text style={styles.toolIcon}>🖍️</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.toolButton, selectedTool === 'brush' && styles.activeTool]} 
            onPress={() => handleToolSelect('brush')}
          >
            <Text style={styles.toolIcon}>🖌️</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.toolButton, selectedTool === 'eraser' && styles.activeTool]} 
            onPress={() => handleToolSelect('eraser')}
          >
            <Text style={styles.toolIcon}>🧽</Text>
          </Pressable>
        </View>

        {/* Tool Options */}
        <View style={styles.toolOptions}>
          {selectedTool === 'eraser' ? (
            <View style={styles.eraserOptions}>
              <Text style={styles.optionLabel}>Eraser Size:</Text>
              <SizeSelector
                value={eraserSize}
                onValueChange={setEraserSize}
                min={0.1}
                max={0.4} // Progressive limit to 0.4
                width={150}
              />
            </View>
          ) : (
            <View style={styles.drawingOptions}>
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
              
              <View style={styles.sizeOptions}>
                {selectedTool === 'pencil' ? (
                  <View style={styles.pencilOptions}>
                    <Text style={styles.optionLabel}>Pencil Size:</Text>
                    <SizeSelector
                      value={pencilWidth}
                      onValueChange={setPencilWidth}
                      min={1}
                      max={5}
                      width={150}
                    />
                  </View>
                ) : selectedTool === 'marker' ? (
                  <>
                    <Text style={styles.optionLabel}>Marker Size:</Text>
                    <Pressable 
                      style={[styles.sizeButton, markerWidth === 3 && styles.selectedSize]} 
                      onPress={() => setMarkerWidth(3)}
                    >
                      <Text style={styles.sizeText}>3</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.sizeButton, markerWidth === 4 && styles.selectedSize]} 
                      onPress={() => setMarkerWidth(4)}
                    >
                      <Text style={styles.sizeText}>4</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.sizeButton, markerWidth === 6 && styles.selectedSize]} 
                      onPress={() => setMarkerWidth(6)}
                    >
                      <Text style={styles.sizeText}>6</Text>
                    </Pressable>
                  </>
                ) : selectedTool === 'brush' ? (
                  <>
                    <Pressable 
                      style={[styles.sizeButton, brushWidth === 4 && styles.selectedSize]} 
                      onPress={() => setBrushWidth(4)}
                    >
                      <Text style={styles.sizeText}>4</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.sizeButton, brushWidth === 6 && styles.selectedSize]} 
                      onPress={() => setBrushWidth(6)}
                    >
                      <Text style={styles.sizeText}>6</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.sizeButton, brushWidth === 8 && styles.selectedSize]} 
                      onPress={() => setBrushWidth(8)}
                    >
                      <Text style={styles.sizeText}>8</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable 
                      style={[styles.sizeButton, selectedStrokeWidth === 2 && styles.selectedSize]} 
                      onPress={() => setSelectedStrokeWidth(2)}
                    >
                      <Text style={styles.sizeText}>2</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.sizeButton, selectedStrokeWidth === 3 && styles.selectedSize]} 
                      onPress={() => setSelectedStrokeWidth(3)}
                    >
                      <Text style={styles.sizeText}>3</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.sizeButton, selectedStrokeWidth === 5 && styles.selectedSize]} 
                      onPress={() => setSelectedStrokeWidth(5)}
                    >
                      <Text style={styles.sizeText}>5</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton} onPress={handleUndo}>
            <Text style={styles.actionIcon}>↶</Text>
            <Text style={styles.actionLabel}>Undo</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={handleClear}>
            <Text style={styles.actionIcon}>🗑️</Text>
            <Text style={styles.actionLabel}>Clear</Text>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  toolSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1a1d2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2f38',
    gap: 16,
  },
  toolOptions: {
    backgroundColor: '#1a1d2e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2f38',
  },
  eraserOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pencilOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  drawingOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1a1d2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2f38',
    gap: 24,
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
  activeTool: {
    backgroundColor: '#0066ff',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  optionLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2a2f38',
    borderWidth: 1,
    borderColor: '#3a3f48',
  },
  selectedSize: {
    backgroundColor: '#0066ff',
    borderColor: '#ffffff',
  },
  sizeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2a2f38',
    borderWidth: 1,
    borderColor: '#3a3f48',
    minWidth: 80,
  },
  actionIcon: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 4,
  },
  actionLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  sizeSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sizeSelectorTrack: {
    height: 4,
    backgroundColor: '#2a2f38',
    borderRadius: 2,
    position: 'relative',
  },
  sizeSelectorFill: {
    height: 4,
    backgroundColor: '#0066ff',
    borderRadius: 2,
    width: '100%',
  },
  sizeSelectorThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0066ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sizeSelectorValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
});
