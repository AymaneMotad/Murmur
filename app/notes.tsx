import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Animated, PanResponder, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { getAllNotes, MurmurNote, updateNote, deleteNote, DrawingStroke } from '@/lib/storage';
import DrawingModal from '@/components/DrawingModal';
import { lightTheme, darkTheme, createNeumorphicStyles } from '@/constants/neumorphic-theme';
import { useTheme } from '@/hooks/use-theme';

interface SwipeableNoteProps {
  item: MurmurNote;
  onEdit: (note: MurmurNote) => void;
  onDelete: (note: MurmurNote) => void;
  onAddDrawing: (note: MurmurNote) => void;
  formatDate: (timestamp: number) => string;
  index: number;
  theme: any;
}

const SwipeableNote: React.FC<SwipeableNoteProps> = ({ item, onEdit, onDelete, onAddDrawing, formatDate, index, theme }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  // Animation values for card entrance
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  
  // Animation values for delete background
  const deleteBackgroundOpacity = useRef(new Animated.Value(0)).current;

  // Entrance animation effect
  useEffect(() => {
    const delay = index * 100; // Stagger animation by 100ms per card
    
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
    ]).start();
  }, [index]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        // Start swiping
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
          // Show red background when swiping left (standard UX)
          const swipeProgress = Math.min(Math.abs(gestureState.dx) / 80, 1);
          deleteBackgroundOpacity.setValue(swipeProgress);
        } else {
          // Hide delete background when swiping right
          deleteBackgroundOpacity.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        // End swiping
        
        if (dx < -80 || vx < -0.3) {
          // Swipe left to delete - more forgiving threshold
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -300,
              duration: 250,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
          ]).start(() => {
            onDelete(item);
          });
        } else {
          // Snap back with smooth animation
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
            Animated.timing(deleteBackgroundOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
          ]).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.noteCardContainer}>
      {/* Delete background */}
      <Animated.View style={[
        styles.deleteBackground,
        { opacity: deleteBackgroundOpacity }
      ]}>
        <View style={styles.deleteContent}>
          <View style={styles.deleteIconContainer}>
            <View style={styles.trashIcon}>
              <View style={styles.trashBody} />
              <View style={styles.trashLid} />
              <View style={styles.trashLine1} />
              <View style={styles.trashLine2} />
            </View>
          </View>
          <Text style={styles.deleteText}>Delete</Text>
        </View>
      </Animated.View>
      
      {/* Swipeable note content */}
      <Animated.View 
        style={[
          {
            backgroundColor: theme.cardBackground,
            borderRadius: 20,
            borderWidth: 0,
            position: 'relative' as const,
            zIndex: 2,
            shadowColor: theme.shadowColor,
            shadowOffset: { width: 6, height: 6 },
            shadowOpacity: 0.8,
            shadowRadius: 12,
            elevation: 8,
          },
          { 
            transform: [
              { translateX },
              { translateY: cardTranslateY },
              { scale: cardScale }
            ], 
            opacity: Animated.multiply(opacity, cardOpacity)
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.noteContent}>
          <View style={styles.noteHeader}>
            <View style={styles.noteMeta}>
              <View style={styles.noteDateContainer}>
                <Text style={{ color: theme.secondaryText, fontSize: 13, fontWeight: '500', letterSpacing: 0.3 }}>{formatDate(item.createdAt)}</Text>
                {item.modifiedAt !== item.createdAt && (
                  <View style={{ backgroundColor: theme.accentColor, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ color: theme.primaryText, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>Edited</Text>
                  </View>
                )}
                {item.drawing && item.drawing.length > 0 && (
                  <View style={{ backgroundColor: theme.accentColor, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: '600' }}>🎨</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.noteActions}>
              <Pressable 
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.buttonBackground,
                  alignItems: 'center' as const,
                  justifyContent: 'center' as const,
                  shadowColor: theme.shadowColor,
                  shadowOffset: { width: 4, height: 4 },
                  shadowOpacity: 0.8,
                  shadowRadius: 8,
                  elevation: 6,
                }}
                onPress={() => onAddDrawing(item)}
              >
                <View style={styles.pencilIcon}>
                  <View style={[styles.pencilBody, { backgroundColor: theme.primaryText }]} />
                  <View style={[styles.pencilTip, { borderBottomColor: theme.accentColor }]} />
                </View>
              </Pressable>
            </View>
          </View>
          
          <Pressable onPress={() => onEdit(item)}>
            <Text style={{ color: theme.primaryText, fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0.2 }} numberOfLines={0}>
              {item.text}
            </Text>
            {item.text.length > 200 && (
              <Text style={{ color: theme.accentColor, fontSize: 14, fontWeight: '600', marginTop: 8, textAlign: 'right' }}>Tap to open full view...</Text>
            )}
          </Pressable>
          
        </View>
      </Animated.View>
    </View>
  );
};

export default function NotesScreen() {
  const { isDark } = useTheme();
  const [notes, setNotes] = useState<MurmurNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawingNote, setDrawingNote] = useState<MurmurNote | null>(null);
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  
  // Header animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  
  // Get current theme
  const currentTheme = isDark ? darkTheme : lightTheme;
  const neumorphicStyles = createNeumorphicStyles(currentTheme);

  useEffect(() => {
    loadNotes();
    
    // Animate header entrance
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
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
    router.push(`/note-detail?noteId=${note.id}`);
  };


  const handleAddDrawing = (note: MurmurNote) => {
    setDrawingNote(note);
    setShowDrawingModal(true);
  };

  const handleSaveDrawing = async (drawing: DrawingStroke[]) => {
    console.log('handleSaveDrawing called with:', drawing);
    if (!drawingNote) {
      console.log('No drawingNote found');
      return;
    }
    
    try {
      const updatedNote = {
        ...drawingNote,
        drawing: drawing,
        modifiedAt: Date.now(),
      };
      console.log('Updating note with drawing:', updatedNote);
      await updateNote(updatedNote);
      setDrawingNote(null);
      setShowDrawingModal(false);
      loadNotes();
    } catch (error) {
      console.error('Failed to save drawing:', error);
      Alert.alert('Error', 'Failed to save drawing');
    }
  };

  const handleCloseDrawing = () => {
    setDrawingNote(null);
    setShowDrawingModal(false);
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

  const renderNote = ({ item, index }: { item: MurmurNote; index: number }) => {
    return (
      <SwipeableNote
        item={item}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
        onAddDrawing={handleAddDrawing}
        formatDate={formatDate}
        index={index}
        theme={currentTheme}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={neumorphicStyles.emptyTitle}>No notes yet</Text>
      <Text style={neumorphicStyles.emptySubtitle}>Start recording to create your first note</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={neumorphicStyles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Animated.View style={[
          neumorphicStyles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}>
          <Pressable onPress={() => router.back()} style={neumorphicStyles.backButton}>
            <Text style={neumorphicStyles.backText}>← Back</Text>
          </Pressable>
          <Text style={neumorphicStyles.headerTitle}>Notes</Text>
          <Pressable 
            onPress={() => router.push('/settings')} 
            style={neumorphicStyles.backButton}
          >
            <Text style={neumorphicStyles.backText}>⚙️</Text>
          </Pressable>
        </Animated.View>
        <View style={styles.loadingContainer}>
          <Text style={neumorphicStyles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={neumorphicStyles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <Animated.View style={[
        neumorphicStyles.header,
        {
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }]
        }
      ]}>
        <Pressable onPress={() => router.back()} style={neumorphicStyles.backButton}>
          <Text style={neumorphicStyles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={neumorphicStyles.headerTitle}>Notes</Text>
          <Text style={neumorphicStyles.headerSubtitle}>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</Text>
        </View>
        <Pressable 
          onPress={() => router.push('/settings')} 
          style={neumorphicStyles.backButton}
        >
          <Text style={neumorphicStyles.backText}>⚙️</Text>
        </Pressable>
      </Animated.View>
      
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


      {/* Drawing Modal */}
      <DrawingModal
        visible={showDrawingModal}
        onClose={handleCloseDrawing}
        onSave={handleSaveDrawing}
        initialDrawing={drawingNote?.drawing || []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EDF3', // Light neumorphic background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#E8EDF3',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EDF3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C9D3E0',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    // Neumorphic raised effect
    borderWidth: 0,
  },
  backText: {
    color: '#333D4A',
    fontSize: 18,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#333D4A',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#7B8794',
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
    backgroundColor: 'transparent',
    marginVertical: 12,
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
  trashIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  trashBody: {
    position: 'absolute',
    width: 12,
    height: 10,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    bottom: 0,
    left: 4,
  },
  trashLid: {
    position: 'absolute',
    width: 14,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
    top: 0,
    left: 3,
  },
  trashLine1: {
    position: 'absolute',
    width: 2,
    height: 4,
    backgroundColor: '#ffffff',
    top: 2,
    left: 6,
  },
  trashLine2: {
    position: 'absolute',
    width: 2,
    height: 4,
    backgroundColor: '#ffffff',
    top: 2,
    left: 10,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  noteCard: {
    backgroundColor: '#E8EDF3',
    borderRadius: 20,
    borderWidth: 0,
    position: 'relative',
    zIndex: 2,
    shadowColor: '#C9D3E0',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
    // Neumorphic raised effect
  },
  noteContent: {
    padding: 20,
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 0,
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
    color: '#7B8794',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  editedIndicator: {
    backgroundColor: '#C4D2E1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  editedText: {
    color: '#333D4A',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  noteText: {
    color: '#333D4A',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  readMoreText: {
    color: '#C4D2E1',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
  },
  drawingIndicator: {
    backgroundColor: '#C4D2E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  drawingText: {
    fontSize: 10,
    fontWeight: '600',
  },
  noteActions: {
    alignItems: 'flex-end',
  },
  drawingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EDF3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C9D3E0',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
    // Neumorphic raised effect
  },
  pencilIcon: {
    width: 16,
    height: 16,
    position: 'relative',
    transform: [{ rotate: '45deg' }],
  },
  pencilBody: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: '#333D4A',
    borderRadius: 1,
    top: 7,
    left: 2,
  },
  pencilTip: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#C4D2E1',
    top: 0,
    left: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#333D4A',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#7B8794',
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
    color: '#7B8794',
    fontSize: 16,
  },
  placeholder: {
    width: 32,
    height: 32,
  },
});
