import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
}

export function SkeletonLoader({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '' 
}: SkeletonLoaderProps) {
  return (
    <motion.div
      className={`${width} ${height} bg-gradient-to-r from-warm-200 via-warm-100 to-warm-200 rounded ${className}`}
      animate={{
        backgroundPosition: ['0% 0%', '100% 0%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        backgroundSize: '200% 100%',
      }}
    />
  );
}

export function EditorSkeleton() {
  return (
    <div className="flex flex-col h-full bg-cream-50 rounded-lg shadow-sm border border-warm-200 p-6 space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <SkeletonLoader width="w-64" height="h-8" />
        <div className="flex gap-3">
          <SkeletonLoader width="w-24" height="h-6" />
          <SkeletonLoader width="w-32" height="h-6" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3">
        <SkeletonLoader width="w-full" height="h-24" />
        <SkeletonLoader width="w-5/6" height="h-4" />
        <SkeletonLoader width="w-4/5" height="h-4" />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-warm-200">
        <SkeletonLoader width="w-40" height="h-4" />
        <SkeletonLoader width="w-28" height="h-10" />
      </div>
    </div>
  );
}

export function EntryListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-3 rounded border border-warm-200 space-y-2">
          <SkeletonLoader width="w-32" height="h-4" />
          <SkeletonLoader width="w-full" height="h-3" />
          <SkeletonLoader width="w-2/3" height="h-3" />
        </div>
      ))}
    </div>
  );
}

export function EntryViewSkeleton() {
  return (
    <div className="flex flex-col h-full bg-cream-50 rounded-lg shadow-sm border border-warm-200 p-6 space-y-6">
      {/* Header */}
      <div className="space-y-3 pb-4 border-b border-warm-200">
        <SkeletonLoader width="w-48" height="h-8" />
        <div className="flex gap-3">
          <SkeletonLoader width="w-20" height="h-5" />
          <SkeletonLoader width="w-24" height="h-5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        <SkeletonLoader width="w-full" height="h-4" />
        <SkeletonLoader width="w-5/6" height="h-4" />
        <SkeletonLoader width="w-full" height="h-4" />
        <SkeletonLoader width="w-4/5" height="h-4" />
        <div className="pt-4 space-y-3">
          <SkeletonLoader width="w-full" height="h-4" />
          <SkeletonLoader width="w-5/6" height="h-4" />
        </div>
      </div>
    </div>
  );
}
