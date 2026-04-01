#!/bin/bash
# GITHUB SETUP SCRIPT FOR ROOTHAKTIVITY
# Your GitHub username: RootHaktivity
# Run this after creating the repo at https://github.com/new

cd /home/leegion/Downloads/code/Github-Search

# Configure git with your identity
git config --global user.email "developer@github.com"
git config --global user.name "RootHaktivity"

# Add remote origin
git remote add origin https://github.com/RootHaktivity/github-search.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main

echo "✅ Code pushed to GitHub!"
echo "Your repo is now at: https://github.com/RootHaktivity/github-search"
