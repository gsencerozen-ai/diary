import { countWords, createPreview, getRelativeTime, formatDate } from '@/lib/utils/diary';

describe('Diary Utils', () => {
  describe('countWords', () => {
    it('should count words in plain text', () => {
      expect(countWords('hello world')).toBe(2);
      expect(countWords('This is a test')).toBe(4);
    });

    it('should handle HTML content', () => {
      expect(countWords('<p>hello world</p>')).toBe(2);
      // Note: Without space between closing and opening tags, words merge
      expect(countWords('<h1>Title</h1><p>Some content here</p>')).toBe(3); // TitleSome content here
      expect(countWords('<h1>Title</h1> <p>Some content here</p>')).toBe(4); // Title Some content here
    });

    it('should return 0 for empty text', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
      expect(countWords('<p></p>')).toBe(0);
    });

    it('should handle multiple spaces', () => {
      expect(countWords('hello    world')).toBe(2);
      expect(countWords('   hello   world   ')).toBe(2);
    });

    it('should handle special characters', () => {
      expect(countWords('hello, world! How are you?')).toBe(5);
    });

    it('should handle Turkish characters', () => {
      expect(countWords('Merhaba dünya')).toBe(2);
      expect(countWords('Bugün çok güzel bir gün')).toBe(5);
    });
  });

  describe('createPreview', () => {
    it('should create preview for short text', () => {
      expect(createPreview('Hello world')).toBe('Hello world');
    });

    it('should truncate long text', () => {
      const longText = 'a'.repeat(150);
      const preview = createPreview(longText, 100);
      expect(preview.length).toBeLessThanOrEqual(104); // 100 + '...'
      expect(preview.endsWith('...')).toBe(true);
    });

    it('should remove HTML tags', () => {
      expect(createPreview('<p>Hello world</p>')).toBe('Hello world');
      expect(createPreview('<h1>Title</h1><p>Content</p>', 20)).toBe('TitleContent');
    });

    it('should handle default maxLength', () => {
      const longText = 'a'.repeat(150);
      const preview = createPreview(longText);
      expect(preview.length).toBeLessThanOrEqual(103); // 100 + '...'
    });

    it('should return empty string for empty input', () => {
      expect(createPreview('')).toBe('');
      expect(createPreview('<p></p>')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date(2025, 11, 3, 14, 30); // December 3, 2025, 14:30
      const formatted = formatDate(date);
      expect(formatted).toContain('3');
      expect(formatted).toContain('Aralık');
      expect(formatted).toContain('2025');
      expect(formatted).toContain('14:30');
    });

    it('should pad hours and minutes with zeros', () => {
      const date = new Date(2025, 0, 5, 9, 5); // January 5, 2025, 09:05
      const formatted = formatDate(date);
      expect(formatted).toContain('09:05');
    });

    it('should handle all months', () => {
      const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      
      months.forEach((month, index) => {
        const date = new Date(2025, index, 15);
        expect(formatDate(date)).toContain(month);
      });
    });
  });

  describe('getRelativeTime', () => {
    it('should return "Az önce" for recent times', () => {
      const now = new Date();
      expect(getRelativeTime(now)).toBe('Az önce');
    });

    it('should return minutes ago', () => {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(getRelativeTime(fiveMinsAgo)).toBe('5 dakika önce');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(getRelativeTime(twoHoursAgo)).toBe('2 saat önce');
    });

    it('should return days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(getRelativeTime(threeDaysAgo)).toBe('3 gün önce');
    });

    it('should return formatted date for old times', () => {
      const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const result = getRelativeTime(twoMonthsAgo);
      expect(result).toMatch(/\d+ \w+ \d+, \d+:\d+/);
    });
  });
});
