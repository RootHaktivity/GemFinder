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
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {/* Main search row */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GitHub repos… (e.g. 'rust cli')"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '1rem',
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.3s ease',
                disabled: loading ? 0.5 : 1
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(0, 240, 255, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              minWidth: '120px',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '🔄' : '🔍'} Search
          </button>
        </div>

        {/* Button Container - Desktop: Surprise Me | Advanced | Clear  |  Mobile: Surprise Me full width, Advanced and Clear below */}
        <div className="button-container" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {/* Surprise Me button row */}
          <div className="surprise-me-wrapper" style={{ flex: 1, minWidth: '200px' }}>
            <button
              type="button"
              onClick={() => onSurprise(filters)}
              disabled={loading}
              className="btn-secondary surprise-me-btn"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              ✨ Surprise Me!
            </button>
          </div>

          {/* Advanced & Clear buttons row - side by side */}
          <div className="action-buttons-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: showAdvanced || hasActiveFilters ? '1px solid rgba(0, 240, 255, 0.7)' : '1px solid rgba(100, 120, 150, 0.5)',
                background: showAdvanced || hasActiveFilters ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                color: showAdvanced || hasActiveFilters ? 'var(--primary)' : 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span>⚙️ Advanced</span>
              {hasActiveFilters && (
                <span style={{
                  background: 'rgba(0, 240, 255, 0.8)',
                  color: 'var(--dark-1)',
                  fontSize: '0.75rem',
                  borderRadius: '50%',
                  padding: '0 0.4rem',
                  fontWeight: 'bold'
                }}>
                  ON
                </span>
              )}
            </button>

            {/* Reset Search button - acts as home button */}
            <button
              type="button"
              onClick={() => {
                // Clear search history from localStorage
                localStorage.removeItem('searchHistory');
                // Navigate to clean home page
                window.location.href = window.location.pathname;
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(100, 150, 200, 0.5)',
                background: 'transparent',
                color: 'rgba(100, 200, 255, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span>🏠 Reset</span>
            </button>
          </div>
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
