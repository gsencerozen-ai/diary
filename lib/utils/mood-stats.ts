import type { DiaryEntryListItem } from '@/lib/types/diary';

export type MoodType = 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad';

export interface MoodStats {
  total: number;
  byMood: Record<MoodType, number>;
  percentage: Record<MoodType, number>;
  mostCommon: MoodType | null;
  trend: 'improving' | 'declining' | 'stable' | null;
}

/**
 * Entry'lerden mood istatistiklerini hesapla
 */
export function calculateMoodStats(entries: DiaryEntryListItem[]): MoodStats {
  const moodCounts: Record<MoodType, number> = {
    'very-happy': 0,
    'happy': 0,
    'neutral': 0,
    'sad': 0,
    'very-sad': 0,
  };

  const total = entries.length;

  entries.forEach(entry => {
    if (entry.mood) {
      moodCounts[entry.mood]++;
    }
  });

  const percentage: Record<MoodType, number> = {
    'very-happy': total > 0 ? (moodCounts['very-happy'] / total) * 100 : 0,
    'happy': total > 0 ? (moodCounts['happy'] / total) * 100 : 0,
    'neutral': total > 0 ? (moodCounts['neutral'] / total) * 100 : 0,
    'sad': total > 0 ? (moodCounts['sad'] / total) * 100 : 0,
    'very-sad': total > 0 ? (moodCounts['very-sad'] / total) * 100 : 0,
  };

  // En sık seçilen mood
  const sortedMoods = Object.entries(moodCounts).sort(([, a], [, b]) => b - a);
  const mostCommon = (sortedMoods[0]?.[1] > 0 ? (sortedMoods[0]?.[0] as MoodType) : null) || null;

  // Trend hesapla (son 10 entry'ye bak)
  const recentEntries = entries.slice(0, 10);
  const recentMoodValues = recentEntries
    .filter(e => e.mood)
    .map(e => {
      const moodMap = { 'very-happy': 5, 'happy': 4, 'neutral': 3, 'sad': 2, 'very-sad': 1 };
      return moodMap[e.mood!];
    });

  let trend: 'improving' | 'declining' | 'stable' | null = null;
  if (recentMoodValues.length >= 2) {
    const firstHalf = recentMoodValues.slice(0, Math.ceil(recentMoodValues.length / 2));
    const secondHalf = recentMoodValues.slice(Math.ceil(recentMoodValues.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (avgSecond > avgFirst + 0.5) trend = 'improving';
    else if (avgSecond < avgFirst - 0.5) trend = 'declining';
    else trend = 'stable';
  }

  return {
    total,
    byMood: moodCounts,
    percentage,
    mostCommon,
    trend,
  };
}

/**
 * Mood'a göre entries filter'la
 */
export function filterEntriesByMood(
  entries: DiaryEntryListItem[],
  mood: MoodType
): DiaryEntryListItem[] {
  return entries.filter(entry => entry.mood === mood);
}

/**
 * Multiple mood'a göre filter'la
 */
export function filterEntriesByMoods(
  entries: DiaryEntryListItem[],
  moods: MoodType[]
): DiaryEntryListItem[] {
  return entries.filter(entry => entry.mood && moods.includes(entry.mood));
}
