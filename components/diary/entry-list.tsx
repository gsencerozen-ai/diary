'use client';

import { motion } from 'framer-motion';
import { memo, useCallback } from 'react';
import { EntryCard } from './entry-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DiaryEntryListItem } from '@/lib/types/diary';
import { BookOpen } from 'lucide-react';

interface EntryListProps {
  entries: DiaryEntryListItem[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  loading?: boolean;
}

export const EntryList = memo(function EntryList({ entries, selectedEntryId, onSelectEntry, loading }: EntryListProps) {
  const handleSelectEntry = useCallback((id: string) => {
    onSelectEntry(id);
  }, [onSelectEntry]);
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <BookOpen className="w-12 h-12 text-warm-400 mb-4" />
        <p className="text-warm-600 font-medium mb-1">
          Henüz günlük yazmadınız
        </p>
        <p className="text-sm text-warm-500">
          İlk günlüğünüzü yazmak için yukarıdaki butona tıklayın
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {entries.map((entry) => (
        <motion.div
          key={entry.id}
          variants={{
            hidden: { opacity: 0, x: -20 },
            show: { opacity: 1, x: 0 }
          }}
        >
          <EntryCard
            entry={entry}
            isSelected={selectedEntryId === entry.id}
            onClick={() => handleSelectEntry(entry.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
});
