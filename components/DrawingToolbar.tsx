import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface DrawingToolbarProps {
  onClear: () => void;
  onUndo: () => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  selectedColor: string;
  selectedStrokeWidth: number;
}

const COLORS = [
  { name: 'Blue', value: '#0066ff' },
  { name: 'Red', value: '#ff3b30' },
  { name: 'Green', value: '#34c759' },
  { name: 'Orange', value: '#ff9500' },
  { name: 'Purple', value: '#af52de' },
  { name: 'Black', value: '#000000' },
];

const STROKE_WIDTHS = [1, 2, 4, 6, 8];

export default function DrawingToolbar({
  onClear,
  onUndo,
  onColorChange,
  onStrokeWidthChange,
  selectedColor,
  selectedStrokeWidth,
}: DrawingToolbarProps) {
  return (
    <View style={styles.container}>
      {/* Color Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.colorRow}>
          {COLORS.map((color) => (
            <Pressable
              key={color.value}
              style={[
                styles.colorButton,
                { backgroundColor: color.value },
                selectedColor === color.value && styles.selectedColor,
              ]}
              onPress={() => onColorChange(color.value)}
            />
          ))}
        </View>
      </View>

      {/* Stroke Width */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Size</Text>
        <View style={styles.strokeRow}>
          {STROKE_WIDTHS.map((width) => (
            <Pressable
              key={width}
              style={[
                styles.strokeButton,
                selectedStrokeWidth === width && styles.selectedStroke,
              ]}
              onPress={() => onStrokeWidthChange(width)}
            >
              <View
                style={[
                  styles.strokeIndicator,
                  {
                    width: width * 3,
                    height: width * 3,
                    backgroundColor: selectedColor,
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={onUndo}>
          <Text style={styles.actionText}>↶ Undo</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.clearButton]} onPress={onClear}>
          <Text style={[styles.actionText, styles.clearText]}>🗑️ Clear</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1d2e',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2f38',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#9BA1A6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.1 }],
  },
  strokeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  strokeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2f38',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedStroke: {
    borderColor: '#0066ff',
    backgroundColor: '#1a1d2e',
  },
  strokeIndicator: {
    borderRadius: 50,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2a2f38',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3f48',
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    borderColor: '#ff3b30',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearText: {
    color: '#ffffff',
  },
});
