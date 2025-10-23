import AsyncStorage from '@react-native-async-storage/async-storage';

export type DrawingStroke = {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  toolType?: string; // Store which tool was used to create this stroke
};

export type MurmurNote = {
  id: string;
  text: string;
  audioUri?: string;
  createdAt: number;
  modifiedAt: number;
  drawing?: DrawingStroke[];
  reminder?: {
    enabled: boolean;
    dateTime?: number;
    triggered?: boolean;
  };
  tags?: string[];
  archived?: boolean;
};

const NOTES_KEY = 'murmur:notes';

export async function getAllNotes(): Promise<MurmurNote[]> {
  const raw = await AsyncStorage.getItem(NOTES_KEY);
  if (!raw) return [];
  try {
    const parsed: MurmurNote[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveNote(note: MurmurNote): Promise<void> {
  const existing = await getAllNotes();
  const next = [note, ...existing];
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(next));
}

export async function updateNote(updatedNote: MurmurNote): Promise<void> {
  const existing = await getAllNotes();
  const next = existing.map(note => note.id === updatedNote.id ? updatedNote : note);
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(next));
}

export async function deleteNote(noteId: string): Promise<void> {
  const existing = await getAllNotes();
  const next = existing.filter(note => note.id !== noteId);
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(next));
}

// User preferences
const PREFERENCES_KEY = 'murmur:preferences';

export type UserPreferences = {
  selectedLanguage: string;
  hasCompletedOnboarding: boolean;
  themeMode?: 'light' | 'dark' | 'system';
};

export async function getUserPreferences(): Promise<UserPreferences> {
  const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
  if (!raw) {
    return {
      selectedLanguage: 'en-US',
      hasCompletedOnboarding: false,
    };
  }
  try {
    const parsed: UserPreferences = JSON.parse(raw);
    return {
      selectedLanguage: parsed.selectedLanguage || 'en-US',
      hasCompletedOnboarding: parsed.hasCompletedOnboarding || false,
    };
  } catch {
    return {
      selectedLanguage: 'en-US',
      hasCompletedOnboarding: false,
    };
  }
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}


