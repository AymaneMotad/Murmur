import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Modal, TextInput, Animated, PanResponder } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { getAllNotes, MurmurNote, updateNote, deleteNote } from '@/lib/storage';

interface SwipeableNoteProps {
  item: MurmurNote;
  onEdit: (note: MurmurNote) => void;
  onDelete: (note: MurmurNote) => void;
  formatDate: (timestamp: number) => string;
}

const SwipeableNote: React.FC<SwipeableNoteProps> = ({ item, onEdit, onDelete, formatDate }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [isSwiping, setIsSwiping] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        setIsSwiping(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        setIsSwiping(false);
        
        if (dx < -100 || vx < -0.5) {
          // Swipe left to delete
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -300,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onDelete(item);
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.noteCardContainer}>
      {/* Delete background */}
      <View style={styles.deleteBackground}>
        <View style={styles.deleteContent}>
          <View style={styles.deleteIconContainer}>
            <Text style={styles.deleteIcon}>􀈑</Text>
          </View>
          <Text style={styles.deleteText}>Delete</Text>
        </View>
      </View>
      
      {/* Swipeable note content */}
      <Animated.View 
        style={[
          styles.noteCard, 
          { 
            transform: [{ translateX }], 
            opacity 
          }
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable 
          style={styles.noteContent} 
          onPress={() => onEdit(item)}
        >
          <View style={styles.noteHeader}>
            <View style={styles.noteMeta}>
              <View style={styles.noteDateContainer}>
                <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
                {item.modifiedAt !== item.createdAt && (
                  <View style={styles.editedIndicator}>
                    <Text style={styles.editedText}>Edited</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.noteActions}>
              <View style={styles.editButton}>
                <Text style={styles.editIcon}>􀉩</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.noteText} numberOfLines={0}>
            {item.text}
          </Text>
          
          {item.text.length > 200 && (
            <View style={styles.noteFooter}>
              <Text style={styles.readMoreText}>Tap to read more</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default function NotesScreen() {
  const [notes, setNotes] = useState<MurmurNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<MurmurNote | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadNotes();
    }, [])
  );

  const loadNotes = async () => {
    try {
      const allNotes = await getAllNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note: MurmurNote) => {
    setEditingNote(note);
    setEditText(note.text);
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editText.trim()) return;
    
    try {
      const updatedNote = {
        ...editingNote,
        text: editText.trim(),
        modifiedAt: Date.now(),
      };
      await updateNote(updatedNote);
      setEditingNote(null);
      setEditText('');
      loadNotes();
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (note: MurmurNote) => {
    try {
      await deleteNote(note.id);
      loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNote = ({ item }: { item: MurmurNote }) => {
    return (
      <SwipeableNote
        item={item}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
        formatDate={formatDate}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No notes yet</Text>
      <Text style={styles.emptySubtitle}>Start recording to create your first note</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Notes</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
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
          <Text style={styles.headerTitle}>Notes</Text>
          <Text style={styles.headerSubtitle}>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      
      {/* Notes List */}
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Edit Modal */}
      <Modal transparent visible={!!editingNote} animationType="slide" onRequestClose={() => setEditingNote(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Note</Text>
            <TextInput
              style={styles.input}
              multiline
              value={editText}
              placeholder="Edit your note..."
              placeholderTextColor="#666"
              onChangeText={setEditText}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.actionBtn, styles.cancel]} 
                onPress={() => { setEditingNote(null); setEditText(''); }}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.save]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.actionText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRight: {
    width: 32,
    height: 32,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#2a2f38',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  noteCardContainer: {
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
    borderRadius: 16,
    zIndex: 1,
  },
  deleteContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deleteIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  noteCard: {
    backgroundColor: '#1a1d2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2f38',
    position: 'relative',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noteContent: {
    padding: 20,
    backgroundColor: '#1a1d2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2f38',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteMeta: {
    flex: 1,
  },
  noteDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteDate: {
    color: '#9BA1A6',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  editedIndicator: {
    backgroundColor: '#0066ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  editedText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  noteActions: {
    alignItems: 'flex-end',
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a2f38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    color: '#9BA1A6',
    fontSize: 14,
    fontWeight: '600',
  },
  noteText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#11151b',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: '50%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    color: '#fff',
    backgroundColor: '#0b0f14',
    borderColor: '#222831',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 180,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  save: { backgroundColor: '#0066ff' },
  cancel: { backgroundColor: '#2a2f38' },
  actionText: { color: '#fff', fontWeight: '600' },
});
