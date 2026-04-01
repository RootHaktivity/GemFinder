const GITHUB_API_BASE = 'https://api.github.com';

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

const OS_TOPIC_MAP = {
  linux:          'linux',
  windows:        'windows',
  macos:          'macos',
  'cross-platform': 'cross-platform',
};

async function fetchGitHubRepos(query, { lang, min_stars, sort, active_only, os, category, page } = {}) {
  // Build GitHub search qualifier string
  let q = query;
  if (lang) q += ` language:${lang}`;
  if (min_stars && Number(min_stars) > 0) q += ` stars:>=${min_stars}`;
  if (os && OS_TOPIC_MAP[os]) q += ` topic:${OS_TOPIC_MAP[os]}`;
  if (category) {
    // Sanitize: only alphanumeric + hyphens, max 30 chars
    const safeCat = category.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 30);
    if (safeCat) q += ` topic:${safeCat}`;
  }
  if (active_only) {
    const sixMonthsAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 180)
      .toISOString()
      .split('T')[0];
    q += ` pushed:>${sixMonthsAgo}`;
  }

  const validSorts = ['stars', 'updated', 'forks', 'help-wanted-issues'];
  const sortParam = validSorts.includes(sort) ? sort : 'stars';
  const pageParam = Math.max(1, parseInt(page) || 1);

  const url =
    `${GITHUB_API_BASE}/search/repositories` +
    `?q=${encodeURIComponent(q)}` +
    `&sort=${sortParam}&order=desc&per_page=9&page=${pageParam}`;

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
    // Fetch more raw content so we can find prose past the badge/art header
    const decoded = Buffer.from(normalized, 'base64').toString('utf-8');
    return decoded.slice(0, 4000); // grab more so extractMeaningfulText can find prose
  } catch {
    return '';
  }
}

