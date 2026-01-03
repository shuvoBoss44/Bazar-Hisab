/**
 * Professional loading skeleton component
 * Used throughout the app for better perceived performance
 */
function LoadingSkeleton({ type = 'card', count = 1, className = '' }) {
  const skeletons = {
    card: 'skeleton-card',
    text: 'skeleton-text',
    title: 'skeleton-title',
    avatar: 'skeleton-avatar',
    button: 'skeleton-button',
    custom: className
  };

  const skeletonClass = skeletons[type] || skeletons.card;

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClass} aria-label="Loading..." />
      ))}
    </div>
  );
}

/**
 * Transaction list skeleton - specific for dashboard
 */
export function TransactionListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-8">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-6">
            <div className="skeleton-avatar w-16 h-16 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-6 w-48" />
            </div>
            <div className="skeleton h-10 w-32" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="skeleton h-16 rounded-xl" />
            <div className="skeleton h-16 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}



/**
 * Dashboard stats skeleton
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="skeleton-avatar" />
            <div className="skeleton h-3 w-16" />
          </div>
          <div className="skeleton h-8 w-24" />
          <div className="skeleton h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
