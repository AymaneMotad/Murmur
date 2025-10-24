import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { getAllNotes, MurmurNote, updateNote, deleteNote } from '@/lib/storage';
import DrawingModal from '@/components/DrawingModal';
import MindMapView from '@/components/MindMapView';
import { useTheme } from '@/hooks/use-theme';
import { lightTheme, darkTheme, createNeumorphicStyles } from '@/constants/neumorphic-theme';

export default function NoteDetailScreen() {
  const { isDark } = useTheme();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const [note, setNote] = useState<MurmurNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);
  
  // Auto-save and undo functionality
  const [previousText, setPreviousText] = useState('');
  const [canUndo, setCanUndo] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get current theme
  const currentTheme = isDark ? darkTheme : lightTheme;
  const neumorphicStyles = createNeumorphicStyles(currentTheme);

  useEffect(() => {
    loadNote();
  }, [noteId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const loadNote = async () => {
    try {
      const allNotes = await getAllNotes();
      const foundNote = allNotes.find(n => n.id === noteId);
      if (foundNote) {
        setNote(foundNote);
        setEditText(foundNote.text);
        setPreviousText(foundNote.text);
        setCanUndo(false);
      } else {
        Alert.alert('Error', 'Note not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Failed to load note:', error);
      Alert.alert('Error', 'Failed to load note', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async (text: string) => {
    if (!note) return;
    
    try {
      const updatedNote = {
        ...note,
        text: text.trim(),
        modifiedAt: Date.now(),
      };
      await updateNote(updatedNote);
      setNote(updatedNote);
    } catch (error) {
      console.error('Failed to auto-save note:', error);
    }
  };

  const handleTextChange = (text: string) => {
    setEditText(text);
    setCanUndo(true);
    
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save (500ms delay)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(text);
    }, 500);
  };

  const handleUndo = () => {
    if (canUndo && previousText !== editText) {
      setEditText(previousText);
      setCanUndo(false);
      // Auto-save the reverted text
      autoSave(previousText);
    }
  };

  const handleStartEditing = () => {
    if (note) {
      setPreviousText(editText);
      setIsEditing(true);
    }
  };

  const handleDeleteNote = async () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(note!.id);
              router.back();
            } catch (error) {
              console.error('Failed to delete note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          }
        }
      ]
    );
  };

  const handleSaveDrawing = async (drawing: any[]) => {
    if (!note) return;
    
    try {
      const updatedNote = {
        ...note,
        drawing: drawing,
        modifiedAt: Date.now(),
      };
      await updateNote(updatedNote);
      setNote(updatedNote);
      setShowDrawingModal(false);
    } catch (error) {
      console.error('Failed to save drawing:', error);
      Alert.alert('Error', 'Failed to save drawing');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={neumorphicStyles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={neumorphicStyles.header}>
          <Pressable onPress={() => router.back()} style={neumorphicStyles.backButton}>
            <Text style={neumorphicStyles.backText}>←</Text>
          </Pressable>
          <Text style={neumorphicStyles.headerTitle}>Loading...</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={neumorphicStyles.loadingText}>Loading note...</Text>
        </View>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={neumorphicStyles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={neumorphicStyles.header}>
          <Pressable onPress={() => router.back()} style={neumorphicStyles.backButton}>
            <Text style={neumorphicStyles.backText}>←</Text>
          </Pressable>
          <Text style={neumorphicStyles.headerTitle}>Note Not Found</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: currentTheme.deleteBackground }]}>Note not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={neumorphicStyles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={neumorphicStyles.header}>
        <Pressable onPress={() => router.back()} style={neumorphicStyles.backButton}>
          <Text style={neumorphicStyles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={neumorphicStyles.headerTitle}>Note</Text>
          <Text style={neumorphicStyles.headerSubtitle}>
            {formatDate(note.createdAt)}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {isEditing && canUndo && (
            <Pressable onPress={handleUndo} style={[neumorphicStyles.backButton, { backgroundColor: currentTheme.accentColor }]}>
              <Text style={[neumorphicStyles.backText, { color: currentTheme.primaryText }]}>↶</Text>
            </Pressable>
          )}
          <Pressable onPress={handleDeleteNote} style={[neumorphicStyles.backButton, { backgroundColor: currentTheme.deleteBackground }]}>
            <View style={styles.deleteIcon}>
              <View style={styles.deleteIconBody} />
              <View style={styles.deleteIconLid} />
              <View style={styles.deleteIconLine1} />
              <View style={styles.deleteIconLine2} />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={[neumorphicStyles.input, { color: currentTheme.primaryText, minHeight: 200 }]}
              multiline
              value={editText}
              placeholder="Start typing your note..."
              placeholderTextColor={currentTheme.secondaryText}
              onChangeText={handleTextChange}
              autoFocus
            />
          </View>
        ) : (
          <View style={styles.noteContainer}>
            <Pressable onPress={handleStartEditing} style={styles.noteTextContainer}>
              <Text style={[neumorphicStyles.noteText, { color: currentTheme.primaryText }]}>{note.text}</Text>
            </Pressable>
            
            {note.drawing && note.drawing.length > 0 && (
              <View style={styles.drawingContainer}>
                <Text style={[styles.drawingLabel, { color: currentTheme.secondaryText }]}>Drawing:</Text>
                <View style={[styles.drawingIndicator, { backgroundColor: currentTheme.accentColor }]}>
                  <Text style={[styles.drawingText, { color: currentTheme.primaryText }]}>🎨 Drawing attached</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[styles.bottomActions, { backgroundColor: currentTheme.background, borderTopColor: currentTheme.border }]}>
        <Pressable 
          style={styles.actionButton}
          onPress={() => setShowDrawingModal(true)}
        >
          <View style={[neumorphicStyles.button, { width: 48, height: 48, borderRadius: 24, marginBottom: 8 }]}>
            <Text style={styles.actionIconText}>✏️</Text>
          </View>
          <Text style={[styles.actionLabel, { color: currentTheme.primaryText }]}>Draw</Text>
        </Pressable>
        
        <Pressable 
          style={styles.actionButton}
          onPress={() => setShowMindMap(!showMindMap)}
        >
          <View style={[neumorphicStyles.button, { width: 48, height: 48, borderRadius: 24, marginBottom: 8 }]}>
            <Text style={styles.actionIconText}>🕸️</Text>
          </View>
          <Text style={[styles.actionLabel, { color: currentTheme.primaryText }]}>Mind Map</Text>
        </Pressable>
      </View>

      {/* Mind Map Overlay */}
      {showMindMap && (
        <View style={[styles.mindMapOverlay, { backgroundColor: currentTheme.background }]}>
          <View style={[styles.mindMapHeader, { borderBottomColor: currentTheme.border }]}>
            <Text style={[styles.mindMapTitle, { color: currentTheme.primaryText }]}>Mind Map</Text>
            <Pressable 
              style={neumorphicStyles.backButton}
              onPress={() => setShowMindMap(false)}
            >
              <Text style={[neumorphicStyles.backText, { color: currentTheme.primaryText }]}>✕</Text>
            </Pressable>
          </View>
          <MindMapView text={note.text} />
        </View>
      )}

      {/* Drawing Modal */}
      <DrawingModal
        visible={showDrawingModal}
        onClose={() => setShowDrawingModal(false)}
        onSave={handleSaveDrawing}
        initialDrawing={note.drawing || []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  undoHeaderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 16,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  deleteIconBody: {
    position: 'absolute',
    width: 12,
    height: 10,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    bottom: 0,
    left: 4,
  },
  deleteIconLid: {
    position: 'absolute',
    width: 14,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
    top: 0,
    left: 3,
  },
  deleteIconLine1: {
    position: 'absolute',
    width: 2,
    height: 4,
    backgroundColor: '#ffffff',
    top: 2,
    left: 6,
  },
  deleteIconLine2: {
    position: 'absolute',
    width: 2,
    height: 4,
    backgroundColor: '#ffffff',
    top: 2,
    left: 10,
  },
  placeholder: {
    width: 32,
    height: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  noteContainer: {
    paddingBottom: 100, // Space for bottom actions
  },
  noteTextContainer: {
    paddingVertical: 20,
    paddingHorizontal: 0,
  },
  noteText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  drawingContainer: {
    marginTop: 20,
    paddingVertical: 16,
  },
  drawingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  drawingIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  drawingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editContainer: {
    paddingVertical: 20,
    paddingHorizontal: 0,
  },
  editInput: {
    fontSize: 18,
    lineHeight: 28,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Safe area for home indicator
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  mindMapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  mindMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  mindMapTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
