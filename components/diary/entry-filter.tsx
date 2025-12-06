'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { DiaryEntryListItem } from '@/lib/types/diary';

interface EntryFilterProps {
  entries: DiaryEntryListItem[];
  onFilter: (filtered: DiaryEntryListItem[]) => void;
}

export function EntryFilter({ entries, onFilter }: EntryFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Tüm unique tags'leri topla
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach(entry => {
      entry.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [entries]);

  // Filter'lama logic
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const titleMatch = entry.title.toLowerCase().includes(search);
        const previewMatch = entry.previewText.toLowerCase().includes(search);
        if (!titleMatch && !previewMatch) return false;
      }

      // Mood filter
      if (selectedMood && entry.mood !== selectedMood) return false;

      // Tag filter
      if (selectedTag && !entry.tags?.includes(selectedTag)) return false;

      return true;
    });
  }, [entries, searchTerm, selectedMood, selectedTag]);

  // Filtered entries'i parent'a gönder
  useMemo(() => {
    onFilter(filteredEntries);
  }, [filteredEntries, onFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-500" />
        <input
          type="text"
          placeholder="Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-sm rounded border border-warm-300 bg-white text-brown-800 placeholder:text-warm-500 focus:outline-none focus:border-terracotta-500"
          aria-label="Günlüklerde ara"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-warm-100 rounded"
            aria-label="Aramayı temizle"
          >
            <X className="w-4 h-4 text-warm-500" />
          </button>
        )}
      </div>

      {/* Filter Badges */}
      <div className="flex flex-wrap gap-2">
        {/* Mood Filter */}
        {['very-happy', 'happy', 'neutral', 'sad', 'very-sad'].map((mood) => {
          const moodEmojis = { 'very-happy': '😄', 'happy': '😊', 'neutral': '😐', 'sad': '😢', 'very-sad': '😭' };
          return (
            <button
              key={mood}
              onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
              className={`text-xl p-1 rounded transition-all ${
                selectedMood === mood
                  ? 'bg-terracotta-100 scale-110'
                  : 'bg-warm-100 hover:bg-warm-200'
              }`}
              title={`${mood} filtrele`}
              aria-pressed={selectedMood === mood}
              aria-label={`${mood} mood filtresi`}
            >
              {moodEmojis[mood as keyof typeof moodEmojis]}
            </button>
          );
        })}
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`text-xs px-2 py-1 rounded-full transition-all ${
                selectedTag === tag
                  ? 'bg-terracotta-500 text-white'
                  : 'bg-warm-200 text-brown-800 hover:bg-warm-300'
              }`}
              aria-pressed={selectedTag === tag}
              aria-label={`${tag} tag filtresi`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Active Filters */}
      {(searchTerm || selectedMood || selectedTag) && (
        <p className="text-xs text-warm-600">
          {filteredEntries.length} sonuç bulundu
        </p>
      )}
    </motion.div>
  );
}
