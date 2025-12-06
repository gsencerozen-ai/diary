import { Timestamp } from 'firebase/firestore';

export interface DiaryEntry {
  id: string;
  userId: string;
  title: string;           // Format: "30 Kasım 2025, 14:30"
  content: string;         // Günlük yazısı içeriği
  createdAt: Timestamp;    // İlk oluşturulma zamanı
  savedAt: Timestamp;      // Kaydedilme zamanı
  isLocked: boolean;       // true olunca düzenlenemez
  wordCount: number;
  characterCount: number;
  tags?: string[];         // Kategori/etiketler ["aile", "iş", "kişisel"]
  mood?: 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad'; // Ruh hali
}

export interface DiaryEntryInput {
  content: string;
  tags?: string[];
  mood?: 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad';
}

export interface DiaryEntryListItem {
  id: string;
  title: string;
  savedAt: Timestamp;
  previewText: string;     // İlk 100 karakter
  wordCount: number;
  tags?: string[];
  mood?: 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  tags?: string[];         // Kullanıcının tüm tags'leri
}

// Firestore converter'lar için
export type FirestoreEntry = Omit<DiaryEntry, 'id'>;
export type FirestoreUserProfile = Omit<UserProfile, 'uid'>;

export const MOOD_EMOJIS = {
  'very-happy': '😄',
  'happy': '😊',
  'neutral': '😐',
  'sad': '😢',
  'very-sad': '😭',
} as const;

export const MOOD_LABELS = {
  'very-happy': 'Çok mutlu',
  'happy': 'Mutlu',
  'neutral': 'Nötr',
  'sad': 'Üzgün',
  'very-sad': 'Çok üzgün',
} as const;