function stripMarkdown(text) {
  return text
    .replace(/!\[[\s\S]*?\]\(.*?\)/g, '')            // remove images
    .replace(/\[!\[[\s\S]*?\]\(.*?\)\]\(.*?\)/g, '') // badge links
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')            // links → text
    .replace(/#{1,6}\s*/g, '')                         // ATX headings
    .replace(/^[=\-]{3,}\s*$/gm, '')                   // setext heading underlines
    .replace(/`{3}[\s\S]*?`{3}/g, '')                 // fenced code blocks
    .replace(/`[^`\n]*`/g, '')                         // inline code
    .replace(/^>\s*/gm, '')                            // blockquotes
    .replace(/[-*_]{3,}/g, '')                         // horizontal rules
    .replace(/[*_~]{1,2}([^*_~\n]+)[*_~]{1,2}/g, '$1') // bold/italic
    .replace(/<[^>]*>/g, '')                           // complete HTML tags
    .replace(/<[^\s<>]*/g, '')                         // partial/malformed HTML
    .replace(/\s*\w+="[^"]*"?/g, '')                   // orphaned HTML attrs (double quotes)
    .replace(/\s*\w+='[^']*'?/g, '')                   // orphaned HTML attrs (single quotes)
    .replace(/https?:\/\/\S+/g, '')                    // bare URLs
    .replace(/\n[ \t]*\n[ \t]*\n/g, '\n\n')            // whitespace-only blank lines
    .replace(/\n{3,}/g, '\n\n')                        // excess newlines
    .replace(/[ \t]{2,}/g, ' ')                        // excess spaces/tabs
    .trim();
}

/**
 * Extract the first meaningful prose paragraph(s) from a README.
 * Skips lines that are ASCII art, badge-only, version strings, or mostly symbols.
 */
function extractMeaningfulText(rawReadme, maxChars = 900) {
  const stripped = stripMarkdown(rawReadme);
  const lines = stripped.split('\n');
  const goodLines = [];
  let totalLen = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip very short lines (single words, labels, headings)
    if (trimmed.length < 15) continue;

    // Skip lines with low alphanumeric ratio — ASCII art, separators, symbol-heavy lines
    const alphanumCount = (trimmed.match(/[a-zA-Z0-9]/g) || []).length;
    const ratio = alphanumCount / trimmed.length;
    if (ratio < 0.45) continue;

    // Skip lines that look like version strings or changelogs
    if (/^v?\d+\.\d+/.test(trimmed)) continue;

    // Skip lines that are mostly pipe/slash characters (table rows, ASCII art)
    const pipeSlashCount = (trimmed.match(/[|/\\]/g) || []).length;
    if (pipeSlashCount / trimmed.length > 0.2) continue;

    goodLines.push(trimmed);
    totalLen += trimmed.length;
    if (totalLen >= maxChars) break;
  }

  return goodLines.join(' ').slice(0, maxChars).trim();
}

/** Returns true if a string is a meaningful human-readable summary */
function isMeaningfulSummary(s) {
  if (!s || s.length < 25) return false;
  // Reject if mostly dots, ellipsis, or symbols
  if (/^[.\s…]+$/.test(s)) return false;
  // Reject if alphanumeric ratio is too low (garbage output)
  const alphanumRatio = (s.match(/[a-zA-Z0-9]/g) || []).length / s.length;
  return alphanumRatio > 0.5;
}

async function summarizeWithHF(meaningfulText, description, readme) {
  // Fallback chain: meaningful text excerpt → description → generic message
  const excerptFallback = meaningfulText ? meaningfulText.split('. ').slice(0, 2).join('. ').slice(0, 180).trim() : '';
  const fallback = (description && description.length > 20)
    ? description
    : (excerptFallback || 'No summary available.');

  // Check if token exists
  if (!process.env.HF_TOKEN) {
    console.error('[SUMMARIZE] HF_TOKEN is not set in environment variables');
    return fallback;
  }

  // If meaningful text is too short, try to extract from raw README
  let textToSummarize = meaningfulText;
  if (!textToSummarize || textToSummarize.length < 50) {
    // Try the first 500 chars of stripped README as backup
    if (readme && readme.length > 200) {
      const stripped = stripMarkdown(readme);
      textToSummarize = stripped.slice(0, 500).trim();
    }
  }

  console.log(`[SUMMARIZE] textToSummarize length: ${textToSummarize?.length || 0}, fallback: ${fallback.substring(0, 50)}...`);

  if (!textToSummarize || textToSummarize.length < 50) {
    console.error('[SUMMARIZE] Text too short, using fallback');
    return fallback;
  }

  try {
    console.log(`[SUMMARIZE] Calling Hugging Face API with token: ${process.env.HF_TOKEN?.substring(0, 10)}...`);
    const res = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: textToSummarize.slice(0, 900),
          parameters: { max_length: 100, min_length: 30 },
        }),
      }
    );

    console.log(`[SUMMARIZE] HF API response status: ${res.status}`);

    if (res.status === 503) {
      console.log('[SUMMARIZE] Model loading (503), using fallback');
      return fallback;
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[SUMMARIZE] API error (${res.status}): ${errText}`);
      return fallback;
    }

    const data = await res.json();
    console.log(`[SUMMARIZE] HF response:`, data);

    let summary = null;
    if (Array.isArray(data) && data[0]?.summary_text) {
      summary = data[0].summary_text;
    } else if (data?.summary_text) {
      summary = data.summary_text;
    }

    if (summary) {
      const finalSummary = stripMarkdown(summary).trim();
      if (isMeaningfulSummary(finalSummary)) {
        console.log(`[SUMMARIZE] Success: ${finalSummary.substring(0, 50)}...`);
        return finalSummary;
      }
    }

    console.log('[SUMMARIZE] Summary not meaningful, using fallback');
    return fallback;
  } catch (err) {
    console.error('[SUMMARIZE] Exception:', err.message);
    return fallback;
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
    let total_count = 0;

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
      total_count = 1;
    }
    // Mode 2: Search for repos (q=search-terms)
    else {
      const filters = {
        lang: (req.query?.lang || '').trim(),
        min_stars: req.query?.min_stars || 0,
        sort: (req.query?.sort || 'stars').trim(),
        active_only: req.query?.active_only === 'true',
        os: (req.query?.os || '').trim(),
        category: (req.query?.category || '').trim(),
        page: req.query?.page || 1,
      };
      const githubData = await fetchGitHubRepos(q, filters);
      repos = githubData.items || [];
      total_count = githubData.total_count || 0;
    }

    // Enrich each repo with README and AI summary
    const enriched = await Promise.all(
      repos.slice(0, 9).map(async (repo) => {
        const readme = await fetchReadmeContent(repo.owner.login, repo.name);
        // Extract meaningful prose (skips ASCII art, badges, version strings)
        const meaningfulText = readme ? extractMeaningfulText(readme) : '';

        const ai_summary = await summarizeWithHF(meaningfulText, repo.description, readme);

        return {
          name: repo.name,
          full_name: repo.full_name,
          html_url: repo.html_url,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          open_issues: repo.open_issues_count,
          language: repo.language,
          topics: repo.topics || [],
          license: repo.license?.spdx_id || null,
          pushed_at: repo.pushed_at,
          created_at: repo.created_at,
          ai_summary,
        };
      })
    );

    return res.status(200).json({ results: enriched, total_count });
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
