#!/usr/bin/env bash
# COPY-PASTE COMMANDS FOR DEPLOYMENT
# Run these commands in your terminal one by one

# ============================================================================
# PART 1: PUSH CODE TO GITHUB (Run these first)
# ============================================================================

cd /home/leegion/Downloads/code/Github-Search

git init

git add -A

git commit -m "Add Hidden Gem GitHub Search Engine"

# EDIT THIS LINE WITH YOUR GITHUB USERNAME:
git remote add origin https://github.com/RootHaktivity/github-search.git

git branch -M main

git push -u origin main

# ============================================================================
# Now go to https://vercel.com and follow the VERCEL_QUICK_START.md steps
# ============================================================================

# PART 2: After Vercel deployment is done, update frontend
# ============================================================================

# Edit this file and replace the URL on line 3:
# frontend/src/services/githubSearch.js

# Then commit and push:
git add frontend/src/services/githubSearch.js

git commit -m "Update backend API URL for production"

git push origin main

# ============================================================================
# Done! GitHub Pages will auto-deploy your frontend now!
# ============================================================================

# To check deployment status, visit:
# - Vercel Dashboard: https://vercel.com/dashboard
# - GitHub Actions: https://github.com/YOUR_USERNAME/github-search/actions
