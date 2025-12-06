"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { EntryList } from "@/components/diary/entry-list";
import { EntryFilter } from "@/components/diary/entry-filter";
import { MoodStats } from "@/components/diary/mood-stats";
import { PenSquare } from "lucide-react";
import type { DiaryEntryListItem } from "@/lib/types/diary";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  entries: DiaryEntryListItem[];
  selectedEntryId: string | null;
  onNewEntry: () => void;
  onSelectEntry: (id: string) => void;
  loading?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  entries,
  selectedEntryId,
  onNewEntry,
  onSelectEntry,
  loading,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntryListItem[]>(
    entries || []
  );

  // Update filtered entries when entries change
  useEffect(() => {
    setFilteredEntries(entries || []);
  }, [entries]);
  // Memoize the filter callback to prevent unnecessary re-renders
  const handleFilter = useCallback((filtered: DiaryEntryListItem[]) => {
    setFilteredEntries(filtered);
  }, []);

  const sidebarContent = (
    <div
      className="flex flex-col h-full"
      role="navigation"
      aria-label="Günlük navigasyonu"
    >
      <div className="p-4">
        <Button
          onClick={onNewEntry}
          className="w-full bg-terracotta-500 hover:bg-terracotta-600"
          aria-label="Yeni günlük yazısı oluştur"
        >
          <PenSquare className="mr-2 h-4 w-4" />
          Yeni Günlük
        </Button>
      </div>
      <Separator className="bg-warm-200" />
      <div className="flex-1 p-4 min-h-0 flex flex-col gap-3 overflow-hidden">
        {/* Mood Stats */}
        <div className="flex-shrink-0">
          <MoodStats entries={entries || []} />
        </div>
        {/* Filter */}
        <div className="flex-shrink-0 border-t border-warm-200 pt-3">
          <EntryFilter entries={entries || []} onFilter={handleFilter} />
        </div>
        {/* Entries List */}
        <div className="flex-1 min-h-0 flex flex-col">
          <h2 className="font-heading font-semibold text-brown-800 mb-2">
            Günlüklerim
          </h2>
          <ScrollArea className="flex-1" role="list">
            <EntryList
              entries={filteredEntries}
              selectedEntryId={selectedEntryId}
              onSelectEntry={onSelectEntry}
              loading={loading}
            />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
  return (
    <>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onToggle}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed left-0 top-[73px] bottom-0 w-72 bg-white border-r border-warm-200 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 border-r border-warm-200 bg-white h-[calc(100vh-73px)]">
        {sidebarContent}
      </aside>
    </>
  );
}
