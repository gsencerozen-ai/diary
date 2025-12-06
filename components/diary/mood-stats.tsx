'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/lib/types/diary';
import { calculateMoodStats } from '@/lib/utils/mood-stats';
import type { DiaryEntryListItem } from '@/lib/types/diary';

interface MoodStatsProps {
  entries: DiaryEntryListItem[];
}

export const MoodStats = memo(function MoodStats({ entries }: MoodStatsProps) {
  const stats = calculateMoodStats(entries);

  if (stats.total === 0) {
    return null;
  }

  const moods = ['very-happy', 'happy', 'neutral', 'sad', 'very-sad'] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-warm-50 to-cream-50 rounded-lg p-4 border border-warm-200"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-heading font-semibold text-brown-800 mb-1">
          Ruh Hali İstatistikleri
        </h3>
        <p className="text-sm text-warm-600">
          {stats.total} günlük yazısından
          {stats.mostCommon && (
            <> en sık {MOOD_EMOJIS[stats.mostCommon]} {MOOD_LABELS[stats.mostCommon]}</>
          )}
        </p>
      </div>

      {/* Mood Bars */}
      <div className="space-y-3">
        {moods.map((mood) => (
          <div key={mood}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg w-6 text-center">{MOOD_EMOJIS[mood]}</span>
              <span className="text-xs font-medium text-brown-700 min-w-16">
                {MOOD_LABELS[mood]}
              </span>
              <span className="text-xs text-warm-600 ml-auto">
                {stats.byMood[mood]}
              </span>
            </div>
            <div className="w-full bg-warm-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage[mood]}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-terracotta-500 to-terracotta-400"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Trend */}
      {stats.trend && (
        <div className="mt-4 pt-4 border-t border-warm-200">
          <p className="text-xs text-warm-600">
            Trend:{' '}
            <span className={`font-medium ${
              stats.trend === 'improving' ? 'text-green-600' :
              stats.trend === 'declining' ? 'text-red-600' :
              'text-brown-700'
            }`}>
              {stats.trend === 'improving' && '📈 İyileşiyor'}
              {stats.trend === 'declining' && '📉 Kötüleşiyor'}
              {stats.trend === 'stable' && '➡️ Sabit'}
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
});
