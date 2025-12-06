'use client';

import { motion } from 'framer-motion';
import { memo, useCallback } from 'react';
import { getRelativeTime, timestampToDate } from '@/lib/utils/diary';
import type { DiaryEntryListItem } from '@/lib/types/diary';
import { cn } from '@/lib/utils';

interface EntryCardProps {
  entry: DiaryEntryListItem;
  isSelected?: boolean;
  onClick: () => void;
}

export const EntryCard = memo(function EntryCard({ entry, isSelected, onClick }: EntryCardProps) {
  const savedDate = timestampToDate(entry.savedAt);
  const relativeTime = getRelativeTime(savedDate);
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-colors",
        isSelected
          ? "bg-terracotta-50 border-terracotta-300"
          : "bg-white border-warm-200 hover:bg-cream-50"
      )}
      role="listitem"
      aria-selected={isSelected}
      aria-label={`${entry.title}, ${entry.wordCount} kelime, ${relativeTime} kaydedildi`}
    >
      <h3 className="font-heading font-semibold text-brown-800 mb-1">
        {entry.title}
      </h3>
      <p className="text-sm text-warm-600 line-clamp-2 mb-2">
        {entry.previewText}
      </p>
      <div className="flex items-center justify-between text-xs text-warm-500">
        <span>{relativeTime}</span>
        <span>{entry.wordCount} kelime</span>
      </div>
    </motion.button>
  );
});
