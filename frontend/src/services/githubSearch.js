const API_BASE = import.meta.env.PROD
  ? 'https://github-search-git-main-sadisticpentester-5972s-projects.vercel.app/api'
  : '/api';

export async function searchRepos(query) {
  const url = `${API_BASE}/search?q=${encodeURIComponent(query)}`;
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
  // API returns { query, count, results: [...] } — unwrap the array
  return Array.isArray(data) ? data : (data.results || []);
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
];

export function getRandomQuery() {
  return surpriseQueries[Math.floor(Math.random() * surpriseQueries.length)];
}
