import { 
  collection, 
  addDoc, 
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config';
import { formatDate, countWords, createPreview } from '@/lib/utils/diary';
import type { DiaryEntry, DiaryEntryListItem, FirestoreEntry } from '@/lib/types/diary';

/**
 * Yeni günlük yazısı oluştur
 */
export async function createDiaryEntry(
  userId: string,
  content: string,
  tags?: string[],
  mood?: 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad'
): Promise<string> {
  const now = new Date();
  const title = formatDate(now);
  
  const entry: Omit<FirestoreEntry, 'id'> = {
    userId,
    title,
    content,
    createdAt: Timestamp.fromDate(now),
    savedAt: serverTimestamp() as Timestamp,
    isLocked: true, // Kaydetme anında kilitleniyor
    wordCount: countWords(content),
    characterCount: content.length,
    ...(tags && { tags }),
    ...(mood && { mood }),
  };

  const docRef = await addDoc(collection(db, 'entries'), entry);
  return docRef.id;
}

/**
 * Kullanıcının tüm günlük yazılarını getir (liste view için)
 */
export async function getUserEntries(
  userId: string
): Promise<DiaryEntryListItem[]> {
  const q = query(
    collection(db, 'entries'),
    where('userId', '==', userId),
    orderBy('savedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data() as FirestoreEntry;
    return {
      id: doc.id,
      title: data.title,
      savedAt: data.savedAt,
      previewText: createPreview(data.content),
      wordCount: data.wordCount,
      tags: data.tags,
      mood: data.mood,
    };
  });
}

/**
 * Tek bir günlük yazısını getir
 */
export async function getDiaryEntry(
  entryId: string,
  userId: string
): Promise<DiaryEntry | null> {
  const docRef = doc(db, 'entries', entryId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data() as FirestoreEntry;
  
  // Güvenlik kontrolü - sadece kendi yazılarını görebilir
  if (data.userId !== userId) {
    throw new Error('Bu yazıya erişim yetkiniz yok');
  }

  return {
    id: docSnap.id,
    ...data,
  };
}

/**
 * Kullanıcının günlük yazılarını real-time dinle
 */
export function subscribeToUserEntries(
  userId: string,
  callback: (entries: DiaryEntryListItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, 'entries'),
    where('userId', '==', userId),
    orderBy('savedAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreEntry;
        return {
          id: doc.id,
          title: data.title,
          savedAt: data.savedAt,
          previewText: createPreview(data.content),
          wordCount: data.wordCount,
          mood: data.mood,
          tags: data.tags,
        };
      });
      callback(entries);
    },
    (error) => {
      console.error('Error listening to entries:', error);
      onError?.(error);
    }
  );
}

/**
 * Günlük yazısını sil
 */
export async function deleteDiaryEntry(
  entryId: string,
  userId: string
): Promise<void> {
  // Önce yazının sahibinin kendisi olduğunu kontrol et
  const entry = await getDiaryEntry(entryId, userId);
  if (!entry) {
    throw new Error('Yazı bulunamadı');
  }

  await deleteDoc(doc(db, 'entries', entryId));
}
