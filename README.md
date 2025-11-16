# IPTeaV Manager Frontend

**Version:** 1.0.0  
**Framework:** Angular 19  
**Status:** Complete

Angular 19 frontend for IPTeaV Manager with multi-theme support (TiviMate + Smarters).

## Features Implemented

### Week 1-2: Auth + Theme System ✅
- JWT authentication (login/register)
- Auth guard & interceptor
- Multi-theme support (TiviMate/Smarters)
- Theme toggle functionality

### Week 3: Content Browser ✅
- 4 tabs (Live TV, Movies, Series, Radio)
- Categories grid display
- Items grid per category
- Navigation between content types

### Week 4: Advanced Filtering ✅
- Filter panel (prefix, quality, provider, PPV, replay)
- Filter state management with Signals
- Sidenav layout with filters

### Week 5: VOD & Series UI ✅
- VOD list with quality/platform filters
- Series list with episode count
- Series detail with seasons/episodes
- Episode playback

### Week 6: Video Player ✅
- Plyr + hls.js integration
- .m3u8 stream support
- Quality settings
- Fullscreen player

### Week 7: Search & Favorites ✅
- Full-text search with autocomplete
- Favorites management (add/remove)
- Search results grid
- Favorites page

### Week 8-9: Performance & Polish ✅
- Global loading interceptor
- Error handling (401 auto-logout)
- Lazy load directive for images
- Cache service (5min TTL)
- Performance optimizations (will-change)
- Custom scrollbar styling

## Tech Stack

- **Framework:** Angular 19 (Standalone Components)
- **UI Library:** Angular Material 19
- **State Management:** Signals + Services
- **Video Player:** Plyr 3.7.8 + hls.js 1.5.15
- **Styling:** SCSS + Material Theming
- **Build:** Angular CLI (esbuild)

## Quick Start

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
# Navigate to http://localhost:4200
```

### Build
```bash
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Auth guard
│   │   ├── interceptors/    # Auth, loading, error
│   │   ├── models/          # TypeScript interfaces
│   │   └── services/        # API services
│   ├── shared/
│   │   ├── components/      # Video player, search bar, loading
│   │   ├── directives/      # Lazy load
│   │   └── pipes/           # Safe URL
│   ├── features/
│   │   ├── auth/            # Login, register
│   │   ├── accounts/        # Account management
│   │   ├── content/         # Content browser
│   │   ├── vod/             # Movies
│   │   ├── series/          # Series & episodes
│   │   ├── player/          # Video player
│   │   ├── search/          # Search page
│   │   └── favorites/       # Favorites page
│   └── themes/              # TiviMate + Smarters themes
├── assets/                  # Static assets
└── styles/                  # Global styles
```

## Backend Integration

**Backend API:** http://localhost:8080/api  
**Backend Version:** 3.3.0

## Routes

- `/login` - Login page
- `/register` - Registration page
- `/accounts` - Account management
- `/content` - Content browser (Live TV, Movies, Series, Radio)
- `/vod` - Movies list
- `/series` - Series list
- `/series/:id` - Series detail with episodes
- `/player` - Video player
- `/search` - Search page
- `/favorites` - Favorites page

## Performance Features

- Global loading state with request counter
- HTTP error handling with auto-logout
- Image lazy loading with IntersectionObserver
- API response caching (5min TTL)
- CSS will-change for animations
- Custom scrollbar styling

## Themes

### TiviMate
- Dark theme with blue accents (#2196f3)
- Dark backgrounds (#1a1a1a, #2a2a2a)

### Smarters
- Purple gradient theme (#9c27b0)
- Dark blue backgrounds (#0f0f1e, #1a1a2e)

Switch themes with the theme toggle button in the header.

## Development Time

- **Total:** 9 weeks
- **Status:** 100% Complete

## License

Private project
