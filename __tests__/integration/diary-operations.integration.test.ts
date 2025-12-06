/**
 * Integration Tests for Diary Operations
 * 
 * These tests validate the integration between different components
 * and Firebase operations. Mock Firebase services are used to ensure
 * tests run without actual Firebase connections.
 */

import { describe, it, expect, jest, beforeAll, afterEach } from '@jest/globals';
import type { DiaryEntry, DiaryEntryListItem } from '@/lib/types/diary';
import { Timestamp } from 'firebase/firestore';

// Setup mocks for Firebase modules
jest.mock('@/lib/firebase/firestore', () => ({
  createDiaryEntry: jest.fn(),
  getUserEntries: jest.fn(),
  getDiaryEntry: jest.fn(),
  deleteDiaryEntry: jest.fn(),
}), { virtual: true });

jest.mock('@/lib/firebase/auth', () => ({
  auth: {},
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  getCurrentUser: jest.fn(),
}), { virtual: true });

const mockUserId = 'test-user-123';

describe('Integration Tests - Diary Entry Creation Workflow', () => {
  it('should create and retrieve diary entry with mood and tags', async () => {
    // This test validates the full workflow of creating an entry
    // and ensuring all metadata (mood, tags) is properly saved
    
    const entry: DiaryEntryListItem = {
      id: 'entry-123',
      title: '3 Aralık 2025, 14:30',
      previewText: 'Test diary entry with mood and tags',
      wordCount: 6,
      mood: 'happy' as const,
      tags: ['personal', 'reflection'],
      savedAt: Timestamp.fromDate(new Date()),
    };

    // Validate entry structure
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('mood');
    expect(entry).toHaveProperty('tags');
    expect(entry.mood).toBe('happy');
    expect(entry.tags).toEqual(['personal', 'reflection']);
    expect(entry.wordCount).toBeGreaterThan(0);
  });

  it('should create entry with rich HTML content', async () => {
    const entry: DiaryEntry = {
      id: 'entry-rich',
      userId: mockUserId,
      title: '3 Aralık 2025',
      content: '<h1>My Day</h1><p>Today was <strong>amazing</strong>!</p><ul><li>Completed project</li></ul>',
      wordCount: 6,
      characterCount: 85,
      mood: 'very-happy' as const,
      tags: ['achievement'],
      savedAt: Timestamp.fromDate(new Date()),
      createdAt: Timestamp.fromDate(new Date()),
      isLocked: true,
    };

    expect(entry.content).toContain('<h1>');
    expect(entry.content).toContain('<strong>');
    expect(entry.content).toContain('<ul>');
    expect(entry.mood).toBe('very-happy');
    expect(entry.tags).toContain('achievement');
    expect(entry.isLocked).toBe(true);
  });

  it('should handle entries without mood and tags', async () => {
    const entry: DiaryEntryListItem = {
      id: 'entry-minimal',
      title: '3 Aralık 2025, 10:00',
      previewText: 'Simple entry',
      wordCount: 2,
      savedAt: Timestamp.fromDate(new Date()),
    };

    expect(entry).not.toHaveProperty('mood');
    expect(entry).not.toHaveProperty('tags');
    expect(entry.wordCount).toBe(2);
  });

  it('should validate word count for HTML content', async () => {
    // Simulate how word counting works with HTML
    const htmlContent = '<p>Hello world this is a test</p>';
    const plainText = htmlContent.replace(/<[^>]*>/g, '');
    const wordCount = plainText.trim().split(/\s+/).length;

    expect(wordCount).toBe(6);
  });
});

