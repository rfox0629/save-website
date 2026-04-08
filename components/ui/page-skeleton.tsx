function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-white/60 ${className}`} />
  );
}

export function AuthPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <SkeletonBlock className="h-16 w-full rounded-[28px]" />
        <SkeletonBlock className="h-48 w-full rounded-[32px]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonBlock className="h-[360px] w-full rounded-[32px]" />
          <SkeletonBlock className="h-[360px] w-full rounded-[32px]" />
        </div>
      </div>
    </main>
  );
}

export function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-[#0B1622] px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <SkeletonBlock className="h-40 w-full rounded-[32px] bg-white/10" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock
              className="h-28 w-full rounded-[24px] bg-white/10"
              key={index}
            />
          ))}
        </div>
        <SkeletonBlock className="h-[420px] w-full rounded-[32px] bg-white/10" />
      </div>
    </main>
  );
}

export function PublicBriefSkeleton() {
  return (
    <main className="min-h-screen bg-[#F9F6F0] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex justify-end">
          <SkeletonBlock className="h-10 w-32" />
        </div>
        <SkeletonBlock className="h-[920px] w-full rounded-[32px]" />
      </div>
    </main>
  );
}
