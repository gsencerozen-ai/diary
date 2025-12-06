"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useDiaryEntries } from "@/lib/hooks/use-diary";
import { Sidebar } from "@/components/layout/sidebar";
import { DiaryEditor } from "@/components/diary/diary-editor";
import { DiaryEntryView } from "@/components/diary/diary-entry-view";
import { getDiaryEntry } from "@/lib/firebase/firestore";
import type { DiaryEntry } from "@/lib/types/diary";
import { toast } from "sonner";

type ViewMode = "new" | "view";

export default function DiaryPage() {
  const { user } = useAuth();
  const { entries, loading } = useDiaryEntries(user?.uid || null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("new");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const handleNewEntry = useCallback(() => {
    setViewMode("new");
    setSelectedEntryId(null);
    setSelectedEntry(null);
    setSidebarOpen(false); // Close sidebar on mobile after action
  }, []);

  const handleSelectEntry = useCallback(
    async (entryId: string) => {
      if (!user?.uid) return;

      setLoadingEntry(true);
      try {
        const entry = await getDiaryEntry(entryId, user.uid);
        if (entry) {
          setSelectedEntry(entry);
          setSelectedEntryId(entryId);
          setViewMode("view");
          setSidebarOpen(false); // Close sidebar on mobile after action
        }
      } catch (error) {
        console.error("Error loading entry:", error);
        toast.error("Günlük yüklenirken hata oluştu");
      } finally {
        setLoadingEntry(false);
      }
    },
    [user?.uid]
  );
  const handleEntrySaved = useCallback(
    (entryId: string) => {
      toast.success("Günlük başarıyla kaydedildi");
      handleSelectEntry(entryId);
    },
    [handleSelectEntry]
  );

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar - Mobile overlay / Desktop fixed */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-warm-200
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {" "}
        <Sidebar
          entries={entries}
          selectedEntryId={selectedEntryId}
          onNewEntry={handleNewEntry}
          onSelectEntry={handleSelectEntry}
          loading={loading}
          isOpen={sidebarOpen}
          onToggle={handleToggleSidebar}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          {viewMode === "new" ? (
            <DiaryEditor userId={user.uid} onSaved={handleEntrySaved} />
          ) : (
            <DiaryEntryView entry={selectedEntry} loading={loadingEntry} />
          )}
        </div>
      </div>
    </div>
  );
}
