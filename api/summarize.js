// Separate endpoint for lazy-loading summaries with caching
// This enables fast search results with summaries loaded in parallel

const GITHUB_API_BASE = 'https://api.github.com';

// In-memory cache for summaries (persists between requests for 24 hours)
const summaryCache = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

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

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function fetchReadmeContent(owner, repo) {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`;
    const res = await fetch(url, { headers: buildGitHubHeaders() });
    if (res.status === 404 || !res.ok) return null;
    const data = await res.json();
    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf8');
    }
    return data.content;
  } catch {
    return null;
  }
}

function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '•')
    .replace(/\n\n+/g, '\n')
    .trim();
}

function extractMeaningfulText(readme, maxChars = 1500) {
  if (!readme || typeof readme !== 'string') return '';
  const stripped = stripMarkdown(readme);
  const lines = stripped.split('\n').filter((l) => l.trim());
  const goodLines = [];
  let totalLen = 0;

  for (const trimmed of lines) {
    if (trimmed.length < 15) continue;
    const alphanumCount = (trimmed.match(/[a-zA-Z0-9]/g) || []).length;
    if (alphanumCount / trimmed.length < 0.45) continue;
    if (/^v?\d+\.\d+/.test(trimmed)) continue;
    const pipeSlashCount = (trimmed.match(/[|/\\]/g) || []).length;
    if (pipeSlashCount / trimmed.length > 0.2) continue;

    goodLines.push(trimmed);
    totalLen += trimmed.length;
    if (totalLen >= maxChars) break;
  }

  return goodLines.join(' ').slice(0, maxChars).trim();
}

function isMeaningfulSummary(s) {
  if (!s || s.length < 25) return false;
  if (/^[.\s…]+$/.test(s)) return false;
  const alphanumRatio = (s.match(/[a-zA-Z0-9]/g) || []).length / s.length;
  return alphanumRatio > 0.5;
}

async function summarizeWithHF(meaningfulText, description, readme) {
  const excerptFallback = meaningfulText ? meaningfulText.split('. ').slice(0, 2).join('. ').slice(0, 180).trim() : '';
  const fallback = (description && description.length > 20) ? description : (excerptFallback || 'No summary available.');

  if (!process.env.HF_TOKEN) {
    console.error('[SUMMARIZE] HF_TOKEN not set');
    return fallback;
  }

  let textToSummarize = meaningfulText;
  if (!textToSummarize || textToSummarize.length < 50) {
    if (readme && readme.length > 200) {
      const stripped = stripMarkdown(readme);
      textToSummarize = stripped.slice(0, 500).trim();
    }
  }

  console.log(`[SUMMARIZE] Text length: ${textToSummarize?.length || 0}`);

  if (!textToSummarize || textToSummarize.length < 50) {
    console.error('[SUMMARIZE] Text too short');
    return fallback;
  }

  try {
    console.log(`[SUMMARIZE] Calling HF API...`);
    const res = await fetch(
      'https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: textToSummarize.slice(0, 900),
          parameters: { max_length: 100, min_length: 30 },
        }),
      }
    );

    console.log(`[SUMMARIZE] HF response: ${res.status}`);

    if (res.status === 503) {
      console.log('[SUMMARIZE] Model loading');
      return fallback;
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[SUMMARIZE] Error ${res.status}: ${errText}`);
      return fallback;
    }

    const data = await res.json();
    let summary = null;
    if (Array.isArray(data) && data[0]?.summary_text) {
      summary = data[0].summary_text;
    } else if (data?.summary_text) {
      summary = data.summary_text;
    }

    if (summary) {
      const finalSummary = stripMarkdown(summary).trim();
      if (isMeaningfulSummary(finalSummary)) {
        console.log(`[SUMMARIZE] Success`);
        return finalSummary;
      }
    }

    console.log('[SUMMARIZE] Not meaningful');
    return fallback;
  } catch (err) {
    console.error('[SUMMARIZE] Exception:', err.message);
    return fallback;
  }
}

async function fetchSingleRepo(owner, repo) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
  const res = await fetch(url, { headers: buildGitHubHeaders() });
  if (!res.ok) throw new Error(`Repo not found: ${owner}/${repo}`);
  return res.json();
}

async function getCachedSummary(owner, repo, readme, description) {
  const cacheKey = `${owner}/${repo}`;
  const cached = summaryCache[cacheKey];

  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    console.log(`[CACHE] Hit: ${cacheKey}`);
    return cached.summary;
  }

  console.log(`[CACHE] Miss: ${cacheKey}`);
  const meaningfulText = readme ? extractMeaningfulText(readme) : '';
  const summary = await summarizeWithHF(meaningfulText, description, readme);

  summaryCache[cacheKey] = {
    summary,
    timestamp: Date.now(),
  };

  return summary;
}

export default async function handler(req, res) {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const repoParam = (req.query?.repo || '').trim();
  if (!repoParam) {
    return res.status(400).json({ error: 'Missing ?repo=owner/repo' });
  }

  try {
    const [owner, repo] = repoParam.split('/');
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Invalid repo format' });
    }

    const repoData = await fetchSingleRepo(owner, repo);
    const readme = await fetchReadmeContent(owner, repo);
    const ai_summary = await getCachedSummary(owner, repo, readme, repoData.description);

    return res.status(200).json({
      full_name: `${owner}/${repo}`,
      ai_summary,
    });
  } catch (error) {
    const msg = error?.message || 'Failed to fetch summary';
    console.error(`[SUMMARIZE] Error:`, msg);
    return res.status(500).json({ error: msg });
  }
}
