import { useState } from 'react';

const LANGUAGES = [
  'Any', 'Python', 'JavaScript', 'TypeScript', 'Rust', 'Go',
  'C', 'C++', 'Java', 'Shell', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Zig',
];

const OS_OPTIONS = [
  { value: '',               label: 'Any OS' },
  { value: 'linux',         label: '🐧 Linux' },
  { value: 'windows',       label: '🪟 Windows' },
  { value: 'macos',         label: '🍎 macOS' },
  { value: 'cross-platform', label: '🌐 Cross-platform' },
];

const SORT_OPTIONS = [
  { value: 'stars',   label: '⭐ Most Stars' },
  { value: 'updated', label: '🕐 Recently Updated' },
  { value: 'forks',   label: '🍴 Most Forks' },
  { value: 'help-wanted-issues', label: '🙋 Help Wanted' },
];

const MIN_STARS_OPTIONS = [
  { value: 0,     label: 'Any' },
  { value: 10,    label: '10+' },
  { value: 100,   label: '100+' },
  { value: 500,   label: '500+' },
  { value: 1000,  label: '1K+' },
  { value: 5000,  label: '5K+' },
  { value: 10000, label: '10K+' },
];

const DEFAULT_FILTERS = {
  lang: '',
  min_stars: 0,
  sort: 'stars',
  active_only: false,
  os: '',
};

export default function SearchBar({ onSearch, onSurprise, loading, history = [], onRemoveHistory }) {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query, filters);
  };

  const handleHistoryClick = (q) => {
    setQuery(q);
    onSearch(q, filters);
  };

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const hasActiveFilters =
    filters.lang !== '' ||
    filters.min_stars > 0 ||
    filters.sort !== 'stars' ||
    filters.active_only ||
    filters.os !== '';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Main search row */}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GitHub repos… (e.g. 'rust cli', 'self-hosted dashboard')"
              className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? '🔄' : '🔍'} Search
          </button>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              showAdvanced || hasActiveFilters
                ? 'border-blue-500 text-blue-400 bg-blue-500 bg-opacity-10'
                : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
            }`}
          >
            <span>⚙️ Advanced Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                ON
              </span>
            )}
            <span className="text-xs">{showAdvanced ? '▲' : '▼'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSurprise(filters)}
            disabled={loading}
            className="btn-secondary px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✨ Surprise Me!
          </button>
        </div>

        {/* Advanced filters panel */}
        {showAdvanced && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Language */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
                  Language
                </label>
                <select
                  value={filters.lang}
                  onChange={(e) =>
                    setFilter('lang', e.target.value === 'Any' ? '' : e.target.value)
                  }
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l === 'Any' ? '' : l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Stars */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
                  Minimum Stars
                </label>
                <select
                  value={filters.min_stars}
                  onChange={(e) => setFilter('min_stars', Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {MIN_STARS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilter('sort', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* OS Compatibility */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
                  OS Compatibility
                </label>
                <select
                  value={filters.os}
                  onChange={(e) => setFilter('os', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {OS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Only toggle */}
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={filters.active_only}
                      onChange={(e) => setFilter('active_only', e.target.checked)}
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        filters.active_only ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    ></div>
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        filters.active_only ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    ></div>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Active Only</p>
                    <p className="text-xs text-gray-400">Pushed in last 6 months</p>
                  </div>
                </label>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  ✕ Reset filters
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Search history chips */}
      {history.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="text-xs text-gray-500 self-center">Recent:</span>
          {history.map((q) => (
            <div key={q} className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-xs text-gray-300 hover:border-gray-500 transition-colors group">
              <button
                type="button"
                onClick={() => handleHistoryClick(q)}
                className="hover:text-white transition-colors"
              >
                {q}
              </button>
              <button
                type="button"
                onClick={() => onRemoveHistory(q)}
                className="text-gray-600 hover:text-red-400 transition-colors ml-1 opacity-0 group-hover:opacity-100"
                aria-label={`Remove "${q}" from history`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
