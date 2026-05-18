"use client";

interface SkeletonCardProps {
  variant?: "post" | "profile" | "stat" | "table" | "feed";
  count?: number;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-black/5 via-black/10 to-black/5 dark:from-white/5 dark:via-white/10 dark:to-white/5 bg-[length:200%_100%] animate-shimmer ${className}`}
    />
  );
}

function PostSkeleton() {
  return (
    <div className="p-5 rounded-xl border border-slate-border bg-white dark:bg-midnight2 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-9 h-9 rounded-full" />
        <div className="space-y-2 flex-1">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-2 w-16" />
        </div>
        <SkeletonBlock className="h-5 w-14 rounded-full" />
      </div>
      <SkeletonBlock className="h-4 w-3/4" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-5/6" />
      <div className="flex items-center gap-4 pt-2">
        <SkeletonBlock className="h-6 w-14 rounded-lg" />
        <SkeletonBlock className="h-6 w-14 rounded-lg" />
        <SkeletonBlock className="h-6 w-14 rounded-lg" />
      </div>
      <SkeletonBlock className="h-32 w-full rounded-lg" />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="relative h-40 rounded-xl bg-gradient-to-r from-black/5 via-black/10 to-black/5 dark:from-white/5 dark:via-white/10 dark:to-white/5 bg-[length:200%_100%] animate-shimmer" />
      <div className="flex items-end gap-4 px-4 -mt-10">
        <SkeletonBlock className="w-20 h-20 rounded-full border-4 border-white dark:border-midnight" />
        <div className="space-y-2 pb-2 flex-1">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
      </div>
      <div className="px-4 space-y-2">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-slate-border bg-white dark:bg-midnight2 space-y-3">
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="h-8 w-16" />
      <SkeletonBlock className="h-2 w-24" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-slate-border">
          <SkeletonBlock className="h-8 w-8 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-2 w-16" />
          </div>
          <SkeletonBlock className="h-6 w-16 rounded-lg" />
          <SkeletonBlock className="h-6 w-16 rounded-lg" />
          <SkeletonBlock className="h-6 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

export function SkeletonCard({ variant = "post", count = 1 }: SkeletonCardProps) {
  const variants = {
    post: PostSkeleton,
    profile: ProfileSkeleton,
    stat: StatSkeleton,
    table: TableSkeleton,
    feed: FeedSkeleton,
  };
  const Component = variants[variant];

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Component key={i} />
      ))}
    </>
  );
}
