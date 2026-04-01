# Vercel Deployment Setup - HF_TOKEN Configuration

## 🚀 Quick Setup for AI Summaries

Your Hugging Face token has been provided. Follow these steps to enable AI-powered repository summaries:

### Step 1: Go to Vercel Project Settings

1. Visit: https://vercel.com/dashboard
2. Click on your **GemFinder** project
3. Go to **Settings** tab → **Environment Variables**

### Step 2: Add HF_TOKEN

Click "Add Environment Variable" and enter:

| Key | Value |
|-----|-------|
| `HF_TOKEN` | `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (your Hugging Face token) |

**How to get your HF_TOKEN:**
1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Give it a name like "GemFinder"
4. Set role to **"Read"** (no write access needed)
5. Copy the token value
6. Paste into Vercel environment variable

### Step 3: Trigger Redeployment

After adding the environment variable, you need to redeploy:

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Click "Redeploy"

**Option B: Via Git (Recommended)**
1. Make a small commit to your repo:
   ```bash
   git commit --allow-empty -m "Trigger deployment to enable HF_TOKEN"
   git push
   ```
2. Vercel will automatically redeploy with the new environment variable

### Step 4: Verify It Works

After redeployment completes (2-3 minutes):

1. Go to https://roothaktivity.github.io/GemFinder/
2. Search for a repository (e.g., `rust cli`)
3. Check the **AI SUMMARY** section
4. It should now show an actual summary, not the repository description

**Expected result:**
- ✅ **Before**: "A collection of various awesome lists for hackers..."
- ✅ **After**: "Comprehensive resource curating top repositories and tools..." (unique AI-generated summary)

---

## Environment Variables Reference

Your `api/search.js` requires these environment variables on Vercel:

| Variable | Required | Value | Purpose |
|----------|----------|-------|---------|
| `HF_TOKEN` | ✅ Yes | Your Hugging Face Inference API token | Required for AI summaries |
| `GITHUB_TOKEN` | ❌ No | Your GitHub Personal Access Token | Optional - increases GitHub API rate limits |

---

## Testing the API

After deployment, test the API directly:

```bash
# Search for reverse-engineering tools
curl "https://your-vercel-domain.vercel.app/api/search?q=reverse-engineering" | jq '.results[0].ai_summary'

# Should return an actual AI summary, not the description
```

---

## Troubleshooting

### Issue: Still seeing description instead of summary

**Check 1: Verify environment variable is set**
```bash
# In Vercel Project Settings, confirm HF_TOKEN appears in Environment Variables
```

**Check 2: Make sure you redeployed**
```bash
# Check deployment timestamp - should be AFTER adding HF_TOKEN
```

**Check 3: Check build logs**
1. Go to Deployments tab
2. Click on latest deployment
3. Check "Build Logs" for any errors

### Issue: "Model loading" message

This happens when Hugging Face is loading the BART model. Wait 1-2 minutes and try again.

### Issue: Still not working?

1. Verify token is correct: https://huggingface.co/settings/tokens
2. Check token has **Inference API** access (not just read/write on files)
3. Ensure no typos in the token value
4. Try creating a new token from Hugging Face

---

## Next Steps

Once AI summaries are working:

✅ Push code to verify deployment  
✅ Test API endpoint with curl or Postman  
✅ Share the app with others  
✅ Monitor performance in Google Search Console  

Your GemFinder app is now ready with full AI capabilities! 🚀
