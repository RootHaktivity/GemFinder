import { useState, useEffect, useCallback } from 'react';
import { searchRepos, getRandomQuery } from './services/githubSearch';
import { useBookmarks } from './hooks/useBookmarks';
import { useSearchHistory } from './hooks/useSearchHistory';
import RepoCard from './components/RepoCard';
import SearchBar from './components/SearchBar';
import SkeletonCard from './components/SkeletonCard';

const SKELETON_COUNT = 6;

function App() {
  const [results, setResults]           = useState([]);
  const [totalCount, setTotalCount]     = useState(0);
  const [loading, setLoading]           = useState(false);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [error, setError]               = useState(null);
  const [searched, setSearched]         = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState({});
  const [page, setPage]                 = useState(1);
  const [activeTab, setActiveTab]       = useState('search'); // 'search' | 'saved'

  const { bookmarks, isBookmarked, toggleBookmark, clearBookmarks } = useBookmarks();
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // ── URL sync: read ?q= on mount ──────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      handleSearch(q, {}, 1, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Core search function ─────────────────────────────────────────────────
  const handleSearch = useCallback(
    async (query, filters = {}, pageNum = 1, pushHistory = true) => {
      if (!query?.trim()) return;

      const isFirstPage = pageNum === 1;
      if (isFirstPage) {
        setLoading(true);
        setResults([]);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      setError(null);
      setCurrentQuery(query);
      setCurrentFilters(filters);
      setSearched(true);

      // Sync URL
      const url = new URL(window.location);
      url.searchParams.set('q', query);
      if (filters.lang) url.searchParams.set('lang', filters.lang);
      else url.searchParams.delete('lang');
      if (filters.min_stars) url.searchParams.set('min_stars', filters.min_stars);
      else url.searchParams.delete('min_stars');
      if (filters.sort && filters.sort !== 'stars') url.searchParams.set('sort', filters.sort);
      else url.searchParams.delete('sort');
      if (filters.active_only) url.searchParams.set('active_only', 'true');
      else url.searchParams.delete('active_only');
      window.history.pushState({}, '', url);

      try {
        const data = await searchRepos(query, filters, pageNum);
        const newResults = data.results || [];

        if (isFirstPage) {
          setResults(newResults);
        } else {
          setResults((prev) => [...prev, ...newResults]);
        }

        setTotalCount(data.total_count || 0);
        setPage(pageNum);

        if (pushHistory) addToHistory(query);
      } catch (err) {
        setError(err.message);
        if (isFirstPage) setResults([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [addToHistory]
  );

  const handleSurprise = (filters = {}) => {
    const randomQuery = getRandomQuery();
    handleSearch(randomQuery, filters);
  };

  const handleLoadMore = () => {
    handleSearch(currentQuery, currentFilters, page + 1, false);
  };

  const hasMore = results.length < Math.min(totalCount, 90); // GitHub caps at 1000, we cap display at 90

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">

      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-900 bg-opacity-50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Hidden Gem Search
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Tabs */}
              <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('search')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'search'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🔍 Search
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'saved'
                      ? 'bg-pink-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ❤️ Saved
                  {bookmarks.length > 0 && (
                    <span className="bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                      {bookmarks.length}
                    </span>
                  )}
                </button>
              </div>

              <a
                href="https://github.com/RootHaktivity/github-search"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ── SEARCH TAB ── */}
      {activeTab === 'search' && (
        <>
          {/* Hero */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-10">
              <h2 className="text-5xl sm:text-6xl font-bold mb-4">
                Find{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Hidden GitHub Gems
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                AI-powered summaries · Advanced filters · Zero fluff.
              </p>
            </div>

            <SearchBar
              onSearch={handleSearch}
              onSurprise={handleSurprise}
              loading={loading}
              history={history}
              onRemoveHistory={removeFromHistory}
            />
          </div>

          {/* Results */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

            {/* Skeleton loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-4 mb-6">
                <p className="text-red-200 font-semibold">❌ Error</p>
                <p className="text-red-100 text-sm mt-1">{error}</p>
                {error.toLowerCase().includes('rate limit') && (
                  <p className="text-red-100 text-sm mt-2">
                    💡 Try again in a few minutes, or add a GITHUB_TOKEN to your Vercel environment.
                  </p>
                )}
              </div>
            )}

            {/* Empty state */}
            {!loading && !searched && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-400 text-lg">
                  Start searching to discover hidden GitHub gems!
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Use the Advanced Filters to narrow by language, stars, or activity.
                </p>
              </div>
            )}

            {/* No results */}
            {!loading && searched && results.length === 0 && !error && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🤔</div>
                <p className="text-gray-400 text-lg">
                  No repositories found for "{currentQuery}".
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Try relaxing your filters or using a different search term.
                </p>
              </div>
            )}

            {/* Results grid */}
            {results.length > 0 && !loading && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-400 text-sm">
                    Showing{' '}
                    <span className="text-blue-400 font-semibold">{results.length}</span>
                    {totalCount > 0 && (
                      <> of <span className="text-gray-300 font-semibold">{totalCount.toLocaleString()}</span></>
                    )}{' '}
                    results for "
                    <span className="text-purple-400 font-semibold">{currentQuery}</span>"
                  </p>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                    >
                      Clear history
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((repo, idx) => (
                    <RepoCard
                      key={`${repo.html_url}-${idx}`}
                      repo={repo}
                      isBookmarked={isBookmarked(repo.html_url)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="btn-secondary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <span className="animate-spin">🔄</span> Loading…
                        </>
                      ) : (
                        <>⬇️ Load More Results</>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* ── SAVED TAB ── */}
      {activeTab === 'saved' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">❤️ Saved Repos</h2>
              <p className="text-gray-400 text-sm mt-1">
                {bookmarks.length} repo{bookmarks.length !== 1 ? 's' : ''} bookmarked
              </p>
            </div>
            {bookmarks.length > 0 && (
              <button
                onClick={clearBookmarks}
                className="text-sm text-gray-500 hover:text-red-400 transition-colors border border-gray-700 hover:border-red-500 rounded-lg px-3 py-1.5"
              >
                🗑️ Clear All
              </button>
            )}
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🤍</div>
              <p className="text-gray-400 text-lg">No saved repos yet.</p>
              <p className="text-gray-500 text-sm mt-2">
                Click the 🤍 button on any result card to bookmark it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((repo, idx) => (
                <RepoCard
                  key={`saved-${repo.html_url}-${idx}`}
                  repo={repo}
                  isBookmarked={true}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-900 bg-opacity-50 backdrop-blur mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-gray-500 text-sm text-center">
            Built with ❤️ · React + Vite · Hugging Face AI · Vercel + GitHub Pages · Zero cost.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
