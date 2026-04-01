const GITHUB_API_BASE = 'https://api.github.com';
const HF_API_URL =
  'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';

function buildGitHubHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hidden-gem-search-engine',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHubRepos(query) {
  const url = `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(
    query
  )}&sort=stars&order=desc&per_page=5`;

  const res = await fetch(url, { headers: buildGitHubHeaders() });

  if (res.status === 403) {
    const reset = res.headers.get('x-ratelimit-reset');
    const resetAt = reset ? new Date(Number(reset) * 1000).toISOString() : null;
    throw new Error(
      `GitHub API rate limit exceeded.${resetAt ? ` Try again after ${resetAt}.` : ''}`
    );
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub search failed (${res.status}): ${txt}`);
  }

  return res.json();
}

async function fetchSingleRepo(owner, repo) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
  const res = await fetch(url, { headers: buildGitHubHeaders() });

  if (res.status === 404) {
    throw new Error(`Repository not found: ${owner}/${repo}`);
  }

  if (res.status === 403) {
    const reset = res.headers.get('x-ratelimit-reset');
    const resetAt = reset ? new Date(Number(reset) * 1000).toISOString() : null;
    throw new Error(
      `GitHub API rate limit exceeded.${resetAt ? ` Try again after ${resetAt}.` : ''}`
    );
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub repo fetch failed (${res.status}): ${txt}`);
  }

  return res.json();
}

async function fetchReadmeContent(owner, repo) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`;
  const res = await fetch(url, { headers: buildGitHubHeaders() });

  if (!res.ok) return '';

  const data = await res.json();

  if (!data?.content) return '';

  try {
    const normalized = data.content.replace(/\n/g, '');
    const decoded = Buffer.from(normalized, 'base64').toString('utf-8');
    return decoded.slice(0, 1000);
  } catch {
    return '';
  }
}

async function summarizeWithHF(text) {
  if (!process.env.HF_TOKEN) {
    return 'No AI summary available (missing HF_TOKEN).';
  }

  if (!text || text.trim().length < 50) {
    return 'README is too short for a meaningful AI summary.';
  }

  // Try the new inference API endpoint
  const prompt = `Summarize in 1-2 sentences: ${text.slice(0, 500)}`;
  
  try {
    const res = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: text.slice(0, 500),
          parameters: {
            max_length: 100,
            min_length: 30,
          },
        }),
      }
    );

    if (res.status === 503) {
      // Model is loading
      return 'AI model initializing (will be ready in 1-2 minutes on first use)...';
    }

    if (!res.ok) {
      // Fallback for unavailable models
      const simpleSummary = text
        .split('. ')
        .slice(0, 2)
        .join('. ')
        .slice(0, 100);
      return simpleSummary || 'README summary unavailable.';
    }

    const data = await res.json();

    if (Array.isArray(data) && data[0]?.summary_text) {
      return data[0].summary_text;
    }

    if (data?.summary_text) {
      return data.summary_text;
    }

    // Fallback to README excerpt
    return (
      text.split('. ').slice(0, 2).join('. ').slice(0, 100) ||
      'README summary unavailable.'
    );
  } catch (error) {
    // Network error - return README excerpt as fallback
    return (
      text.split('. ').slice(0, 2).join('. ').slice(0, 100) ||
      'README summary unavailable.'
    );
  }
}

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const q = (req.query?.q || '').trim();
  const repoParam = (req.query?.repo || '').trim();

  if (!q && !repoParam) {
    return res.status(400).json({
      error: 'Missing parameters. Use ?q=your-topic or ?repo=owner/repo',
    });
  }

  try {
    let repos = [];

    // Mode 1: Single repo lookup (repo=owner/repo)
    if (repoParam) {
      const [owner, repo] = repoParam.split('/');
      if (!owner || !repo) {
        return res.status(400).json({
          error: 'Invalid repo format. Use ?repo=owner/repo',
        });
      }

      const repoData = await fetchSingleRepo(owner, repo);
      repos = [repoData];
    }
    // Mode 2: Search for repos (q=search-terms)
    else {
      const githubData = await fetchGitHubRepos(q);
      repos = githubData.items || [];
    }

    // Enrich each repo with README and AI summary
    const enriched = await Promise.all(
      repos.slice(0, 5).map(async (repo) => {
        const readme = await fetchReadmeContent(repo.owner.login, repo.name);
        const ai_summary = readme
          ? await summarizeWithHF(readme)
          : 'README not found';

        return {
          name: repo.name,
          html_url: repo.html_url,
          description: repo.description,
          stars: repo.stargazers_count,
          ai_summary,
        };
      })
    );

    return res.status(200).json(enriched);
  } catch (error) {
    const msg = error?.message || 'Unknown server error.';
    const status = msg.toLowerCase().includes('rate limit')
      ? 429
      : msg.toLowerCase().includes('not found')
      ? 404
      : 500;

    return res.status(status).json({
      error: msg,
    });
  }
}
