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

function stripMarkdown(text) {
  return text
    .replace(/!\[[\s\S]*?\]\(.*?\)/g, '')          // remove images
    .replace(/\[!\[[\s\S]*?\]\(.*?\)\]\(.*?\)/g, '') // badge links
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')          // links → text (incl. empty [])
    .replace(/#{1,6}\s*/g, '')                       // ATX headings (#, ##, etc.)
    .replace(/^[=\-]{3,}\s*$/gm, '')                 // setext heading underlines (=== or ---)
    .replace(/`{3}[\s\S]*?`{3}/g, '')               // fenced code blocks
    .replace(/`[^`\n]*`/g, '')                       // inline code
    .replace(/^>\s*/gm, '')                          // blockquotes
    .replace(/[-*_]{3,}/g, '')                       // horizontal rules
    .replace(/[*_~]{1,2}([^*_~\n]+)[*_~]{1,2}/g, '$1') // bold/italic
    .replace(/<[^>]*>/g, '')                         // complete HTML tags
    .replace(/<[^\s<>]*/g, '')                       // partial/malformed HTML (no closing >)
    .replace(/\s*\w+="[^"]*"?/g, '')                 // orphaned HTML attributes (double quotes, possibly unclosed)
    .replace(/\s*\w+='[^']*'?/g, '')                 // orphaned HTML attributes (single quotes, possibly unclosed)
    .replace(/https?:\/\/\S+/g, '')                  // bare URLs
    .replace(/\n[ \t]*\n[ \t]*\n/g, '\n\n')          // lines with only whitespace between newlines
    .replace(/\n{3,}/g, '\n\n')                      // excess newlines
    .replace(/[ \t]{2,}/g, ' ')                      // excess spaces/tabs
    .trim();
}

async function summarizeWithHF(text) {
  if (!process.env.HF_TOKEN) {
    return 'No AI summary available (missing HF_TOKEN).';
  }

  const cleaned = stripMarkdown(text);

  if (!cleaned || cleaned.length < 50) {
    return 'README is too short for a meaningful AI summary.';
  }

  try {
    const res = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: cleaned.slice(0, 800),
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
      // Fallback: use cleaned README excerpt (no raw markdown/HTML)
      return (
        cleaned.split('. ').slice(0, 2).join('. ').slice(0, 150).trim() ||
        'README summary unavailable.'
      );
    }

    const data = await res.json();

    let summary = null;
    if (Array.isArray(data) && data[0]?.summary_text) {
      summary = data[0].summary_text;
    } else if (data?.summary_text) {
      summary = data.summary_text;
    }

    if (summary) {
      // Strip any residual markdown/HTML the model may have echoed back
      const finalSummary = stripMarkdown(summary).trim();
      if (finalSummary.length > 20) return finalSummary;
    }

    // Fallback: first 2 sentences of cleaned README
    return cleaned.split('. ').slice(0, 2).join('. ').slice(0, 150).trim() ||
      'README summary unavailable.';
  } catch (error) {
    // Network error - return cleaned README excerpt as fallback
    return cleaned.split('. ').slice(0, 2).join('. ').slice(0, 150).trim() ||
      'README summary unavailable.';
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
        const cleanedReadme = readme ? stripMarkdown(readme) : '';

        let ai_summary;
        if (cleanedReadme.length >= 50) {
          // Enough clean text — send to HF for summarization
          ai_summary = await summarizeWithHF(readme);
        } else if (repo.description) {
          // README is missing or mostly images/HTML — fall back to description
          ai_summary = repo.description;
        } else {
          ai_summary = 'No summary available (README is missing or image-only).';
        }

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
