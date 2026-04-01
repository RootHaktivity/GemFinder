# GitHub Push Authentication Guide

## Problem
Git is rejecting your login because you signed in with Google OAuth, not a GitHub password. Git can't use Google authentication directly.

## Solution: Use Personal Access Token (PAT)

### Step 1: Create Your Token (2 minutes)

1. Go to: **https://github.com/settings/tokens/new**
2. Fill in:
   - **Token name:** `github-search-deploy`
   - **Expiration:** 30 days (or longer)
   - **Scopes:** Check these boxes:
     - ✅ `repo` (full control of repos)
     - ✅ `workflow` (GitHub Actions)
3. Scroll down and click **"Generate token"**
4. **COPY THE TOKEN** (appears as `ghp_...`) - you won't see it again!

### Step 2: Push Your Code (using token as password)

Run these commands in order:

```bash
cd /home/leegion/Downloads/code/Github-Search

# Remove old origin if it exists
git remote remove origin 2>/dev/null || true

# Add new origin with HTTPS
git remote add origin https://github.com/RootHaktivity/github-search.git

# Ensure main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

When prompted:
- **Username:** `RootHaktivity`
- **Password:** Paste your token (the `ghp_...` string)

### Step 3: Make Git Remember Your Credentials (Optional but recommended)

So you don't paste the token every time:

```bash
git config --global credential.helper store
git push -u origin main
```

Git will ask for credentials once, then save them in `~/.git-credentials`

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `fatal: could not read Username` | Make sure `~/.gitconfig` doesn't have old cached credentials |
| `fatal: Authentication failed` | Token expired or has wrong scopes - create a new token with `repo` scope |
| `permission denied (publickey)` | You're using SSH - this guide is for HTTPS. Either use HTTPS URL above or [set up SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) |

---

## Verify Success

After pushing, go to: **https://github.com/RootHaktivity/github-search**

You should see all 30+ files there with your latest commit.

---

## Why This Works

- GitHub disabled password auth in 2021
- Google OAuth can't be used directly by Git
- Personal Access Tokens are the secure, modern way to authenticate Git
- Token has limited, specific permissions (not your full account access)

Need help? The most common issue is token has wrong scopes - make sure you checked `repo` and `workflow`.
