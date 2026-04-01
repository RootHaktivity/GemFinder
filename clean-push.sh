#!/bin/bash
# Clean GitHub Push - Delete & Recreate Repository
# This script handles the GitHub push protection issue by starting fresh

set -e

echo "=========================================="
echo "  Clean GitHub Push Helper"
echo "=========================================="
echo ""
echo "This script will:"
echo "  1. Delete your GitHub repository"
echo "  2. Create a new one"
echo "  3. Push clean code"
echo ""
read -p "Ready to proceed? (Type 'yes' to continue): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "⚡ BEFORE CONTINUING:"
echo "  1. Go to: https://github.com/RootHaktivity/github-search/settings"
echo "  2. Scroll down to 'Danger Zone'"
echo "  3. Click 'Delete this repository'"
echo "  4. Type the repo name to confirm deletion"
echo ""
echo "  Then come back here and press ENTER"
read -p "Press ENTER once you've deleted the repo on GitHub: "

echo ""
echo "🔧 Removing old origin..."
git remote remove origin

echo "✅ Old origin removed"
echo ""
echo "📝 Now creating new repository on GitHub..."
echo "   Go to: https://github.com/new"
echo ""
echo "   Fill in:"
echo "     Repository name: github-search"
echo "     Description: Hidden Gem GitHub Search Engine"
echo "     Public (recommended)"
echo "   DO NOT initialize with README, .gitignore, or license"
echo "   Click 'Create repository'"
echo ""
read -p "Press ENTER once you've created the new repo: "

echo ""
echo "🚀 Adding new clean origin..."
git remote add origin https://github.com/RootHaktivity/github-search.git

echo "📤 Pushing clean code to GitHub..."
echo ""

if git push -u origin main; then
    echo ""
    echo "✅✅✅ SUCCESS! Your code is now on GitHub!"
    echo ""
    echo "📂 Check it here:"
    echo "   https://github.com/RootHaktivity/github-search"
    echo ""
    echo "🎉 No more secret scanning issues!"
    echo ""
    echo "Next steps:"
    echo "  1. Go to https://vercel.com and sign up"
    echo "  2. Import your github-search repository"
    echo "  3. Add environment variable: HF_TOKEN = <your-token>"
    echo "  4. Deploy!"
else
    echo ""
    echo "❌ Push failed. Check the error above."
    exit 1
fi
