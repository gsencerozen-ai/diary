import { calculateMoodStats, filterEntriesByMood, filterEntriesByMoods } from '@/lib/utils/mood-stats';
import type { DiaryEntryListItem } from '@/lib/types/diary';
import { Timestamp } from 'firebase/firestore';

const mockEntries: DiaryEntryListItem[] = [
  {
    id: '1',
    title: '1 Aralık',
    previewText: 'Happy day',
    wordCount: 2,
    mood: 'happy',
    tags: ['joy'],
    savedAt: Timestamp.fromDate(new Date('2025-12-01')),
  },
  {
    id: '2',
    title: '2 Aralık',
    previewText: 'Very happy day',
    wordCount: 3,
    mood: 'very-happy',
    tags: ['joy', 'celebration'],
    savedAt: Timestamp.fromDate(new Date('2025-12-02')),
  },
  {
    id: '3',
    title: '3 Aralık',
    previewText: 'Neutral day',
    wordCount: 2,
    mood: 'neutral',
    tags: ['normal'],
    savedAt: Timestamp.fromDate(new Date('2025-12-03')),
  },
  {
    id: '4',
    title: '4 Aralık',
    previewText: 'Sad day',
    wordCount: 2,
    mood: 'sad',
    tags: ['sad'],
    savedAt: Timestamp.fromDate(new Date('2025-12-04')),
  },
  {
    id: '5',
    title: '5 Aralık',
    previewText: 'Happy again',
    wordCount: 2,
    mood: 'happy',
    tags: ['recovery'],
    savedAt: Timestamp.fromDate(new Date('2025-12-05')),
  },
];

describe('Mood Stats Utils', () => {
  describe('calculateMoodStats', () => {
    it('should calculate mood distribution', () => {
      const stats = calculateMoodStats(mockEntries);
      
      expect(stats.total).toBe(5);
      expect(stats.byMood).toEqual({
        'very-happy': 1,
        'happy': 2,
        'neutral': 1,
        'sad': 1,
        'very-sad': 0,
      });
    });

    it('should calculate mood percentages', () => {
      const stats = calculateMoodStats(mockEntries);
      
      expect(stats.percentage['happy']).toBe(40);
      expect(stats.percentage['very-happy']).toBe(20);
      expect(stats.percentage['neutral']).toBe(20);
      expect(stats.percentage['sad']).toBe(20);
      expect(stats.percentage['very-sad']).toBe(0);
    });

    it('should find most common mood', () => {
      const stats = calculateMoodStats(mockEntries);
      expect(stats.mostCommon).toBe('happy');
    });

    it('should calculate trend', () => {
      const stats = calculateMoodStats(mockEntries);
      expect(stats.trend).toBeDefined();
      expect(['improving', 'declining', 'stable', null]).toContain(stats.trend);
    });

    it('should handle empty entries', () => {
      const stats = calculateMoodStats([]);
      
      expect(stats.total).toBe(0);
      expect(stats.byMood['happy']).toBe(0);
      expect(stats.mostCommon).toBeNull();
    });

    it('should handle entries without mood', () => {
      const entriesWithoutMood: DiaryEntryListItem[] = [
        {
          id: '1',
          title: 'Test',
          previewText: 'Test',
          wordCount: 1,
          savedAt: Timestamp.now(),
        },
      ];
      
      const stats = calculateMoodStats(entriesWithoutMood);
      expect(stats.total).toBe(1);
      expect(stats.mostCommon).toBeNull();
    });
  });

  describe('filterEntriesByMood', () => {
    it('should filter entries by single mood', () => {
      const happyEntries = filterEntriesByMood(mockEntries, 'happy');
      expect(happyEntries).toHaveLength(2);
      expect(happyEntries.every(e => e.mood === 'happy')).toBe(true);
    });

    it('should return empty array if no matches', () => {
      const veryHappyEntries = filterEntriesByMood(mockEntries, 'very-sad');
      expect(veryHappyEntries).toHaveLength(0);
    });

    it('should handle entries without mood', () => {
      const entriesWithoutMood: DiaryEntryListItem[] = [
        {
          id: '1',
          title: 'Test',
          previewText: 'Test',
          wordCount: 1,
          savedAt: Timestamp.now(),
        },
      ];
      
      const filtered = filterEntriesByMood(entriesWithoutMood, 'happy');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('filterEntriesByMoods', () => {
    it('should filter entries by multiple moods', () => {
      const filtered = filterEntriesByMoods(mockEntries, ['happy', 'very-happy']);
      expect(filtered).toHaveLength(3);
      expect(filtered.every(e => ['happy', 'very-happy'].includes(e.mood!))).toBe(true);
    });

    it('should handle empty mood array', () => {
      const filtered = filterEntriesByMoods(mockEntries, []);
      expect(filtered).toHaveLength(0);
    });

    it('should handle single mood in array', () => {
      const filtered = filterEntriesByMoods(mockEntries, ['happy']);
      expect(filtered).toHaveLength(2);
    });

    it('should return empty if no matches', () => {
      const filtered = filterEntriesByMoods(mockEntries, ['very-sad']);
      expect(filtered).toHaveLength(0);
    });
  });
});
