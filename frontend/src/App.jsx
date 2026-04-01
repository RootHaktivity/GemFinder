import { useState, useEffect } from 'react';
import { searchRepos, getRepoSummary, getRandomQuery } from './services/githubSearch';
import RepoCard from './components/RepoCard';
import SearchBar from './components/SearchBar';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setCurrentQuery(query);
    setSearched(true);

    try {
      const data = await searchRepos(query);
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSurprise = async () => {
    const randomQuery = getRandomQuery();
    handleSearch(randomQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-900 bg-opacity-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Hidden Gem Search
              </h1>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-5xl sm:text-6xl font-bold mb-4">
              Find <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Hidden GitHub Gems</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover high-quality repositories with AI-powered summaries. No fluff, just gems.
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} onSurprise={handleSurprise} loading={loading} />
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-200 font-semibold">❌ Error</p>
            <p className="text-red-100 text-sm mt-1">{error}</p>
            {error.includes('rate limit') && (
              <p className="text-red-100 text-sm mt-2">
                💡 Tip: Try again in a few minutes or set a GITHUB_TOKEN in your Vercel environment.
              </p>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !searched && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-400 text-lg">
              Start searching to discover hidden GitHub gems!
            </p>
          </div>
        )}

        {/* No Results */}
        {!loading && searched && results.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤔</div>
            <p className="text-gray-400 text-lg">
              No repositories found for "{currentQuery}". Try a different search!
            </p>
          </div>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-gray-400">
                Found <span className="text-blue-400 font-semibold">{results.length}</span> gem{results.length !== 1 ? 's' : ''} for "<span className="text-purple-400 font-semibold">{currentQuery}</span>"
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((repo, idx) => (
                <RepoCard key={idx} repo={repo} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-900 bg-opacity-50 backdrop-blur mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-400 text-sm text-center">
            Built with ❤️ using React, Vite, and Hugging Face AI. Zero-cost hosting on Vercel + GitHub Pages.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
