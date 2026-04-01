import { useState } from 'react';

export default function SearchBar({ onSearch, onSurprise, loading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GitHub repos... (e.g., 'rust cli', 'python web framework')"
            className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '🔄' : '🔍'} Search
        </button>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onSurprise}
          disabled={loading}
          className="btn-secondary px-6 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✨ Surprise Me!
        </button>
      </div>
    </form>
  );
}
