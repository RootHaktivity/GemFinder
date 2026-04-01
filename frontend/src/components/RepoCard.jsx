export default function RepoCard({ repo }) {
  const getStarColor = (stars) => {
    if (stars > 10000) return 'text-yellow-400';
    if (stars > 1000) return 'text-amber-400';
    if (stars > 100) return 'text-orange-400';
    return 'text-gray-400';
  };

  const formatStars = (stars) => {
    if (stars > 1000000) return (stars / 1000000).toFixed(1) + 'M';
    if (stars > 1000) return (stars / 1000).toFixed(1) + 'K';
    return stars.toString();
  };

  return (
    <div className="card p-6 flex flex-col h-full hover:border-blue-500 transition-colors">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <h3 className="text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors truncate">
              {repo.name}
            </h3>
          </a>
          <div className={`flex items-center gap-1 whitespace-nowrap ${getStarColor(repo.stars)}`}>
            <span>⭐</span>
            <span className="font-semibold">{formatStars(repo.stars)}</span>
          </div>
        </div>
        {repo.description && (
          <p className="text-sm text-gray-300 line-clamp-2">
            {repo.description}
          </p>
        )}
      </div>

      {/* AI Summary - Prominent */}
      <div className="flex-1 mb-4">
        <div className="bg-gradient-to-br from-blue-900 bg-opacity-30 to-purple-900 bg-opacity-30 border border-blue-700 border-opacity-30 rounded p-4">
          <p className="text-sm text-blue-200 font-semibold mb-2">AI Summary</p>
          <p className="text-sm text-gray-200 line-clamp-4">
            {repo.ai_summary}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-2">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 btn-primary text-center py-2 text-sm"
        >
          View on GitHub →
        </a>
      </div>
    </div>
  );
}
