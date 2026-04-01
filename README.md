# GitHub Hidden Gem Search Engine

> Find high-quality GitHub repos using AI-powered summaries + free-tier APIs

## Features

- 🔍 **Semantic Search** — Search GitHub repos with intelligent filtering
- 🤖 **AI Summaries** — Auto-generate 2-sentence TL;DRs using Hugging Face BART model
- 💰 **Zero Cost** — Runs entirely on free APIs and free hosting
  - Backend: Vercel Serverless (free tier)
  - Frontend: GitHub Pages (free)
  - AI: Hugging Face Inference (free tier)

## Tech Stack

- **Backend**: Node.js + Vercel Serverless Functions
- **Frontend**: React + Vite + Tailwind CSS
- **APIs**:
  - GitHub Search API (free)
  - Hugging Face Inference API (free tier: 50 requests/day)

## Setup

### Prerequisites

- Node.js 18+
- Hugging Face account (free) + inference API token
- GitHub token (optional, for higher rate limits)

### Backend Setup

1. Create a `.env.local` file:

```bash
HF_TOKEN=your_hugging_face_inference_token
GITHUB_TOKEN=your_github_token  # Optional
```

2. Test locally:

```bash
npm install -g vercel
vercel dev
```

3. Deploy to Vercel:

```bash
vercel
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## API Reference

### Search Repositories

**GET** `/api/search?q={query}`

Returns top 5 repositories matching the query with AI summaries.

```bash
curl "https://your-app.vercel.app/api/search?q=rust+cli"
```

Response:

```json
[
  {
    "name": "repo-name",
    "html_url": "https://github.com/owner/repo",
    "description": "Repository description",
    "stars": 1234,
    "ai_summary": "Two-sentence AI-generated summary of the project..."
  }
]
```

### Get Single Repository Summary

**GET** `/api/search?repo={owner}/{repo}`

Returns a single repository with AI summary.

```bash
curl "https://your-app.vercel.app/api/search?repo=expressjs/express"
```

Same response format as search.

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Go to vercel.com and import the GitHub repo
3. Add environment variables:
   - `HF_TOKEN` — Your Hugging Face inference API token
   - `GITHUB_TOKEN` — (Optional) Your GitHub personal access token
4. Deploy!

### GitHub Pages Deployment

Frontend is auto-deployed to GitHub Pages when you push to `main` via GitHub Actions.

## Rate Limits

- **GitHub API**: 60 reqs/hour (unauthenticated) → 5000/hour (with token)
- **Hugging Face**: 50 req/day (free tier) → unlimited (paid tier)

If you hit HF limits, the app gracefully falls back to "AI summary unavailable".

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `HF_TOKEN` | Hugging Face Inference API token | Yes |
| `GITHUB_TOKEN` | GitHub personal access token | No |

## License

MIT
