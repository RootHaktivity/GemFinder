import { useState, useEffect, useCallback } from 'react';
import { searchRepos, getRandomQuery } from './services/githubSearch';
import { useBookmarks } from './hooks/useBookmarks';
import { useSearchHistory } from './hooks/useSearchHistory';
import RepoCard from './components/RepoCard';
import SearchBar from './components/SearchBar';
import SkeletonCard from './components/SkeletonCard';
import './theme.css';

const SKELETON_COUNT = 6;

function App() {
  const [results, setResults]           = useState([]);
  const [totalCount, setTotalCount]     = useState(0);
  const [loading, setLoading]           = useState(false);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [error, setError]               = useState(null);
  const [searched, setSearched]         = useState(false);
  const [rankingEnabled, setRankingEnabled] = useState(false);
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
      if (filters.os) url.searchParams.set('os', filters.os);
      else url.searchParams.delete('os');
      if (filters.category) url.searchParams.set('category', filters.category);
      else url.searchParams.delete('category');
      window.history.pushState({}, '', url);

      try {
        const data = await searchRepos(query, filters, pageNum, rankingEnabled);
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
    <>
      {/* Ambient Background */}
      <div className="ambient-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Grid Overlay */}
      <div className="grid-overlay"></div>

      <div className="app-container">

      {/* Header */}
      <header className="header text-center mb-8">
        <h1 className="brand-name">GemFinder</h1>
        <p className="tagline">Relevance-Ranked Repository Search with AI-Powered Summaries</p>
      </header>

      {/* Tab Navigation */}
      <div className="tab-buttons">
        <button 
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Search Repos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          ❤️ Bookmarks {bookmarks.length > 0 && `(${bookmarks.length})`}
        </button>
      </div>

      {/* ── SEARCH TAB ── */}
      {activeTab === 'search' && (
        <div className="results-container">
          {/* Search Section */}
          <div className="search-section">
            <div className="search-container">
              <SearchBar
                onSearch={handleSearch}
                onSurprise={handleSurprise}
                loading={loading}
                history={history}
                onRemoveHistory={removeFromHistory}
                rankingEnabled={rankingEnabled}
                onRankingToggle={setRankingEnabled}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="results-grid">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-message">
              <strong>❌ Error:</strong> {error}
              {error.toLowerCase().includes('rate limit') && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                  💡 Try again later, or add a GITHUB_TOKEN to Vercel.
                </p>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !searched && (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3>Start Searching for Hidden Gems</h3>
              <p>Use advanced filters to find repos by language, stars, or activity.</p>
            </div>
          )}

          {/* No Results */}
          {!loading && searched && results.length === 0 && !error && (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</div>
              <h3>No Repositories Found</h3>
              <p>Try relaxing your filters or using a different search term.</p>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && !loading && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                Found <strong style={{ color: 'var(--primary)' }}>{results.length}</strong> of <strong>{totalCount.toLocaleString()}</strong> repos for "<strong style={{ color: 'var(--secondary)' }}>{currentQuery}</strong>"
                {rankingEnabled && <span style={{ marginLeft: '1rem', color: 'var(--secondary)' }}>📊 Ranked</span>}
              </div>
              <div className="results-grid">
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
              <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="btn-primary"
                    style={{ opacity: loadingMore ? 0.6 : 1 }}
                  >
                    {loadingMore ? '⏳ Loading...' : '⬇️ Load More'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── SAVED TAB ── */}
      {activeTab === 'saved' && (
        <div className="results-container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
              ❤️ Saved Repositories
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              {bookmarks.length} repo{bookmarks.length !== 1 ? 's' : ''} bookmarked
            </p>
            {bookmarks.length > 0 && (
              <button
                onClick={clearBookmarks}
                className="btn-secondary"
                style={{ marginTop: '1rem' }}
              >
                🗑️ Clear All
              </button>
            )}
          </div>

          {bookmarks.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤍</div>
              <h3>No Saved Repos Yet</h3>
              <p>Click the heart icon on search results to bookmark them here.</p>
            </div>
          ) : (
            <div className="results-grid">
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
    </div>
    </>
  );
}

export default App;
