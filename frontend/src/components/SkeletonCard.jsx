export default function SkeletonCard() {
  return (
    <div className="card p-6 flex flex-col h-full animate-pulse">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="h-5 bg-gray-700 rounded w-2/3"></div>
          <div className="h-5 bg-gray-700 rounded w-12"></div>
        </div>
        <div className="h-3 bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-700 rounded w-4/5"></div>
      </div>

      {/* Badges row */}
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-gray-700 rounded-full w-16"></div>
        <div className="h-5 bg-gray-700 rounded-full w-12"></div>
        <div className="h-5 bg-gray-700 rounded-full w-20"></div>
      </div>

      {/* AI Summary box */}
      <div className="flex-1 mb-4">
        <div className="bg-gray-800 border border-gray-700 rounded p-4">
          <div className="h-3 bg-gray-700 rounded w-20 mb-3"></div>
          <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>

      {/* Topics */}
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-gray-700 rounded-full w-14"></div>
        <div className="h-5 bg-gray-700 rounded-full w-18"></div>
        <div className="h-5 bg-gray-700 rounded-full w-12"></div>
      </div>

      {/* Footer buttons */}
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-gray-700 rounded-lg"></div>
        <div className="h-9 w-9 bg-gray-700 rounded-lg"></div>
        <div className="h-9 w-9 bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}
