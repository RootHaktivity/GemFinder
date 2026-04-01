const API_BASE = import.meta.env.PROD
  ? 'https://github-search-git-main-sadisticpentester-5972s-projects.vercel.app/api'
  : '/api';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(query, filters, page, rank) {
  return `hgs_cache_${query}_${JSON.stringify(filters)}_p${page}_rank${rank}`;
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // sessionStorage full — silently ignore
  }
}

/**
 * Search repositories with optional advanced filters.
 * @param {string} query
 * @param {{ lang?: string, min_stars?: number, sort?: string, active_only?: boolean }} filters
 * @param {number} page
 * @param {boolean} rank - If true, sort results by relevance to query
 * @returns {Promise<{ results: Array, total_count: number }>}
 */
export async function searchRepos(query, filters = {}, page = 1, rank = false) {
  const cacheKey = getCacheKey(query, filters, page, rank);
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({ q: query, page });
  if (filters.lang) params.set('lang', filters.lang);
  if (filters.min_stars && Number(filters.min_stars) > 0)
    params.set('min_stars', filters.min_stars);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.active_only) params.set('active_only', 'true');
  if (filters.os) params.set('os', filters.os);
  if (filters.category) params.set('category', filters.category);
  if (rank) params.set('rank', 'true');

  const url = `${API_BASE}/search?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const error = await response.json();
      message = error.error || message;
    } catch (_) {}
    throw new Error(message);
  }

  const data = await response.json();
  // Normalise: API now returns { results, total_count }
  const normalised = {
    results: Array.isArray(data) ? data : (data.results || []),
    total_count: data.total_count || 0,
  };

  writeCache(cacheKey, normalised);
  return normalised;
}

export async function getRepoSummary(owner, repo) {
  const url = `${API_BASE}/search?repo=${encodeURIComponent(`${owner}/${repo}`)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    const message = error.error || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

/**
 * Fetch AI summary for a repo (separate lazy-loading endpoint with caching).
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<string>} AI-generated summary
 */
export async function fetchSummary(owner, repo) {
  const url = `${API_BASE}/summarize?repo=${encodeURIComponent(`${owner}/${repo}`)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch summary: ${response.status}`);
  }

  const data = await response.json();
  return data.ai_summary || null;
}

const surpriseQueries = [
  'rust-cli',
  'pentesting',
  'self-hosted',
  'dev-tools',
  'python-web-scraper',
  'machine-learning',
  'terminal-ui',
  'monitoring',
  'container-orchestration',
  'database-optimization',
  'homelab',
  'osint',
  'fuzzing',
  'reverse-engineering',
  'privacy-tools',
];

export function getRandomQuery() {
  return surpriseQueries[Math.floor(Math.random() * surpriseQueries.length)];
}
