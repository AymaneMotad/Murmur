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
import { Svg, Path } from 'react-native-svg';
import DrawingCanvas from './DrawingCanvas';
import { DrawingStroke } from '@/lib/storage';
import { useTheme } from '@/hooks/use-theme';
import { lightTheme, darkTheme } from '@/constants/neumorphic-theme';

interface DrawingModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (drawing: DrawingStroke[]) => void;
  initialDrawing?: DrawingStroke[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CANVAS_HEIGHT = Math.min(screenHeight * 0.75, 600); // Limit max height to prevent crashes

// Simplified icons for better Android compatibility
const PencilIcon = ({ color = '#000', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      fill={color}
    />
  </Svg>
);

const MarkerIcon = ({ color = '#000', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      fill={color}
      opacity="0.7"
    />
  </Svg>
);

const BrushIcon = ({ color = '#000', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"
      fill={color}
    />
  </Svg>
);

const EraserIcon = ({ color = '#000', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53-6.36-6.36-3.54 3.36z"
      fill={color}
    />
  </Svg>
);

const UndoIcon = ({ color = '#000', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
      fill={color}
    />
  </Svg>
);

const ClearIcon = ({ color = '#000', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      fill={color}
    />
  </Svg>
);

// Simple Size Selector Component
const SizeSelector = ({ 
  value, 
  onValueChange, 
  min = 1, 
  max = 10, 
  theme
}: {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  theme?: any;
}) => {
  const sizes = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  
  return (
    <View style={styles.sizeSelectorContainer}>
      {sizes.map((size) => (
        <Pressable
          key={size}
          style={[
            styles.sizeButton,
            { backgroundColor: theme?.buttonBackground || '#2a2f38' },
            value === size && styles.selectedSize
          ]}
          onPress={() => onValueChange(size)}
        >
          <View
            style={[
              styles.sizeIndicator,
              {
                width: size * 2,
                height: size * 2,
                backgroundColor: theme?.primaryText || '#ffffff',
                borderRadius: size,
              }
            ]}
          />
        </Pressable>
      ))}
    </View>
  );
};

export default function DrawingModal({
  visible,
  onClose,
  onSave,
  initialDrawing = [],
}: DrawingModalProps) {
  const { isDark } = useTheme();
  const [currentStrokes, setCurrentStrokes] = useState<DrawingStroke[]>(initialDrawing || []);
  
  // Get current theme
  const currentTheme = isDark ? darkTheme : lightTheme;
  
  const [selectedColor, setSelectedColor] = useState(isDark ? '#ffffff' : '#000000');
  const [selectedTool, setSelectedTool] = useState('pencil'); // 'pencil', 'marker', 'brush', 'eraser'
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(3);

  const handleDrawingChange = useCallback((newStrokes: DrawingStroke[]) => {
    try {
      // Limit the number of strokes to prevent memory issues
      const limitedStrokes = newStrokes.slice(-30); // Keep only last 30 strokes
      setCurrentStrokes(limitedStrokes);
    } catch (error) {
      console.error('Error handling drawing change:', error);
    }
  }, []);

  const handleClear = useCallback(() => {
    setCurrentStrokes([]);
    handleDrawingChange([]);
  }, [handleDrawingChange]);

  const handleToolSelect = useCallback((tool: string) => {
    setSelectedTool(tool);
    // Set appropriate stroke width for each tool
    switch (tool) {
      case 'pencil':
        setSelectedStrokeWidth(2);
        break;
      case 'marker':
        setSelectedStrokeWidth(4);
        break;
      case 'brush':
        setSelectedStrokeWidth(6);
        break;
      case 'eraser':
        setSelectedStrokeWidth(8);
        break;
    }
  }, []);

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
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: currentTheme.background, borderBottomColor: currentTheme.shadowColor }]}>
          <Pressable style={[styles.headerButton, { backgroundColor: currentTheme.buttonBackground }]} onPress={handleClose}>
            <Text style={[styles.headerButtonText, { color: currentTheme.primaryText }]}>Cancel</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: currentTheme.primaryText }]}>Draw</Text>
          </View>
          <Pressable style={[styles.headerButton, { backgroundColor: currentTheme.accentColor }]} onPress={handleSave}>
            <Text style={[styles.headerButtonText, { color: currentTheme.primaryText }]}>Done</Text>
          </Pressable>
        </View>

        {/* Drawing Canvas */}
        <View style={[styles.canvasContainer, { backgroundColor: currentTheme.cardBackground }]}>
          <DrawingCanvas
            width={Math.min(screenWidth, 400)} // Limit width to prevent crashes
            height={CANVAS_HEIGHT}
            onDrawingChange={handleDrawingChange}
            initialStrokes={currentStrokes}
            strokeColor={selectedTool === 'eraser' ? 'transparent' : selectedColor}
            strokeWidth={selectedStrokeWidth}
            isErasing={selectedTool === 'eraser'}
            toolType={selectedTool}
          />
        </View>

        {/* Tool Selection */}
        <View style={[styles.toolSelection, { backgroundColor: currentTheme.background, borderTopColor: currentTheme.shadowColor }]}>
          <Pressable 
            style={[
              styles.toolButton,
              { backgroundColor: selectedTool === 'pencil' ? currentTheme.accentColor : currentTheme.buttonBackground },
              selectedTool === 'pencil' && styles.activeTool
            ]} 
            onPress={() => handleToolSelect('pencil')}
          >
            <PencilIcon color={currentTheme.primaryText} size={20} />
          </Pressable>
          
          <Pressable 
            style={[
              styles.toolButton,
              { backgroundColor: selectedTool === 'marker' ? currentTheme.accentColor : currentTheme.buttonBackground },
              selectedTool === 'marker' && styles.activeTool
            ]} 
            onPress={() => handleToolSelect('marker')}
          >
            <MarkerIcon color={currentTheme.primaryText} size={20} />
          </Pressable>
          
          <Pressable 
            style={[
              styles.toolButton,
              { backgroundColor: selectedTool === 'brush' ? currentTheme.accentColor : currentTheme.buttonBackground },
              selectedTool === 'brush' && styles.activeTool
            ]} 
            onPress={() => handleToolSelect('brush')}
          >
            <BrushIcon color={currentTheme.primaryText} size={20} />
          </Pressable>
          
          <Pressable 
            style={[
              styles.toolButton,
              { backgroundColor: selectedTool === 'eraser' ? currentTheme.accentColor : currentTheme.buttonBackground },
              selectedTool === 'eraser' && styles.activeTool
            ]} 
            onPress={() => handleToolSelect('eraser')}
          >
            <EraserIcon color={currentTheme.primaryText} size={20} />
          </Pressable>
        </View>

        {/* Tool Options */}
        <View style={[styles.toolOptions, { backgroundColor: currentTheme.background, borderTopColor: currentTheme.shadowColor }]}>
          <View style={styles.drawingOptions}>
            <View style={styles.colorPicker}>
              <Pressable 
                style={[
                  styles.colorButton,
                  { backgroundColor: '#ffffff' },
                  selectedColor === '#ffffff' && styles.selectedColor
                ]} 
                onPress={() => setSelectedColor('#ffffff')}
              />
              <Pressable 
                style={[
                  styles.colorButton,
                  { backgroundColor: '#000000' },
                  selectedColor === '#000000' && styles.selectedColor
                ]} 
                onPress={() => setSelectedColor('#000000')}
              />
              <Pressable 
                style={[
                  styles.colorButton,
                  { backgroundColor: currentTheme.accentColor },
                  selectedColor === currentTheme.accentColor && styles.selectedColor
                ]} 
                onPress={() => setSelectedColor(currentTheme.accentColor)}
              />
              <Pressable 
                style={[
                  styles.colorButton,
                  { backgroundColor: '#ff3b30' },
                  selectedColor === '#ff3b30' && styles.selectedColor
                ]} 
                onPress={() => setSelectedColor('#ff3b30')}
              />
              <Pressable 
                style={[
                  styles.colorButton,
                  { backgroundColor: '#34c759' },
                  selectedColor === '#34c759' && styles.selectedColor
                ]} 
                onPress={() => setSelectedColor('#34c759')}
              />
            </View>
            
            <View style={styles.sizeOptions}>
              <Text style={[styles.optionLabel, { color: currentTheme.primaryText }]}>Size:</Text>
              <SizeSelector
                value={selectedStrokeWidth}
                onValueChange={setSelectedStrokeWidth}
                min={1}
                max={10}
                theme={currentTheme}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionButtons, { backgroundColor: currentTheme.background, borderTopColor: currentTheme.shadowColor }]}>
          <Pressable style={[styles.actionButton, { backgroundColor: currentTheme.buttonBackground }]} onPress={handleUndo}>
            <UndoIcon color={currentTheme.primaryText} size={20} />
            <Text style={[styles.actionLabel, { color: currentTheme.primaryText }]}>Undo</Text>
          </Pressable>
          
          <Pressable style={[styles.actionButton, { backgroundColor: currentTheme.buttonBackground }]} onPress={handleClear}>
            <ClearIcon color={currentTheme.primaryText} size={20} />
            <Text style={[styles.actionLabel, { color: currentTheme.primaryText }]}>Clear</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  headerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerButtonText: {
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
    fontSize: 18,
    fontWeight: '700',
  },
  canvasContainer: {
    flex: 1,
  },
  toolSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 16,
  },
  toolOptions: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
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
    borderTopWidth: 1,
    gap: 24,
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedColor: {
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  activeTool: {
    borderWidth: 2,
  },
  optionLabel: {
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
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedSize: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  sizeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sizeSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sizeIndicator: {
    // This will be styled inline
  },
});
