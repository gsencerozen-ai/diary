# RFC-005: Günlük Editor ve CRUD İşlemleri

## Durum
Önerilen

## Özet
Günlük yazma, kaydetme ve görüntüleme işlemlerinin detaylı implementasyonu.

## Motivasyon
- Kullanıcıların sorunsuz bir yazma deneyimi yaşaması
- Yazıların güvenli ve tutarlı şekilde saklanması
- Eski yazıların immutable olması
- Performanslı ve responsive editor

## Editor Gereksinimleri

### Fonksiyonel Gereksinimler

1. **Yeni Günlük Oluşturma**
   - Kullanıcı giriş yaptığında otomatik olarak bugünün tarihi ile boş editor
   - "Yeni Günlük" butonuna basınca yeni editor açılır
   - Aynı gün birden fazla günlük yazılabilir

2. **Yazı Yazma**
   - Plain text editor (ilk versiyon)
   - Auto-resizing textarea
   - Karakter ve kelime sayacı (real-time)
   - Tab key support
   - Autofocus on mount

3. **Kaydetme**
   - "Kaydet" butonu ile manuel kayıt
   - Kaydedildikten sonra entry locked (değiştirilemiyor)
   - Success feedback (toast/animation)
   - Kaydedildikten sonra sidebar'da görünür

4. **Görüntüleme**
   - Sidebar'dan entry seçimi
   - Read-only görünüm
   - Locked indicator
   - Metadata gösterimi

### Teknik Gereksinimler

1. **State Management**
   - Unsaved content state
   - Saving status (idle, saving, saved, error)
   - Navigation guard (unsaved changes warning)

2. **Validation**
   - Minimum content length (örn: 10 karakter)
   - Maximum content length (Firestore limit: 1MB ~ 200k kelime)

3. **Error Handling**
   - Network errors
   - Permission errors
   - Validation errors
   - User-friendly error messages

## Detaylı Implementasyon

### DiaryEditor Component

```typescript
// components/diary/diary-editor.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDate, countWords } from '@/lib/utils/diary';
import { createDiaryEntry } from '@/lib/firebase/firestore';
import { Save, Loader2, Check } from 'lucide-react';

interface DiaryEditorProps {
  userId: string;
  onSaved?: (entryId: string) => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function DiaryEditor({ userId, onSaved }: DiaryEditorProps) {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const { toast } = useToast();
  
  const title = formatDate(new Date());
  const wordCount = countWords(content);
  const charCount = content.length;
  
  const canSave = content.trim().length >= 10;

  const handleSave = useCallback(async () => {
    if (!canSave) {
      toast({
        title: 'Çok kısa',
        description: 'Günlüğünüz en az 10 karakter olmalıdır.',
        variant: 'destructive',
      });
      return;
    }

    setSaveStatus('saving');
    
    try {
      const entryId = await createDiaryEntry(userId, content.trim());
      setSaveStatus('saved');
      
      toast({
        title: '✓ Kaydedildi',
        description: 'Günlüğünüz başarıyla kaydedildi.',
      });
      
      // Saved animation göster, sonra reset
      setTimeout(() => {
        setContent('');
        setSaveStatus('idle');
        onSaved?.(entryId);
      }, 1500);
      
    } catch (error) {
      setSaveStatus('error');
      console.error('Save error:', error);
      
      toast({
        title: 'Hata',
        description: 'Günlüğünüz kaydedilemedi. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, [content, userId, canSave, onSaved, toast]);

  // Keyboard shortcut: Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (canSave && saveStatus === 'idle') {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, canSave, saveStatus]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (content.trim().length > 0 && saveStatus !== 'saved') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [content, saveStatus]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-cream-50 rounded-lg shadow-sm"
    >
      {/* Header */}
      <div className="border-b border-warm-200 p-6 pb-4">
        <h1 className="text-2xl font-heading font-semibold text-brown-800">
          {title}
        </h1>
        <div className="flex gap-3 mt-2">
          <Badge variant="secondary" className="text-xs">
            {wordCount} kelime
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {charCount} karakter
          </Badge>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <TextareaAutosize
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bugün neler oldu? Düşüncelerinizi buraya yazın..."
          className="w-full resize-none border-none outline-none bg-transparent 
                     font-diary text-brown-800 text-lg leading-relaxed
                     placeholder:text-warm-400"
          minRows={10}
          autoFocus
          disabled={saveStatus === 'saving' || saveStatus === 'saved'}
        />
      </div>

      {/* Footer with Save Button */}
      <div className="border-t border-warm-200 p-4 flex justify-end">
        <AnimatePresence mode="wait">
          <motion.div
            key={saveStatus}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <Button
              onClick={handleSave}
              disabled={!canSave || saveStatus === 'saving' || saveStatus === 'saved'}
              size="lg"
              className="min-w-[140px]"
            >
              {saveStatus === 'idle' && (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </>
              )}
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Kaydedildi!
                </>
              )}
              {saveStatus === 'error' && 'Tekrar Dene'}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
```

