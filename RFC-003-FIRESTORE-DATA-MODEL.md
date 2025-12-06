# RFC-003: Firestore Veri Modeli ve Güvenlik Kuralları

## Durum
Önerilen

## Özet
Günlük yazılarının Firestore'da nasıl saklanacağı, veri şeması ve güvenlik kuralları.

## Motivasyon
- Günlük yazılarının organize ve sorgulanabilir şekilde saklanması
- Her kullanıcının sadece kendi yazılarına erişebilmesi
- Yazılan günlüklerin değiştirilemez (immutable) olması
- Performanslı ve ölçeklenebilir veri yapısı

## Veri Modeli

### Collections Yapısı

```
users (collection)
  └── {userId} (document)
      ├── email: string
      ├── displayName: string | null
      ├── createdAt: timestamp
      └── lastLoginAt: timestamp

entries (collection)
  └── {entryId} (document)
      ├── userId: string (indexed)
      ├── title: string
      ├── content: string
      ├── createdAt: timestamp
      ├── savedAt: timestamp
      ├── isLocked: boolean
      ├── wordCount: number
      └── characterCount: number
```

### TypeScript Interfaces

```typescript
// lib/types/diary.ts
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
}

export interface DiaryEntryInput {
  content: string;
}

export interface DiaryEntryListItem {
  id: string;
  title: string;
  savedAt: Timestamp;
  previewText: string;     // İlk 100 karakter
  wordCount: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

// Firestore converter'lar için
export type FirestoreEntry = Omit<DiaryEntry, 'id'>;
export type FirestoreUserProfile = Omit<UserProfile, 'uid'>;
```

## Firestore Operations

### Create Entry

```typescript
// lib/firebase/firestore.ts
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

export async function createDiaryEntry(
  userId: string,
  content: string
): Promise<string> {
  const now = new Date();
  const title = formatDate(now); // "30 Kasım 2025, 14:30"
  
  const entry: Omit<DiaryEntry, 'id'> = {
    userId,
    title,
    content,
    createdAt: Timestamp.fromDate(now),
    savedAt: serverTimestamp() as Timestamp,
    isLocked: true, // Kaydetme anında kilitleniyor
    wordCount: countWords(content),
    characterCount: content.length,
  };

  const docRef = await addDoc(collection(db, 'entries'), entry);
  return docRef.id;
}
```

### Read Entries (List)

```typescript
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
      previewText: data.content.slice(0, 100),
      wordCount: data.wordCount,
    };
  });
}
```

### Read Single Entry

```typescript
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
  
  // Güvenlik kontrolü
  if (data.userId !== userId) {
    throw new Error('Unauthorized');
  }

  return {
    id: docSnap.id,
    ...data,
  };
}
```

### Real-time Listener

```typescript
export function subscribeToUserEntries(
  userId: string,
  callback: (entries: DiaryEntryListItem[]) => void
): () => void {
  const q = query(
    collection(db, 'entries'),
    where('userId', '==', userId),
    orderBy('savedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreEntry;
      return {
        id: doc.id,
        title: data.title,
        savedAt: data.savedAt,
        previewText: data.content.slice(0, 100),
        wordCount: data.wordCount,
      };
    });
    callback(entries);
  });
}
```

## Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Kullanıcı sadece kendi profilini okuyabilir
      allow read: if isOwner(userId);
      
      // Kullanıcı kendi profilini oluşturabilir
      allow create: if isOwner(userId) 
                    && request.resource.data.keys().hasAll(['email', 'createdAt']);
      
      // Kullanıcı kendi profilini güncelleyebilir (sadece lastLoginAt)
      allow update: if isOwner(userId) 
                    && request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['lastLoginAt']);
      
      // Delete yasak
      allow delete: if false;
    }
    
    // Diary entries collection
    match /entries/{entryId} {
      // Sadece kendi yazılarını okuyabilir
      allow read: if isAuthenticated() 
                  && resource.data.userId == request.auth.uid;
      
      // Yeni yazı oluşturma
      allow create: if isAuthenticated()
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.isLocked == true
                    && request.resource.data.keys().hasAll([
                      'userId', 'title', 'content', 'createdAt', 
                      'savedAt', 'isLocked', 'wordCount', 'characterCount'
                    ]);
      
      // Update yasak (immutable)
      allow update: if false;
      
      // Silme sadece sahibi yapabilir
      allow delete: if isAuthenticated() 
                    && resource.data.userId == request.auth.uid;
    }
  }
}
```

## İndexler

Firestore Console'dan oluşturulması gereken composite indexes:

```json
{
  "indexes": [
    {
      "collectionGroup": "entries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "savedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## Helper Fonksiyonlar

```typescript
// lib/utils/diary.ts

/**
 * Türkçe tarih formatı: "30 Kasım 2025, 14:30"
 */
export function formatDate(date: Date): string {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

/**
 * Kelime sayısını hesapla
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Preview text oluştur (ilk 100 karakter)
 */
export function createPreview(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Timestamp'i Date'e çevir
 */
export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

/**
 * Relative time (örn: "2 saat önce", "3 gün önce")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 30) return `${diffDays} gün önce`;
  
  return formatDate(date);
}
```

## Custom Hooks

```typescript
// lib/hooks/useDiary.ts
import { useState, useEffect } from 'react';
import { subscribeToUserEntries } from '@/lib/firebase/firestore';
import type { DiaryEntryListItem } from '@/lib/types/diary';

export function useDiaryEntries(userId: string | null) {
  const [entries, setEntries] = useState<DiaryEntryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserEntries(
      userId,
      (newEntries) => {
        setEntries(newEntries);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { entries, loading, error };
}
```

## Veri Migrasyonu
İlk sürümde veri migrasyonu yok. Gelecek sürümlerde gerekirse:
- Batch writes kullanarak migration scripts
- Cloud Functions ile otomatik migrations

## Backup Stratejisi
- Firebase otomatik daily backups
- Export/Import fonksiyonları (gelecek versiyonda)

## Performans Optimizasyonları
1. **Pagination**: İlk 20 yazı, scroll ile lazy load
2. **Caching**: React Query kullanımı (opsiyonel)
3. **Offline Support**: Firebase offline persistence
4. **Preview Text**: Full content yerine sadece preview

## Limitations & Constraints
- Firestore document size limit: 1MB (bir günlük yazı max ~200,000 kelime)
- Tek günde max 20,000 yazı/okuma (Free tier)
- Real-time listener limit: 1M simultaneous (çok büyük)

## Monitoring
- Firestore Usage Dashboard
- Query performance monitoring
- Error tracking (Sentry integration - opsiyonel)

## Rollback Planı
- Firestore rules versioning
- Data export before major changes
- Backup restoration procedures

## Test Stratejisi
1. Unit tests: Helper fonksiyonlar
2. Integration tests: Firestore CRUD operations
3. Security rules tests: @firebase/rules-unit-testing

## Bağımlılıklar
```json
{
  "firebase": "^11.0.0",
  "date-fns": "^3.0.0" // Tarih işlemleri için alternatif
}
```

## İleri Adımlar
- [ ] Firestore collection structure oluştur
- [ ] Security rules deploy
- [ ] Indexes oluştur
- [ ] Helper fonksiyonlar implement
- [ ] Custom hooks implement
- [ ] Type definitions
- [ ] Unit tests
- [ ] Security rules tests
