/**
 * Reusable skeleton loader with animate-pulse shimmer effect
 */
const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = (key) => {
    if (type === 'text') {
      return (
        <div key={key} className="space-y-2.5 animate-pulse w-full">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3.5 bg-slate-200 rounded w-5/6"></div>
          <div className="h-3.5 bg-slate-200 rounded w-1/2"></div>
        </div>
      );
    }

    if (type === 'table') {
      return (
        <div key={key} className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-slate-200 rounded w-full"></div>
          <div className="h-6 bg-slate-100 rounded w-full"></div>
          <div className="h-6 bg-slate-100 rounded w-full"></div>
          <div className="h-6 bg-slate-100 rounded w-full"></div>
        </div>
      );
    }

    // Default card skeleton
    return (
      <div
        key={key}
        className="border border-slate-100 shadow-sm rounded-xl p-6 bg-white animate-pulse space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-slate-200 rounded w-full"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  };

  return (
    <div className={type === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'w-full space-y-4'}>
      {Array.from({ length: count }).map((_, idx) => renderSkeleton(idx))}
    </div>
  );
};

export default SkeletonLoader;
