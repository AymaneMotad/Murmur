import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { getAllNotes, MurmurNote, updateNote, deleteNote } from '@/lib/storage';
import DrawingModal from '@/components/DrawingModal';
import MindMapView from '@/components/MindMapView';

export default function NoteDetailScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const [note, setNote] = useState<MurmurNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);

  useEffect(() => {
    loadNote();
  }, [noteId]);

  const loadNote = async () => {
    try {
      const allNotes = await getAllNotes();
      const foundNote = allNotes.find(n => n.id === noteId);
      if (foundNote) {
        setNote(foundNote);
        setEditText(foundNote.text);
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

  const handleSaveEdit = async () => {
    if (!note || !editText.trim()) return;
    
    try {
      const updatedNote = {
        ...note,
        text: editText.trim(),
        modifiedAt: Date.now(),
      };
      await updateNote(updatedNote);
      setNote(updatedNote);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update note:', error);
      Alert.alert('Error', 'Failed to save note');
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
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading note...</Text>
        </View>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Note Not Found</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Note not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Note</Text>
          <Text style={styles.headerSubtitle}>
            {formatDate(note.createdAt)}
          </Text>
        </View>
        <Pressable onPress={handleDeleteNote} style={styles.deleteButton}>
          <View style={styles.deleteIcon}>
            <View style={styles.deleteIconBody} />
            <View style={styles.deleteIconLid} />
            <View style={styles.deleteIconLine1} />
            <View style={styles.deleteIconLine2} />
          </View>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              multiline
              value={editText}
              placeholder="Edit your note..."
              placeholderTextColor="#666"
              onChangeText={setEditText}
              autoFocus
            />
            <View style={styles.editActions}>
              <Pressable 
                style={[styles.actionBtn, styles.cancelBtn]} 
                onPress={() => {
                  setIsEditing(false);
                  setEditText(note.text);
                }}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.saveBtn]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.actionText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.noteContainer}>
            <Pressable onPress={() => setIsEditing(true)} style={styles.noteTextContainer}>
              <Text style={styles.noteText}>{note.text}</Text>
            </Pressable>
            
            {note.drawing && note.drawing.length > 0 && (
              <View style={styles.drawingContainer}>
                <Text style={styles.drawingLabel}>Drawing:</Text>
                <View style={styles.drawingIndicator}>
                  <Text style={styles.drawingText}>🎨 Drawing attached</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <Pressable 
          style={styles.actionButton}
          onPress={() => setShowDrawingModal(true)}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>✏️</Text>
          </View>
          <Text style={styles.actionLabel}>Draw</Text>
        </Pressable>
        
        <Pressable 
          style={styles.actionButton}
          onPress={() => setShowMindMap(!showMindMap)}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>🕸️</Text>
          </View>
          <Text style={styles.actionLabel}>Mind Map</Text>
        </Pressable>
      </View>

      {/* Mind Map Overlay */}
      {showMindMap && (
        <View style={styles.mindMapOverlay}>
          <View style={styles.mindMapHeader}>
            <Text style={styles.mindMapTitle}>Mind Map</Text>
            <Pressable 
              style={styles.closeButton}
              onPress={() => setShowMindMap(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
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
    backgroundColor: '#0f1419',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#0f1419',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1d2e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2f38',
  },
  backText: {
    color: '#0066ff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#9BA1A6',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff3b30',
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
    color: '#ffffff',
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
    color: '#9BA1A6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  drawingIndicator: {
    backgroundColor: '#0066ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  drawingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  editContainer: {
    paddingVertical: 20,
    paddingHorizontal: 0,
  },
  editInput: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 28,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelBtn: {
    backgroundColor: '#2a2f38',
  },
  saveBtn: {
    backgroundColor: '#0066ff',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#0f1419',
    borderTopWidth: 1,
    borderTopColor: '#2a2f38',
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
    backgroundColor: '#1a1d2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2f38',
  },
  actionIconText: {
    fontSize: 20,
  },
  actionLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  mindMapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f1419',
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
    borderBottomColor: '#2a2f38',
  },
  mindMapTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2f38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 18,
    fontWeight: '600',
  },
});
