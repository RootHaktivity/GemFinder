#!/bin/bash
# GitHub Push Helper Script
# Automates git authentication for pushing code to GitHub

set -e

echo "==============================================="
echo "  GitHub Push Helper for RootHaktivity"
echo "==============================================="
echo ""

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ ERROR: Not in a git repository!"
    echo "Run: cd /home/leegion/Downloads/code/Github-Search"
    exit 1
fi

echo "📝 Step 1: Do you have a GitHub Personal Access Token?"
echo "   If not, go to: https://github.com/settings/tokens/new"
echo "   - Name it: github-search-deploy"
echo "   - Check: repo, workflow"
echo "   - Generate and COPY the token"
echo ""
read -p "Have you created a token? (y/n): " has_token

if [ "$has_token" != "y" ]; then
    echo "❌ Please create a token first: https://github.com/settings/tokens/new"
    exit 1
fi

echo ""
echo "📝 Step 2: Paste your token here:"
echo "   (It looks like: ghp_XXXXXXXXXXXX)"
read -sp "Token: " token

if [ -z "$token" ]; then
    echo ""
    echo "❌ Token cannot be empty!"
    exit 1
fi

echo ""
echo ""
echo "🔧 Configuring git..."

# Store credentials
git config --global user.name "RootHaktivity"
git config --global credential.helper store

# Remove old origin
git remote remove origin 2>/dev/null || true

# Add new origin
git remote add origin "https://RootHaktivity:${token}@github.com/RootHaktivity/github-search.git"

# Ensure main branch
git branch -M main

echo "✅ Git configured!"
echo ""
echo "🚀 Pushing to GitHub..."
echo ""

# Push with error handling
if git push -u origin main; then
    echo ""
    echo "✅ SUCCESS! Your code is now on GitHub:"
    echo "   https://github.com/RootHaktivity/github-search"
    echo ""
    echo "📂 Check it in 10 seconds - all files should appear."
    echo ""
else
    echo ""
    echo "❌ Push failed. This might be because:"
    echo "   1. Token expired or has wrong scopes"
    echo "   2. Repository doesn't exist yet"
    echo ""
    echo "📋 Verify:"
    echo "   - Go to https://github.com/new and create 'github-search' repo"
    echo "   - Create a new token: https://github.com/settings/tokens/new"
    echo "   - Make sure to check 'repo' scope"
    exit 1
fi

# Clean up - remove token from git config for security
git remote set-url origin "https://github.com/RootHaktivity/github-search.git"

echo "🔒 Token removed from git config (saved safely in ~/.git-credentials)"
echo ""
echo "Next: Deploy to Vercel from https://vercel.com"