### DiaryEntryView Component

```typescript
// components/diary/diary-entry-view.tsx
'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { formatDate, getRelativeTime, timestampToDate } from '@/lib/utils/diary';
import type { DiaryEntry } from '@/lib/types/diary';

interface DiaryEntryViewProps {
  entry: DiaryEntry;
}

export function DiaryEntryView({ entry }: DiaryEntryViewProps) {
  const savedDate = timestampToDate(entry.savedAt);
  const relativeTime = getRelativeTime(savedDate);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-cream-50 rounded-lg shadow-sm"
    >
      {/* Header */}
      <div className="border-b border-warm-200 p-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-brown-800">
              {entry.title}
            </h1>
            <p className="text-sm text-warm-600 mt-1">
              {relativeTime} kaydedildi
            </p>
          </div>
          <Lock className="w-5 h-5 text-warm-500" />
        </div>
        
        <div className="flex gap-3 mt-3">
          <Badge variant="secondary" className="text-xs">
            {entry.wordCount} kelime
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {entry.characterCount} karakter
          </Badge>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="prose prose-lg max-w-none font-diary text-brown-800 leading-relaxed whitespace-pre-wrap">
          {entry.content}
        </div>
      </div>
    </motion.article>
  );
}
```

### Main Page Implementation

```typescript
// app/(protected)/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useDiaryEntries } from '@/lib/hooks/use-diary';
import { getDiaryEntry } from '@/lib/firebase/firestore';
import { DiaryEditor } from '@/components/diary/diary-editor';
import { DiaryEntryView } from '@/components/diary/diary-entry-view';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import type { DiaryEntry } from '@/lib/types/diary';

export default function DiaryPage() {
  const { user } = useAuth();
  const { entries, loading } = useDiaryEntries(user?.uid ?? null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(true);

  // Load selected entry
  useEffect(() => {
    if (!selectedEntryId || !user) {
      setSelectedEntry(null);
      return;
    }

    getDiaryEntry(selectedEntryId, user.uid).then(setSelectedEntry);
  }, [selectedEntryId, user]);

  const handleNewEntry = () => {
    setSelectedEntryId(null);
    setSelectedEntry(null);
    setIsNewEntry(true);
  };

  const handleSelectEntry = (id: string) => {
    setSelectedEntryId(id);
    setIsNewEntry(false);
  };

  const handleEntrySaved = (newEntryId: string) => {
    // Yeni yazı kaydedildi, ona geç
    setSelectedEntryId(newEntryId);
    setIsNewEntry(false);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-cream-100">
      <Header user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          entries={entries}
          currentEntryId={selectedEntryId}
          onNewEntry={handleNewEntry}
          onSelectEntry={handleSelectEntry}
          loading={loading}
        />
        
        <main className="flex-1 p-6 overflow-hidden">
          {isNewEntry || !selectedEntry ? (
            <DiaryEditor 
              userId={user.uid} 
              onSaved={handleEntrySaved}
            />
          ) : (
            <DiaryEntryView entry={selectedEntry} />
          )}
        </main>
      </div>
    </div>
  );
}
```

## State Transitions

```
┌─────────┐  "Yeni Günlük"   ┌──────────┐
│ Empty   │ ───────────────→ │ Editing  │
└─────────┘                  └──────────┘
                                   │
                                   │ "Kaydet"
                                   ↓
                             ┌──────────┐
                             │ Saving   │
                             └──────────┘
                                   │
                      ┌────────────┼────────────┐
                      ↓                         ↓
                 ┌─────────┐              ┌─────────┐
                 │ Saved   │              │ Error   │
                 └─────────┘              └─────────┘
                      │                         │
                      └────────────┬────────────┘
                                   ↓
                              ┌──────────┐
                              │ Viewing  │
                              └──────────┘
```

