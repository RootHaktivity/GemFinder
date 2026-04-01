# 🚀 Deploy Your Hidden Gem Search Engine

## Quick Summary
Your backend and frontend are ready to deploy. You have your Hugging Face token. Follow these steps to go live for **FREE** on Vercel + GitHub Pages.

---

## Step 1: Initialize Git Repository (5 min)

If you haven't already, initialize a Git repository:

```bash
cd /home/leegion/Downloads/code/Github-Search
git init
git add -A
git commit -m "Initial commit: Hidden Gem GitHub Search Engine"
```

Create a GitHub repo at https://github.com/new (e.g., `github-search` or `hidden-gem-search`)

Then push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Vercel (10 min)

### 2a. Sign Up / Log In to Vercel
- Go to https://vercel.com
- Click "Sign up" or "Sign in"
- Choose "Continue with GitHub"
- Authorize Vercel

### 2b. Create New Project
1. Click "Add New" → "Project"
2. Search for and select your GitHub repo
3. Click "Import"

### 2c. Configure Project
1. **Project Name**: Choose any name (e.g., `hidden-gem-search`)
2. **Framework**: Leave as "Other" (it auto-detects Node.js)
3. **Root Directory**: `.` (already selected)
4. Click "Continue"

### 2d. Add Environment Variables
1. Click "Environment Variables" section
2. Add this variable:

| Key | Value |
|-----|-------|
| `HF_TOKEN` | `<YOUR_HF_TOKEN>` |

3. Click "Deploy"

### 2e. Wait for Deployment
- Vercel builds and deploys automatically
- You'll see a green checkmark when done
- **Your backend URL**: `https://YOUR-PROJECT-NAME.vercel.app`
- Test it: `curl "https://YOUR-PROJECT-NAME.vercel.app/api/search?q=python"`

---

## Step 3: Update Frontend with Backend URL (5 min)

Edit this file with your actual Vercel URL:

**File**: `frontend/src/services/githubSearch.js`

Change this line (around line 3):
```javascript
const API_BASE = import.meta.env.PROD
  ? 'https://your-vercel-app.vercel.app'  // ← REPLACE THIS
  : '/api';
```

To your actual Vercel URL:
```javascript
const API_BASE = import.meta.env.PROD
  ? 'https://YOUR-PROJECT-NAME.vercel.app'  // ← Your actual URL
  : '/api';
```

Save the file.

---

## Step 4: Push Code & Deploy Frontend (5 min)

```bash
git add frontend/src/services/githubSearch.js
git commit -m "Update backend API URL for production"
git push origin main
```

GitHub Actions automatically:
1. Detects the push
2. Builds frontend with Vite
3. Deploys to GitHub Pages

Check the **Actions** tab in your repo to see deployment progress.

---

## Step 5: Enable GitHub Pages (5 min)

1. Go to your GitHub repo
2. **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
4. Your site will be live at:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```

---

## Step 6: Test Everything (5 min)

### Test Backend
```bash
# Search for repos
curl "https://YOUR-PROJECT-NAME.vercel.app/api/search?q=rust+cli"

# Get single repo
curl "https://YOUR-PROJECT-NAME.vercel.app/api/search?repo=facebook/react"
```

### Test Frontend
1. Open your GitHub Pages URL in browser: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
2. Search for "python cli" → Should see results with summaries
3. Click "✨ Surprise Me!" button
4. Click a GitHub link → Should open repo
5. Check browser console (F12) → Should be no errors

---

## Status Checklist

- [ ] Git repository created and pushed to GitHub
- [ ] Vercel project created and deployed
- [ ] HF_TOKEN added to Vercel environment variables
- [ ] Backend URL updated in `githubSearch.js`
- [ ] Code pushed to trigger GitHub Actions
- [ ] GitHub Pages enabled
- [ ] Frontend and backend both live and working

---

## Your URLs (After Deployment)

**Frontend**: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
**Backend API**: `https://YOUR-PROJECT-NAME.vercel.app/api/search`

---

## Troubleshooting

### "API endpoint not found" error
- Verify Vercel URL is correct in `githubSearch.js`
- Check that Vercel deployment completed (green checkmark)
- Wait 1-2 minutes for DNS propagation

### "Summaries unavailable" message
- HF API may be temporarily unavailable (fallback shows README excerpt)
- Or HF token might have daily rate limit (50 req/day free tier)
- System gracefully falls back to README content

### "Repo not found" error
- Try a different search term
- Or test single repo mode: `?repo=facebook/react`

### Search returns no results
- GitHub API rate limit (60/hour unauthenticated)
- Add `GITHUB_TOKEN` to Vercel for 5000/hour limit

---

## Cost Summary

✅ **Vercel Backend**: FREE (up to unlimited serverless calls)
✅ **GitHub Pages Frontend**: FREE (unlimited)
✅ **Hugging Face AI**: FREE (50 requests/day)
✅ **Total**: **$0** 🎉

---

## Next Steps (Optional Enhancements)

1. **Add Custom Domain** → `vercel domains add yourdomain.com`
2. **Add Caching** → Use Upstash Redis free tier to cache summaries
3. **Add GitHub Token** → Set `GITHUB_TOKEN` for higher rate limits
4. **Analytics** → Enable Vercel Analytics in Settings
5. **Share** → Your site is now public! Share the URL

---

## Questions?

- Vercel Docs: https://vercel.com/docs
- GitHub Pages: https://pages.github.com
- Hugging Face: https://huggingface.co/docs

**You're all set! Your zero-cost AI-powered GitHub search engine is ready to ship.** 🚀
