'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Check, X } from 'lucide-react';
import { formatDate, countWords } from '@/lib/utils/diary';
import { createDiaryEntry } from '@/lib/firebase/firestore';
import { toast } from 'sonner';
import { EditorSkeleton } from '@/components/ui/skeleton-loader';
import { useDebouncedValue } from '@/lib/utils/debounce';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/lib/types/diary';
import { RichTextEditor } from '@/components/diary/rich-text-editor';

interface DiaryEditorProps {
  userId: string;
  onSaved?: (entryId: string) => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type MoodType = 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad';

export function DiaryEditor({ userId, onSaved }: DiaryEditorProps) {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  
  // Debounce content için word/char count hesaplamasını optimize et
  const debouncedContent = useDebouncedValue(content, 300);
  
  const title = formatDate(new Date());
  const wordCount = useMemo(() => countWords(debouncedContent), [debouncedContent]);
  const charCount = debouncedContent.length;
  
  const canSave = content.trim().length >= 10;

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = useCallback(async () => {
    if (!canSave) {
      toast.error('Günlük en az 10 karakter olmalıdır');
      return;
    }

    setSaveStatus('saving');
    
    try {
      const entryId = await createDiaryEntry(
        userId, 
        content.trim(),
        tags.length > 0 ? tags : undefined,
        selectedMood || undefined
      );
      setSaveStatus('saved');
      
      toast.success('Günlüğünüz kaydedildi!');
      
      // Saved animation göster, sonra reset
      setTimeout(() => {
        setContent('');
        setTags([]);
        setSelectedMood(null);
        setSaveStatus('idle');
        onSaved?.(entryId);
      }, 1500);
      
    } catch (error: any) {
      setSaveStatus('error');
      console.error('Save error:', error);
      
      toast.error('Günlük kaydedilemedi. Lütfen tekrar deneyin.');
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, [content, userId, canSave, onSaved]);

  // Keyboard shortcut: Ctrl+S / Cmd+S or Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || (e.key === 'Enter'))) {
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
      className="flex flex-col h-full bg-cream-50 rounded-lg shadow-sm border border-warm-200"
      role="region"
      aria-label="Günlük editörü"
    >
      {/* Header */}
      <div className="border-b border-warm-200 p-6 pb-4">
        <h1 className="text-2xl font-heading font-semibold text-brown-800">
          {title}
        </h1>
        <div className="flex gap-3 mt-2">
          <Badge variant="secondary" className="text-xs bg-warm-100 text-brown-700" aria-label={`${wordCount} kelime`}>
            {wordCount} kelime
          </Badge>
          <Badge variant="secondary" className="text-xs bg-warm-100 text-brown-700" aria-label={`${charCount} karakter`}>
            {charCount} karakter
          </Badge>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
        {/* Mood Selector */}
        <div>
          <label className="text-sm font-medium text-brown-800 mb-2 block">
            Ruh Halin Nasıl?
          </label>
          <div className="flex gap-2">
            {(Object.keys(MOOD_EMOJIS) as MoodType[]).map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                className={`text-2xl p-2 rounded-lg transition-all ${
                  selectedMood === mood
                    ? 'bg-terracotta-100 scale-110'
                    : 'bg-warm-100 hover:bg-warm-200'
                }`}
                title={MOOD_LABELS[mood]}
                aria-label={MOOD_LABELS[mood]}
              >
                {MOOD_EMOJIS[mood]}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Input */}
        <div>
          <label className="text-sm font-medium text-brown-800 mb-2 block">
            Kategoriler (max 5)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Tag ekle..."
              className="flex-1 px-3 py-2 rounded border border-warm-300 bg-white text-brown-800 placeholder:text-warm-500 focus:outline-none focus:border-terracotta-500"
              aria-label="Kategori ekle"
            />
            <Button
              onClick={handleAddTag}
              disabled={!tagInput.trim() || tags.length >= 5}
              size="sm"
              className="bg-warm-500 hover:bg-warm-600"
            >
              Ekle
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-terracotta-100 text-brown-800 cursor-pointer flex items-center gap-1"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Rich Text Editor */}
        <div className="flex-1 min-h-96">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Bugün neler oldu? Düşüncelerinizi buraya yazın..."
          />
        </div>
      </div>

      {/* Footer with Save Button */}
      <div className="border-t border-warm-200 p-4 flex justify-between items-center">
        <p className="text-sm text-warm-600" id="char-count">
          {canSave ? 'Ctrl+S veya Ctrl+Enter ile kaydedin' : 'En az 10 karakter yazın'}
        </p>
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
              className="min-w-[140px] bg-terracotta-500 hover:bg-terracotta-600"
              aria-label={saveStatus === 'saved' ? 'Günlük kaydedildi' : 'Günlüğü kaydet'}
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
