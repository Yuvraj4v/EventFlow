export function EventCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="skeleton aspect-[16/9] w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-1/2 rounded-lg" />
        <div className="skeleton h-4 w-2/3 rounded-lg" />
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="skeleton w-6 h-6 rounded-full" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
          <div className="skeleton w-6 h-6 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => <EventCardSkeleton key={i} />)}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <div className="skeleton h-4 w-24 rounded mb-3" />
      <div className="skeleton h-8 w-16 rounded mb-2" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  );
}