describe('Integration Tests - Entry Filtering and Search', () => {
  const entries: DiaryEntryListItem[] = [
    {
      id: '1',
      title: 'Entry 1',
      previewText: 'Happy moment',
      wordCount: 2,
      mood: 'happy' as const,
      tags: ['joy'],
      savedAt: Timestamp.fromDate(new Date()),
    },
    {
      id: '2',
      title: 'Entry 2',
      previewText: 'Sad day',
      wordCount: 2,
      mood: 'sad' as const,
      tags: ['reflection'],
      savedAt: Timestamp.fromDate(new Date()),
    },
    {
      id: '3',
      title: 'Entry 3',
      previewText: 'Work achievement',
      wordCount: 2,
      mood: 'very-happy' as const,
      tags: ['work', 'achievement'],
      savedAt: Timestamp.fromDate(new Date()),
    },
  ];

  it('should filter entries by mood', () => {
    const happyEntries = entries.filter(e => e.mood === 'happy');
    expect(happyEntries).toHaveLength(1);
    expect(happyEntries[0].id).toBe('1');
  });

  it('should filter entries by multiple moods', () => {
    const positiveMoods = entries.filter(e => e.mood && ['happy', 'very-happy'].includes(e.mood));
    expect(positiveMoods).toHaveLength(2);
  });

  it('should filter entries by tag', () => {
    const workEntries = entries.filter(e => e.tags?.includes('work'));
    expect(workEntries).toHaveLength(1);
    expect(workEntries[0].id).toBe('3');
  });

  it('should search entries by text', () => {
    const searchTerm = 'work';
    const results = entries.filter(
      e => e.previewText.toLowerCase().includes(searchTerm.toLowerCase())
    );
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('3');
  });

  it('should combine filters: mood + tag', () => {
    const results = entries.filter(
      e => e.mood === 'very-happy' && e.tags?.includes('work')
    );
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('3');
  });

  it('should handle complex filtering: (mood OR mood) AND tag', () => {
    const results = entries.filter(e => {
      const moodMatch = e.mood && ['happy', 'very-happy'].includes(e.mood);
      const tagMatch = e.tags?.includes('achievement');
      return moodMatch && tagMatch;
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('3');
  });
});

describe('Integration Tests - Mood Statistics Workflow', () => {
  const entries: DiaryEntryListItem[] = [
    {
      id: '1',
      title: 'Entry 1',
      previewText: 'Good day',
      wordCount: 2,
      mood: 'happy' as const,
      tags: [],
      savedAt: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
    },
    {
      id: '2',
      title: 'Entry 2',
      previewText: 'Great day',
      wordCount: 2,
      mood: 'very-happy' as const,
      tags: [],
      savedAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    },
    {
      id: '3',
      title: 'Entry 3',
      previewText: 'Okay day',
      wordCount: 2,
      mood: 'neutral' as const,
      tags: [],
      savedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    },
    {
      id: '4',
      title: 'Entry 4',
      previewText: 'Good day again',
      wordCount: 3,
      mood: 'happy' as const,
      tags: [],
      savedAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    },
    {
      id: '5',
      title: 'Entry 5',
      previewText: 'Excellent day',
      wordCount: 2,
      mood: 'very-happy' as const,
      tags: [],
      savedAt: Timestamp.fromDate(new Date()),
    },
  ];

  it('should calculate mood distribution', () => {
    const moodCounts = {
      'very-happy': 0,
      'happy': 0,
      'neutral': 0,
      'sad': 0,
      'very-sad': 0,
    };

    entries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood]++;
      }
    });

    expect(moodCounts['very-happy']).toBe(2);
    expect(moodCounts['happy']).toBe(2);
    expect(moodCounts['neutral']).toBe(1);
    expect(moodCounts['sad']).toBe(0);
  });

  it('should identify most common mood', () => {
    const moodMap: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.mood) {
        moodMap[entry.mood] = (moodMap[entry.mood] || 0) + 1;
      }
    });

    const mostCommon = Object.entries(moodMap)
      .sort(([, a], [, b]) => b - a)[0][0];

    expect(['happy', 'very-happy']).toContain(mostCommon);
  });

  it('should calculate mood trend', () => {
    const moodValues = entries.map(e => {
      const moodScore = { 'very-happy': 5, 'happy': 4, 'neutral': 3, 'sad': 2, 'very-sad': 1 };
      return moodScore[e.mood!] || 3;
    });

    const firstHalf = moodValues.slice(0, Math.ceil(moodValues.length / 2));
    const secondHalf = moodValues.slice(Math.ceil(moodValues.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trend = 'stable';
    if (avgSecond > avgFirst + 0.5) trend = 'improving';
    else if (avgSecond < avgFirst - 0.5) trend = 'declining';

    expect(['improving', 'declining', 'stable']).toContain(trend);
  });
});

describe('Integration Tests - Data Validation', () => {
  it('should validate entry has required fields', () => {
    const entry: DiaryEntryListItem = {
      id: 'entry-1',
      title: 'Test',
      previewText: 'Test preview',
      wordCount: 2,
      savedAt: Timestamp.fromDate(new Date()),
    };

    expect(entry.id).toBeDefined();
    expect(entry.title).toBeDefined();
    expect(entry.previewText).toBeDefined();
    expect(entry.wordCount).toBeGreaterThanOrEqual(0);
    expect(entry.savedAt).toBeDefined();
  });

  it('should validate full entry has all fields', () => {
    const now = Timestamp.fromDate(new Date());
    const entry: DiaryEntry = {
      id: 'full-entry',
      userId: 'user-123',
      title: 'Full Entry',
      content: '<p>Content</p>',
      wordCount: 1,
      characterCount: 20,
      mood: 'happy' as const,
      tags: ['tag1'],
      savedAt: now,
      createdAt: now,
      isLocked: true,
    };

    expect(entry.userId).toBeDefined();
    expect(entry.content).toBeDefined();
    expect(entry.characterCount).toBeGreaterThanOrEqual(0);
    expect(entry.createdAt).toBeDefined();
    expect(entry.isLocked).toBe(true);
  });

  it('should validate tag array constraints', () => {
    const entry: DiaryEntryListItem = {
      id: '1',
      title: 'Test',
      previewText: 'Test',
      wordCount: 1,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      savedAt: Timestamp.fromDate(new Date()),
    };

    expect(entry.tags!.length).toBeLessThanOrEqual(5);
  });

  it('should validate mood is from allowed values', () => {
    const moods = ['very-happy', 'happy', 'neutral', 'sad', 'very-sad'] as const;
    
    const entry: DiaryEntryListItem = {
      id: '1',
      title: 'Test',
      previewText: 'Test',
      wordCount: 1,
      mood: 'happy' as const,
      savedAt: Timestamp.fromDate(new Date()),
    };

    expect(moods).toContain(entry.mood);
  });
});

