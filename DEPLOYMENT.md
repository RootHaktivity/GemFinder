# 🚀 Deployment Guide: Hidden Gem GitHub Search

## Quick Start Summary

This project uses **two separate hosting platforms**:

- **Backend API**: Vercel Serverless Functions (free tier)
- **Frontend**: GitHub Pages (free tier)
- **AI Engine**: Hugging Face Inference API (free tier)

Both are completely free and highly scalable within their free tier limits.

---

## Part 1: Backend Deployment (Vercel)

### Prerequisites

1. **Hugging Face Token** (Required)
   - Go to https://huggingface.co/settings/tokens
   - Create a new token with "Make calls to Inference Providers" permission
   - Copy the token (you'll need it in Step 3)

2. **GitHub Account with this repo pushed**
   - Make sure all code is pushed to GitHub (public or private)

### Deployment Steps

#### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up" (or sign in if you have an account)
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account
5. Click "Import Project"
6. Search for and select your `Github-Search` repo

#### Step 2: Configure Project Settings

1. **Project Name**: `hidden-gem-search` (or your preferred name)
2. **Framework Preset**: Node.js
3. **Root Directory**: Leave as `.` (root of repo)
4. Click "Continue"

#### Step 3: Add Environment Variables

1. In the "Environment Variables" section, add:

   | Key | Value |
   |-----|-------|
   | `HF_TOKEN` | Your Hugging Face inference API token |
   | `GITHUB_TOKEN` | (Optional) Your GitHub personal access token for higher rate limits |

2. Click "Deploy"

#### Step 4: Verify Deployment

Once deployed, you'll see a production URL like: `https://hidden-gem-search.vercel.app`

Test it with curl:

```bash
# Search mode
curl "https://YOUR-URL.vercel.app/api/search?q=rust+cli"

# Single repo mode
curl "https://YOUR-URL.vercel.app/api/search?repo=facebook/react"
```

**✅ Backend is now live!**

---

## Part 2: Frontend Deployment (GitHub Pages)

### Prerequisites

1. **Backend URL** from Part 1 (e.g., `https://hidden-gem-search.vercel.app`)
2. **Repository Settings Access**

### Deployment Steps

#### Step 1: Update Backend URL in Frontend

Edit `frontend/src/services/githubSearch.js` and replace:

```javascript
const API_BASE = import.meta.env.PROD
  ? 'https://your-vercel-app.vercel.app'  // ← Replace with your actual Vercel URL
  : '/api';
```

With your actual Vercel URL:

```javascript
const API_BASE = import.meta.env.PROD
  ? 'https://hidden-gem-search.vercel.app'  // ← Your actual Vercel URL
  : '/api';
```

#### Step 2: Update Repository Name in Vite Config

Edit `frontend/vite.config.js`:

```javascript
base: '/Github-Search/'  // ← Should match your GitHub repo name
```

#### Step 3: Push to GitHub

```bash
git add -A
git commit -m "Update API URL and base path for GitHub Pages"
git push
```

#### Step 4: Enable GitHub Pages

1. Go to your GitHub repo → **Settings** → **Pages**
2. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - (If you don't see this option, enable workflows first)
3. The workflow should auto-trigger on push

#### Step 5: Verify Deployment

1. Go to repo **Actions** tab
2. You should see the "Deploy Frontend to GitHub Pages" workflow running
3. Once it completes (green checkmark), your site is live!
4. GitHub will show the URL in Settings → Pages (typically: `https://USERNAME.github.io/Github-Search/`)

**✅ Frontend is now live!**

---

## Part 3: Verify Everything Works

### Test the Full Stack

1. Open your GitHub Pages URL in browser: `https://USERNAME.github.io/Github-Search/`
2. Try a search: Enter "rust cli" and click Search
3. Click "✨ Surprise Me!" button
4. Check that:
   - ✅ Results display with AI summaries
   - ✅ Stars and descriptions appear
   - ✅ Links to GitHub repos work
   - ✅ No CORS or API errors in browser console

### Troubleshooting

#### "AI summary unavailable" message

**Possible causes:**
- HF_TOKEN not set in Vercel
- GitHub repo README too short
- Hugging Face rate limit exceeded (50 req/day free tier)

**Fix:**
1. Check Vercel → Settings → Environment Variables
2. Verify HF_TOKEN is set
3. Wait an hour and retry

#### "Error connecting to backend"

**Possible causes:**
- Backend URL in `githubSearch.js` is incorrect
- Vercel function not deployed yet

**Fix:**
1. Check frontend console for actual API URL being called
2. Double-check your Vercel URL in the code
3. Ensure Vercel deployment completed (green checkmark)

#### Search returns no results / Rate limit errors

**Possible causes:**
- GitHub API rate limit (60 req/hour without token)
- GITHUB_TOKEN not set in Vercel

**Fix:**
1. Set GITHUB_TOKEN in Vercel environment variables (raises limit to 5000/hour)
2. Wait an hour for rate limit reset

---

## Environment Variables Reference

### Required

| Variable | Description | Where to Get |
|----------|-------------|-------------|
| `HF_TOKEN` | Hugging Face Inference API token | https://huggingface.co/settings/tokens |

### Optional (Recommended)

| Variable | Description | Where to Get |
|----------|-------------|-------------|
| `GITHUB_TOKEN` | GitHub personal access token | https://github.com/settings/tokens (scope: `repo` or `public_repo`) |

### Where to Add

- **Vercel**: Settings → Environment Variables
- **Local dev**: Create `.env.local` in project root

---

## Vercel Cost Breakdown

| Component | Free Tier | Cost |
|-----------|-----------|------|
| Serverless Functions | Unlimited invocations | **$0** |
| Bandwidth | 100 GB/month | **$0** |
| Cold starts | ~0 ms with Vercel Edge Runtime | **$0** |
| **Total** | | **$0** 🎉 |

---

## GitHub Pages Cost Breakdown

| Component | Free Tier | Cost |
|-----------|-----------|------|
| Static hosting | Unlimited | **$0** |
| Bandwidth | Unlimited | **$0** |
| SSL/HTTPS | Automatic | **$0** |
| CDN | Automatic | **$0** |
| **Total** | | **$0** 🎉 |

---

## Hugging Face Cost Breakdown

| Component | Free Tier | Cost |
|-----------|-----------|------|
| Inference API calls | 50 per day | **$0** |
| Model: facebook/bart-large-cnn | Always free | **$0** |
| Storage | Unlimited | **$0** |
| **Total** | | **$0** 🚀 |

---

## Next Steps & Optional Enhancements

### 1. Add Custom Domain (Vercel)

```bash
vercel domains add yourdomain.com
```

### 2. Add Caching Layer (Optional)

For production, add Redis caching to avoid HF rate limits:
- Upstash Redis (free tier: 10,000 commands/day)
- Cache repo summaries for 24 hours

### 3. Analytics & Monitoring

- **Vercel**: Built-in analytics
- **GitHub Pages**: Google Analytics integration

### 4. Custom GitHub Actions

- Auto-update repo index daily
- Send email alerts for trending repos

---

## Support & Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors in browser | Ensure Vercel URL is correct in `githubSearch.js` |
| 429 Rate Limit errors | Add GITHUB_TOKEN to Vercel env vars |
| "README not found" | Repo doesn't have README; summarizer shows fallback |
| Blank page on frontend | Check browser console for errors; verify base path in `vite.config.js` |

### Debug Checklist

- [ ] Vercel deployment shows green checkmark
- [ ] HF_TOKEN is set in Vercel environment
- [ ] Frontend URL in githubSearch.js matches actual Vercel URL
- [ ] GitHub Pages is enabled and workflow passed
- [ ] Browser can access both backend and frontend URLs

---

## Architecture Diagram

```
┌─────────────────────┐
│  Browser            │
│ (GitHub Pages URL)  │
└──────────┬──────────┘
           │ HTTPS
           ▼
┌─────────────────────────────────────┐
│  Frontend (GitHub Pages)            │
│  - React + Vite + Tailwind CSS      │
│  - Static HTML/CSS/JS               │
│  /Github-Search/                    │
└──────────┬──────────────────────────┘
           │ Fetch requests
           ▼
┌─────────────────────────────────────┐
│  Backend API (Vercel)               │
│  - Node.js Serverless Functions     │
│  /api/search                        │
│  - GitHub Search API                │
│  - Hugging Face Inference API       │
└──────────┬────────────┬─────────────┘
           │            │
           ▼            ▼
    ┌──────────────┐  ┌─────────────────┐
    │  GitHub API  │  │ Hugging Face    │
    │              │  │ BART-large-cnn  │
    └──────────────┘  └─────────────────┘
```

---

## You're All Set! 🎉

Your zero-cost, AI-powered GitHub search engine is now live!

- 🔍 Frontend: `https://USERNAME.github.io/Github-Search/`
- 🤖 Backend: `https://YOUR-URL.vercel.app/api/search`
- 💬 AI Engine: Free Hugging Face inference

Share it, improve it, and enjoy finding those hidden gems!
