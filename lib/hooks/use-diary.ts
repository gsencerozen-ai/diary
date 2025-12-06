'use client';

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
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { entries, loading, error };
}