## Validasyon Kuralları

```typescript
// lib/schemas/diary.ts
import { z } from 'zod';

export const diaryContentSchema = z.object({
  content: z
    .string()
    .min(10, 'Günlük en az 10 karakter olmalıdır')
    .max(1000000, 'Günlük çok uzun (max 1MB)')
    .trim(),
});

export type DiaryContentInput = z.infer<typeof diaryContentSchema>;
```

## Hata Senaryoları

### 1. Network Hatası
```typescript
Error: "İnternet bağlantısı yok"
Action: Retry butonu + offline mod bilgisi
```

### 2. Authentication Hatası
```typescript
Error: "Oturum süreniz doldu"
Action: Otomatik logout + login sayfasına yönlendirme
```

### 3. Permission Hatası
```typescript
Error: "Bu işlem için yetkiniz yok"
Action: Hata mesajı + ana sayfaya dön
```

### 4. Validation Hatası
```typescript
Error: "Günlük çok kısa"
Action: Inline error mesajı (input altında)
```

## Performans Optimizasyonları

### 1. Debounce Word/Character Count
```typescript
import { useMemo } from 'react';
import { debounce } from '@/lib/utils/debounce';

const debouncedCount = useMemo(
  () => debounce((text: string) => {
    setWordCount(countWords(text));
  }, 300),
  []
);
```

### 2. Virtualized Entry List
```typescript
// Çok fazla entry varsa (>100)
import { useVirtualizer } from '@tanstack/react-virtual';
```

### 3. Lazy Loading Entries
```typescript
// Pagination ile 20'şer entry
const [entriesPage, setEntriesPage] = useState(1);
const ENTRIES_PER_PAGE = 20;
```

## Offline Support (Future)

Firebase Offline Persistence:
```typescript
// lib/firebase/config.ts
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs açık
  } else if (err.code === 'unimplemented') {
    // Browser desteklemiyor
  }
});
```

## Accessibility

### Keyboard Shortcuts
- `Ctrl/Cmd + S`: Save
- `Ctrl/Cmd + N`: New entry
- `Escape`: Close modals
- `Tab`: Navigate through UI

### Screen Reader
- ARIA labels on buttons
- Form labels properly associated
- Live regions for status updates

### Focus Management
- Auto-focus editor on mount
- Focus trap in modals
- Clear focus indicators

## Testing Stratejisi

### Unit Tests
```typescript
// __tests__/diary-editor.test.tsx
describe('DiaryEditor', () => {
  it('should count words correctly', () => {
    // ...
  });
  
  it('should disable save when content is too short', () => {
    // ...
  });
  
  it('should show saving state', () => {
    // ...
  });
});
```

### Integration Tests
```typescript
// __tests__/diary-flow.test.tsx
describe('Diary Flow', () => {
  it('should create and save new entry', async () => {
    // ...
  });
  
  it('should display saved entry as read-only', async () => {
    // ...
  });
});
```

### E2E Tests
```typescript
// e2e/diary.spec.ts (Playwright)
test('full diary workflow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Write entry
  await page.fill('textarea', 'Bu benim ilk günlüğüm!');
  await page.click('button:has-text("Kaydet")');
  
  // Verify saved
  await expect(page.locator('text=Kaydedildi')).toBeVisible();
});
```

## Monitoring & Analytics (Future)

```typescript
// Track key metrics
- Average entry length
- Entries per user per week
- Save success rate
- Error rates by type
```

## Bağımlılıklar

```json
{
  "react-textarea-autosize": "^8.5.0",
  "lodash.debounce": "^4.0.8"
}
```

## İleri Adımlar
- [ ] DiaryEditor component
- [ ] DiaryEntryView component
- [ ] Main page implementation
- [ ] Validation schemas
- [ ] Error handling
- [ ] Keyboard shortcuts
- [ ] Unsaved changes warning
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Accessibility audit

## Future Enhancements
- Rich text editor (Bold, Italic, Lists)
- Markdown support
- Image upload
- Entry search
- Tags/categories
- Export to PDF
- Share entry (public link)
