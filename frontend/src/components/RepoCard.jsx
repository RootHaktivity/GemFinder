import { useState } from 'react';

// OS → badge mapping (detected from topics)
const OS_BADGES = [
  { topic: 'linux',          icon: '🐧', label: 'Linux' },
  { topic: 'windows',        icon: '🪟', label: 'Windows' },
  { topic: 'macos',          icon: '🍎', label: 'macOS' },
  { topic: 'cross-platform', icon: '🌐', label: 'Cross-platform' },
  { topic: 'multiplatform',  icon: '🌐', label: 'Multi-platform' },
  { topic: 'unix',           icon: '🖥️', label: 'Unix' },
];

function detectOS(topics = []) {
  return OS_BADGES.filter((b) => topics.includes(b.topic));
}

// Language → color dot mapping
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python:     '#3572A5',
  Rust:       '#dea584',
  Go:         '#00ADD8',
  Java:       '#b07219',
  'C++':      '#f34b7d',
  C:          '#555555',
  Shell:      '#89e051',
  Ruby:       '#701516',
  PHP:        '#4F5D95',
  Swift:      '#F05138',
  Kotlin:     '#A97BFF',
  Zig:        '#ec915c',
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || '#8b949e';
}

function formatStars(stars) {
  if (stars >= 1_000_000) return (stars / 1_000_000).toFixed(1) + 'M';
  if (stars >= 1_000) return (stars / 1_000).toFixed(1) + 'K';
  return stars?.toString() ?? '0';
}

function formatNumber(n) {
  if (!n) return '0';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

function relativeDate(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/**
 * Hidden Gem Score (0–100):
 * Rewards repos that gain stars quickly relative to their age,
 * and penalises repos that are just popular but old.
 */
function calcGemScore(stars, createdAt) {
  if (!stars || !createdAt) return 0;
  const ageMonths = Math.max(
    1,
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const starsPerMonth = stars / ageMonths;
  const score = Math.min(100, Math.round(Math.log10(starsPerMonth + 1) * 40));
  return score;
}

function gemLabel(score) {
  if (score >= 80) return { label: '💎 Elite Gem', color: 'text-purple-300 border-purple-500 bg-purple-500' };
  if (score >= 60) return { label: '✨ Hidden Gem', color: 'text-blue-300 border-blue-500 bg-blue-500' };
  if (score >= 40) return { label: '🌟 Rising Star', color: 'text-yellow-300 border-yellow-500 bg-yellow-500' };
  return { label: '🔍 Niche Pick', color: 'text-gray-300 border-gray-500 bg-gray-500' };
}

function isTrending(pushedAt) {
  if (!pushedAt) return false;
  const diff = Date.now() - new Date(pushedAt).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000; // 7 days
}

export default function RepoCard({ repo, isBookmarked, onToggleBookmark }) {
  const [copied, setCopied] = useState(false);

  const gemScore = calcGemScore(repo.stars, repo.created_at);
  const gem = gemLabel(gemScore);
  const trending = isTrending(repo.pushed_at);
  const cloneUrl = `git clone ${repo.html_url}.git`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cloneUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS contexts
      const el = document.createElement('textarea');
      el.value = cloneUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card p-6 flex flex-col h-full hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all group">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0"
          >
            <h3 className="text-lg font-bold text-emerald-400 hover:text-emerald-300 transition-colors truncate">
              {repo.name}
            </h3>
          </a>
          <div className="flex items-center gap-1 whitespace-nowrap text-yellow-400 shrink-0">
            <span>⭐</span>
            <span className="font-semibold text-sm">{formatStars(repo.stars)}</span>
          </div>
        </div>

        {repo.description && (
          <p className="text-sm text-cyan-100 line-clamp-2 mb-2">
            {repo.description}
          </p>
        )}

        {/* Meta badges row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Language */}
          {repo.language && (
            <span className="flex items-center gap-1 text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                style={{ backgroundColor: getLangColor(repo.language) }}
              />
              {repo.language}
            </span>
          )}

          {/* Forks */}
          {repo.forks > 0 && (
            <span className="text-slate-400 flex items-center gap-1">
              🍴 {formatNumber(repo.forks)}
            </span>
          )}

          {/* Last pushed */}
          {repo.pushed_at && (
            <span className="text-slate-500">
              🕐 {relativeDate(repo.pushed_at)}
            </span>
          )}

          {/* License */}
          {repo.license && repo.license !== 'NOASSERTION' && (
            <span className="text-slate-500 border border-slate-700/50 rounded px-1.5 py-0.5">
              {repo.license}
            </span>
          )}

          {/* Trending badge */}
          {trending && (
            <span className="text-orange-400 font-semibold animate-pulse">
              🔥 Trending
            </span>
          )}
        </div>

        {/* OS compatibility badges */}
        {(() => {
          const osBadges = detectOS(repo.topics);
          return osBadges.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {osBadges.map((b) => (
                <span
                  key={b.topic}
                  className="inline-flex items-center gap-1 text-xs bg-slate-800/50 text-cyan-300 border border-slate-700/50 rounded-full px-2 py-0.5"
                  title={`Compatible with ${b.label}`}
                >
                  {b.icon} {b.label}
                </span>
              ))}
            </div>
          ) : null;
        })()}
      </div>

      {/* Gem Score badge */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border bg-opacity-10 ${gem.color} bg-opacity-10`}
        >
          {gem.label}
          <span className="opacity-60 font-normal">({gemScore}/100)</span>
        </span>
      </div>

      {/* AI Summary */}
      <div className="flex-1 mb-3">
        <div className="bg-gradient-to-br from-cyan-900/30 to-emerald-900/30 border border-cyan-700/30 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-xs text-cyan-400 font-semibold mb-2 uppercase tracking-wide">
            🤖 AI Summary
          </p>
          <p className="text-sm text-cyan-100 line-clamp-4 leading-relaxed">
            {repo.ai_summary}
          </p>
        </div>
      </div>

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {repo.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 rounded-full px-2 py-0.5"
            >
              #{topic}
            </span>
          ))}
          {repo.topics.length > 4 && (
            <span className="text-xs text-slate-500">+{repo.topics.length - 4} more</span>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex gap-2">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 btn-primary text-center py-2 text-sm"
        >
          View on GitHub →
        </a>

        {/* Copy clone URL */}
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? 'Copied!' : `Copy: ${cloneUrl}`}
          className={`px-3 py-2 rounded-lg border text-sm transition-all ${
            copied
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/20'
              : 'border-slate-700/50 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400'
          }`}
        >
          {copied ? '✓' : '📋'}
        </button>

        {/* Bookmark */}
        <button
          type="button"
          onClick={() => onToggleBookmark(repo)}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this repo'}
          className={`px-3 py-2 rounded-lg border text-sm transition-all ${
            isBookmarked
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/20'
              : 'border-slate-700/50 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400'
          }`}
        >
          {isBookmarked ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  );
}
