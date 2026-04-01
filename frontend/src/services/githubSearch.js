const API_BASE = import.meta.env.PROD
  ? 'https://github-search-git-main-sadisticpentester-5972s-projects.vercel.app/api'
  : '/api';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(query, filters, page) {
  return `hgs_cache_${query}_${JSON.stringify(filters)}_p${page}`;
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
 * @returns {Promise<{ results: Array, total_count: number }>}
 */
export async function searchRepos(query, filters = {}, page = 1) {
  const cacheKey = getCacheKey(query, filters, page);
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({ q: query, page });
  if (filters.lang) params.set('lang', filters.lang);
  if (filters.min_stars && Number(filters.min_stars) > 0)
    params.set('min_stars', filters.min_stars);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.active_only) params.set('active_only', 'true');

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
