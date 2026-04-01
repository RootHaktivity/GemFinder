# Hidden Gem Search — Full Feature Upgrade

## Features to implement (in order)

- [x] 1. Advanced filters (language, min_stars, sort, active_only) — backend + frontend
- [x] 2. Search history (localStorage chips below search bar)
- [x] 3. Bookmark repos (localStorage + Saved tab)
- [x] 4. Copy `git clone` URL button on each card
- [x] 5. Skeleton loading cards (replace spinner)
- [x] 6. Share search URL (sync ?q= + filters in browser URL)
- [x] 7. "Hidden Gem" score badge (stars/age heuristic)
- [x] 8. Trending 🔥 badge (pushed in last 7 days)
- [x] 9. Result caching (sessionStorage, 5 min TTL)
- [x] 10. Pagination ("Load More" button)

## Files created/modified

### New files
- [x] frontend/src/components/SkeletonCard.jsx
- [x] frontend/src/hooks/useBookmarks.js
- [x] frontend/src/hooks/useSearchHistory.js

### Modified files
- [x] api/search.js — advanced params + richer metadata
- [x] frontend/src/services/githubSearch.js — filters, caching, pagination
- [x] frontend/src/components/SearchBar.jsx — advanced panel + history chips
- [x] frontend/src/components/RepoCard.jsx — richer card (all new badges/buttons)
- [x] frontend/src/App.jsx — wire everything together
