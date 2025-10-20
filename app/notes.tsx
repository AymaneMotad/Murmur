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
      {/* Red delete background - always visible behind */}
      <View style={styles.deleteBackground}>
        <Text style={styles.deleteText}>DELETE</Text>
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
          <Text style={styles.noteText} numberOfLines={3}>
            {item.text}
          </Text>
          <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Notes</Text>
        <View style={styles.placeholder} />
      </View>
      
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1d2e',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    color: '#0066ff',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 60,
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  noteCardContainer: {
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#ff4444',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    borderRadius: 12,
    zIndex: 1,
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteCard: {
    backgroundColor: '#11151b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1d2e',
    position: 'relative',
    zIndex: 2,
  },
  noteContent: {
    padding: 16,
    backgroundColor: '#11151b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1d2e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  noteDate: {
    color: '#666',
    fontSize: 12,
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
