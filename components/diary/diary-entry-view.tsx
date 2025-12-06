'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { getRelativeTime, timestampToDate } from '@/lib/utils/diary';
import { EntryViewSkeleton } from '@/components/ui/skeleton-loader';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/lib/types/diary';
import type { DiaryEntry } from '@/lib/types/diary';

interface DiaryEntryViewProps {
  entry: DiaryEntry | null;
  loading?: boolean;
}

export const DiaryEntryView = memo(function DiaryEntryView({ entry, loading }: DiaryEntryViewProps) {
  if (loading || !entry) {
    return <EntryViewSkeleton />;
  }

  const savedDate = timestampToDate(entry.savedAt);
  const relativeTime = getRelativeTime(savedDate);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-cream-50 rounded-lg shadow-sm border border-warm-200"
      role="region"
      aria-label="Günlük görüntüleme"
    >
      {/* Header */}
      <div className="border-b border-warm-200 p-6 pb-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-brown-800">
              {entry.title}
            </h1>
            <p className="text-sm text-warm-600 mt-1" aria-label={`${relativeTime} kaydedildi`}>
              {relativeTime} kaydedildi
            </p>
          </div>
          <Lock className="w-5 h-5 text-warm-500" aria-label="Korunan yazı" />
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <Badge variant="secondary" className="text-xs bg-warm-100 text-brown-700" aria-label={`${entry.wordCount} kelime`}>
            {entry.wordCount} kelime
          </Badge>
          <Badge variant="secondary" className="text-xs bg-warm-100 text-brown-700" aria-label={`${entry.characterCount} karakter`}>
            {entry.characterCount} karakter
          </Badge>
          
          {entry.mood && (
            <Badge variant="secondary" className="text-xs bg-terracotta-100 text-brown-700">
              {MOOD_EMOJIS[entry.mood]} {MOOD_LABELS[entry.mood]}
            </Badge>
          )}
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <Badge key={tag} className="bg-warm-200 text-brown-800 text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div 
          className="prose prose-sm max-w-none text-brown-800
            [&_p]:mb-2
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2
            [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2
            [&_ul]:list-disc [&_ul]:list-inside [&_ul]:mb-2
            [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-2
            [&_li]:mb-1
            [&_code]:bg-warm-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:font-mono
            [&_pre]:bg-warm-100 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </div>
    </motion.article>
  );
});
