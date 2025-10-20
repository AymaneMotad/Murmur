import AsyncStorage from '@react-native-async-storage/async-storage';

export type MurmurNote = {
  id: string;
  text: string;
  audioUri?: string;
  createdAt: number;
  modifiedAt: number;
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


