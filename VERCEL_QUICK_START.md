# 🚀 VERCEL DEPLOYMENT - QUICK VISUAL GUIDE

## Your Hugging Face Token (Keep Safe! 🔒)
⚠️ **DO NOT COMMIT YOUR TOKEN TO GITHUB**

Get your token from: https://huggingface.co/settings/tokens
- Create a new token
- Set to 'read' permission (for inference API)
- Copy it

---

## STEP 1: Push Code to GitHub (2 min)

Run these commands in your terminal:

```bash
cd /home/leegion/Downloads/code/Github-Search

git init
git add -A
git commit -m "Add Hidden Gem GitHub Search Engine"
git remote add origin https://github.com/RootHaktivity/github-search.git
git branch -M main
git push -u origin main
```

⚠️ **Your GitHub username is: `RootHaktivity`**

If you don't have a GitHub repo yet, create one at: https://github.com/new

---

## STEP 2: Sign Up to Vercel (2 min)

1. Go to: https://vercel.com
2. Click **"Sign Up"**
3. Click **"Continue with GitHub"**
4. Click **"Authorize Vercel"** button
5. Done! ✅

---

## STEP 3: Import Your Repo to Vercel (3 min)

1. After login, click **"Add New"** (top right)
2. Click **"Project"**
3. Search for **"github-search"**
4. Click on the repo
5. Click **"Import"**

---

## STEP 4: Configure Project Settings (2 min)

On the configuration page, you'll see:

```
Project Name:          [hidden-gem-search]  ← Can change or keep default
Framework Preset:      [Other]              ← Auto-detected, leave as is
Root Directory:        [.]                  ← Leave as is
```

---

## STEP 5: Add Hugging Face Token ⚠️ IMPORTANT (1 min)

Scroll down to **"Environment Variables"** section:

1. Click **"Add New"** button
2. Fill in:
   ```
   Name:  HF_TOKEN
   Value: <paste-your-huggingface-token-here>
   ```
3. Click **"Add"**

Your configuration should now look like:

```
Environment Variables:
  HF_TOKEN = hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**WHERE TO GET YOUR TOKEN:**
1. Go to: https://huggingface.co/settings/tokens
2. Create a new token (name: "github-search")
3. set to **read** permission
4. Copy the token and paste in Vercel above

---

## STEP 6: Deploy! (2 min)

1. Scroll to bottom
2. Click **"Deploy"** button
3. **Wait 1-3 minutes** for build to complete
4. You'll see ✅ **"Deployment successful"** message

---

## STEP 7: Copy Your Backend URL (1 min)

After deployment finishes, you'll see something like:

```
🎉 Congratulations!
Your project is ready at:

https://hidden-gem-search.vercel.app
```

**Copy this URL!** You'll need it for the next step.

---

## TEST YOUR BACKEND (Optional)

In your terminal, test the backend works:

```bash
curl "https://YOUR-PROJECT-NAME.vercel.app/api/search?q=python"
```

You should get JSON back with repositories. ✅

---

## NEXT: Update Frontend (After Vercel is Done)

Once you have your Vercel URL, come back and:

1. Edit: `frontend/src/services/githubSearch.js`
2. Find line 3:
   ```javascript
   ? 'https://your-vercel-app.vercel.app'
   ```
3. Replace with YOUR actual Vercel URL:
   ```javascript
   ? 'https://hidden-gem-search.vercel.app'  // Your actual URL
   ```
4. Save file
5. Push to GitHub:
   ```bash
   git add frontend/src/services/githubSearch.js
   git commit -m "Update backend URL"
   git push
   ```

ℹ️ To find your Vercel URL later, go to: https://vercel.com/dashboard

---

## Vercel Dashboard Quick Facts

- **Can redeploy manually**: Click "Redeploy" button
- **Can see logs**: Click "Deployments" tab
- **Can manage env vars**: Click "Settings" → "Environment Variables"
- **Auto-deploys on push**: Whenever you push to GitHub, Vercel auto-rebuilds

---

## Troubleshooting

### "Deployment failed"
- Check your code has no syntax errors
- Ensure HF_TOKEN is added
- Check Vercel logs for specific error

### "Cannot find module"
- This shouldn't happen; all dependencies are already included
- Try redeploying

### "Cannot connect to backend from frontend"
- Make sure you updated the URL in `githubSearch.js`
- Make sure you pushed the change to GitHub
- Wait for GitHub Pages to redeploy (check Actions tab)

---

## Timeline

| Step | Time | What Happens |
|------|------|-----|
| 1. Push to GitHub | 2 min | Code uploaded to GitHub |
| 2-3. Sign up & import | 5 min | Vercel gets your code |
| 4-6. Configure & deploy | 5 min | Vercel builds & deploys (1-3 min) |
| **Total** | **~20 min** | **Backend is LIVE** ✅ |

Then:
| Step | Time | What Happens |
|------|------|-----|
| 7. Update frontend URL | 2 min | Change one line of code |
| 8. Push to GitHub | 2 min | Code uploaded |
| 9. GitHub Actions runs | 3 min | Frontend auto-deploys to GitHub Pages |
| **Total** | **~10 min** | **Frontend is LIVE** ✅ |

**Grand Total: ~30 minutes from start to fully live!**

---

## You're All Set! 💪

All the files are ready. Just follow these 7 steps and your backend will be live on Vercel.

**Questions?** Check the other guides:
- `START_HERE.md` - Overview
- `DEPLOY_NOW.md` - Detailed walkthrough
- `DEPLOYMENT.md` - Comprehensive guide
