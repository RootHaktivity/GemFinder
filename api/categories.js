/**
 * /api/categories
 *
 * GET  → returns { builtin: [...], custom: [...] }
 * POST → { category: "new-topic" } → appends to categories.json in the repo → returns updated list
 *
 * Storage: categories.json in the GitHub repo (RootHaktivity/github-search)
 * Auth:    uses GITHUB_TOKEN env var (already required for search rate limits)
 */

const REPO_OWNER = 'RootHaktivity';
const REPO_NAME  = 'github-search';
const FILE_PATH  = 'categories.json';
const GITHUB_API = 'https://api.github.com';

const BUILTIN_CATEGORIES = [
  { value: 'osint',               label: '🔍 OSINT' },
  { value: 'pentesting',          label: '🔐 Pentesting' },
  { value: 'reverse-engineering', label: '🔄 Reverse Engineering' },
  { value: 'monitoring',          label: '📊 Monitoring' },
  { value: 'self-hosted',         label: '🏠 Self-Hosted' },
  { value: 'machine-learning',    label: '🤖 Machine Learning' },
  { value: 'cli',                 label: '🖥️ CLI / Terminal' },
  { value: 'privacy',             label: '🔒 Privacy Tools' },
  { value: 'fuzzing',             label: '🐛 Fuzzing' },
  { value: 'devtools',            label: '🛠️ Dev Tools' },
  { value: 'docker',              label: '🐳 Containers' },
  { value: 'web-scraping',        label: '🌐 Web Scraping' },
  { value: 'homelab',             label: '🏡 Homelab' },
  { value: 'rust',                label: '🦀 Rust' },
  { value: 'python',              label: '🐍 Python Tools' },
];

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function githubHeaders() {
  const h = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hidden-gem-search-engine',
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

/** Fetch categories.json from the repo. Returns { content, sha } */
async function fetchCategoriesFile() {
  const url = `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const res = await fetch(url, { headers: githubHeaders() });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories file: ${res.status}`);
  }

  const data = await res.json();
  const decoded = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
  const parsed = JSON.parse(decoded);

  return {
    custom: Array.isArray(parsed.custom) ? parsed.custom : [],
    sha: data.sha,
  };
}

/** Write updated categories.json back to the repo */
async function writeCategoriesFile(custom, sha) {
  const url = `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const content = Buffer.from(JSON.stringify({ custom }, null, 2)).toString('base64');

  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `feat: add custom category via Hidden Gem Search`,
      content,
      sha,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update categories file: ${res.status} — ${err.slice(0, 200)}`);
  }

  return res.json();
}

/** Sanitize a user-submitted category value */
function sanitizeCategory(raw) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')   // only alphanumeric + hyphens
    .replace(/-{2,}/g, '-')         // collapse multiple hyphens
    .replace(/^-|-$/g, '')          // strip leading/trailing hyphens
    .slice(0, 30);                  // max 30 chars
}

export default async function handler(req, res) {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') return res.status(204).end();

  // ── GET: return all categories ──────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { custom } = await fetchCategoriesFile();
      return res.status(200).json({ builtin: BUILTIN_CATEGORIES, custom });
    } catch (err) {
      // If file fetch fails, return builtin only (graceful degradation)
      return res.status(200).json({ builtin: BUILTIN_CATEGORIES, custom: [] });
    }
  }

  // ── POST: add a custom category ─────────────────────────────────────────
  if (req.method === 'POST') {
    if (!process.env.GITHUB_TOKEN) {
      return res.status(503).json({
        error: 'Custom categories require GITHUB_TOKEN to be configured on the server.',
      });
    }

    let body = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body.' });
    }

    const rawCategory = (body.category || '').toString();
    const rawLabel    = (body.label || '').toString().trim().slice(0, 40);

    if (!rawCategory) {
      return res.status(400).json({ error: 'Missing "category" field.' });
    }

    const value = sanitizeCategory(rawCategory);
    if (!value || value.length < 2) {
      return res.status(400).json({ error: 'Category must be at least 2 alphanumeric characters.' });
    }

    // Build label: use provided label or auto-generate from value
    const label = rawLabel || value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    try {
      const { custom, sha } = await fetchCategoriesFile();

      // Check for duplicates (against both builtin and custom)
      const allValues = [
        ...BUILTIN_CATEGORIES.map((c) => c.value),
        ...custom.map((c) => c.value),
      ];
      if (allValues.includes(value)) {
        return res.status(409).json({ error: `Category "${value}" already exists.` });
      }

      // Append and write back
      const updated = [...custom, { value, label: `✨ ${label}` }];
      await writeCategoriesFile(updated, sha);

      return res.status(201).json({
        message: `Category "${value}" added successfully.`,
        builtin: BUILTIN_CATEGORIES,
        custom: updated,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
