import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.PROD
  ? 'https://github-search-git-main-sadisticpentester-5972s-projects.vercel.app/api'
  : '/api';

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
  category: '',
};

export default function SearchBar({ onSearch, onSurprise, loading, history = [], onRemoveHistory }) {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Category state
  const [builtinCategories, setBuiltinCategories] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatValue, setNewCatValue] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catError, setCatError] = useState('');
  const [catSuccess, setCatSuccess] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    setCatLoading(true);
    fetch(`${API_BASE}/categories`)
      .then((r) => r.json())
      .then((data) => {
        setBuiltinCategories(data.builtin || []);
        setCustomCategories(data.custom || []);
      })
      .catch(() => {
        // silently fail — builtin list stays empty, user can still search
      })
      .finally(() => setCatLoading(false));
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatValue.trim()) return;
    setCatSubmitting(true);
    setCatError('');
    setCatSuccess('');

    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCatValue.trim(), label: newCatLabel.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCatError(data.error || 'Failed to add category.');
      } else {
        setCustomCategories(data.custom || []);
        setCatSuccess(`"${newCatValue.trim()}" added! It's now visible to all users.`);
        setNewCatValue('');
        setNewCatLabel('');
        setTimeout(() => {
          setShowAddCat(false);
          setCatSuccess('');
        }, 2500);
      }
    } catch {
      setCatError('Network error. Please try again.');
    } finally {
      setCatSubmitting(false);
    }
  };

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
    filters.os !== '' ||
    filters.category !== '';

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
              className="w-full px-6 py-4 bg-slate-900 border border-slate-700/50 rounded-lg text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg shadow-cyan-500/30"
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
                ? 'border-cyan-500/70 text-cyan-400 bg-cyan-500/10'
                : 'border-slate-600/50 text-slate-400 hover:border-slate-500/70 hover:text-cyan-100'
            }`}
          >
            <span>⚙️ Advanced Filters</span>
            {hasActiveFilters && (
              <span className="bg-cyan-500/80 text-slate-900 text-xs rounded-full px-1.5 py-0.5 leading-none font-bold">
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
          <div className="bg-slate-950/50 border border-slate-700/50 rounded-xl p-5 mb-4 space-y-4 backdrop-blur-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Language */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                  Language
                </label>
                <select
                  value={filters.lang}
                  onChange={(e) =>
                    setFilter('lang', e.target.value === 'Any' ? '' : e.target.value)
                  }
                  className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-2 text-cyan-100 text-sm focus:outline-none focus:border-cyan-500"
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
                <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                  Minimum Stars
                </label>
                <select
                  value={filters.min_stars}
                  onChange={(e) => setFilter('min_stars', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-2 text-cyan-100 text-sm focus:outline-none focus:border-cyan-500"
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
                <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilter('sort', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-2 text-cyan-100 text-sm focus:outline-none focus:border-cyan-500"
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
                <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                  OS Compatibility
                </label>
                <select
                  value={filters.os}
                  onChange={(e) => setFilter('os', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-2 text-cyan-100 text-sm focus:outline-none focus:border-cyan-500"
                >
                  {OS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs text-slate-400 font-medium uppercase tracking-wide">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowAddCat((v) => !v); setCatError(''); setCatSuccess(''); }}
                    className="text-xs text-cyan-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    {showAddCat ? '✕ Cancel' : '➕ Add Custom'}
                  </button>
                </div>

                <select
                  value={filters.category}
                  onChange={(e) => setFilter('category', e.target.value)}
                  disabled={catLoading}
                  className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-2 text-cyan-100 text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                >
                  <option value="">Any Category</option>
                  {builtinCategories.length > 0 && (
                    <optgroup label="── Built-in ──">
                      {builtinCategories.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </optgroup>
                  )}
                  {customCategories.length > 0 && (
                    <optgroup label="── Community ──">
                      {customCategories.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </optgroup>
                  )}
                </select>

                {/* Add custom category form */}
                {showAddCat && (
                  <form
                    onSubmit={handleAddCategory}
                    className="mt-3 p-3 bg-slate-900/70 border border-slate-700/50 rounded-lg space-y-2 backdrop-blur-sm"
                  >
                    <p className="text-xs text-slate-400">
                      Add a topic-based category. It will be visible to <span className="text-cyan-400 font-medium">all users</span> once saved.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCatValue}
                        onChange={(e) => setNewCatValue(e.target.value)}
                        placeholder="topic-slug (e.g. blockchain)"
                        maxLength={30}
                        className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-cyan-100 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                        disabled={catSubmitting}
                      />
                      <input
                        type="text"
                        value={newCatLabel}
                        onChange={(e) => setNewCatLabel(e.target.value)}
                        placeholder="Display name (optional)"
                        maxLength={40}
                        className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-cyan-100 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                        disabled={catSubmitting}
                      />
                      <button
                        type="submit"
                        disabled={catSubmitting || !newCatValue.trim()}
                        className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-sm rounded-lg transition-colors whitespace-nowrap font-bold shadow-lg shadow-cyan-500/30"
                      >
                        {catSubmitting ? '⏳' : '✓ Save'}
                      </button>
                    </div>
                    {catError && <p className="text-xs text-red-400">{catError}</p>}
                    {catSuccess && <p className="text-xs text-green-400">✅ {catSuccess}</p>}
                  </form>
                )}
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
                        filters.active_only ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    ></div>
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        filters.active_only ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    ></div>
                  </div>
                  <div>
                    <p className="text-sm text-cyan-100 font-medium">Active Only</p>
                    <p className="text-xs text-slate-400">Pushed in last 6 months</p>
                  </div>
                </label>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-slate-400 hover:text-red-400 transition-colors"
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
          <span className="text-xs text-slate-500 self-center">Recent:</span>
          {history.map((q) => (
            <div key={q} className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-full px-3 py-1 text-xs text-cyan-200 hover:border-cyan-500/50 transition-colors group">
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
                className="text-slate-600 hover:text-red-400 transition-colors ml-1 opacity-0 group-hover:opacity-100"
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
