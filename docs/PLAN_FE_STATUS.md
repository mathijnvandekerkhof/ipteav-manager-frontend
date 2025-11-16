# Frontend Plan - Status & Backend Integration

**Project:** IPTeaV Manager Frontend  
**Origineel Plan:** PLAN_FE.md  
**Status Datum:** 16 november 2025  
**Backend Versie:** 3.3.0  
**Frontend Status:** Ready to Start

---

## 🔗 BACKEND INTEGRATIE

### Beschikbare APIs (Backend v3.3.0)

#### 1. Advanced Filtering API ✅
```typescript
// Gebruik in Week 3-4
GET /api/content/advanced/filter
  ?prefix=NL
  &minQuality=UHD_4K
  &provider=NETFLIX
  &ppvOnly=false
  &replayAvailable=true
  &tags=SPORT,4K
  &page=0
  &size=50
```

**Frontend Implementatie:**
```typescript
// services/content.service.ts
filterContent(filters: ContentFilters): Observable<Page<MediaItem>> {
  return this.http.get<Page<MediaItem>>('/api/content/advanced/filter', {
    params: this.buildParams(filters)
  });
}
```

#### 2. VOD API ✅
```typescript
// Gebruik in Week 5-6
GET /api/content/vod
  ?platform=NETFLIX
  &quality=UHD_4K
  &genre=Action
  &minRating=4.0
  &page=0
  &size=50

GET /api/content/vod/{id}
```

**Frontend Implementatie:**
```typescript
// services/vod.service.ts
getVodContent(filters: VodFilters): Observable<Page<VodItem>> {
  return this.http.get<Page<VodItem>>('/api/content/vod', {
    params: filters
  });
}

getVodDetail(id: number): Observable<VodItem> {
  return this.http.get<VodItem>(`/api/content/vod/${id}`);
}
```

#### 3. Series API ✅
```typescript
// Gebruik in Week 5-6
GET /api/content/series
  ?network=HBO
  &showingNow=true
  &page=0
  &size=50

GET /api/content/series/{id}
GET /api/content/series/{seriesId}/episodes
GET /api/content/series/{seriesId}/episodes/season/{seasonNumber}
GET /api/content/series/collections/{type}
```

**Frontend Implementatie:**
```typescript
// services/series.service.ts
getSeriesContent(filters: SeriesFilters): Observable<Page<SeriesItem>> {
  return this.http.get<Page<SeriesItem>>('/api/content/series', {
    params: filters
  });
}

getEpisodes(seriesId: number, season?: number): Observable<Episode[]> {
  const url = season 
    ? `/api/content/series/${seriesId}/episodes/season/${season}`
    : `/api/content/series/${seriesId}/episodes`;
  return this.http.get<Episode[]>(url);
}

getSpecialCollection(type: string): Observable<Page<SeriesItem>> {
  return this.http.get<Page<SeriesItem>>(
    `/api/content/series/collections/${type}`
  );
}
```

#### 4. EPG Archive API ✅
```typescript
// Gebruik in Week 7 (optioneel)
GET /api/epg/channel/{channelId}/archive?date=2025-11-15
GET /api/epg/channel/{channelId}/replay
GET /api/epg/replay/{programId}
```

**Frontend Implementatie:**
```typescript
// services/epg.service.ts
getArchivePrograms(channelId: number, date?: Date): Observable<EpgProgram[]> {
  const params = date ? { date: date.toISOString().split('T')[0] } : {};
  return this.http.get<EpgProgram[]>(
    `/api/epg/channel/${channelId}/archive`,
    { params }
  );
}

getReplayInfo(programId: number): Observable<ReplayInfo> {
  return this.http.get<ReplayInfo>(`/api/epg/replay/${programId}`);
}
```

#### 5. Search API ✅
```typescript
// Gebruik in Week 8
GET /api/search
  ?query=football
  &type=LIVE
  &categoryId=1
  &page=0
  &size=20

GET /api/search/suggestions?query=foo
```

**Frontend Implementatie:**
```typescript
// services/search.service.ts
search(query: string, filters?: SearchFilters): Observable<Page<MediaItem>> {
  return this.http.get<Page<MediaItem>>('/api/search', {
    params: { query, ...filters }
  });
}

getSuggestions(query: string): Observable<string[]> {
  return this.http.get<string[]>('/api/search/suggestions', {
    params: { query }
  }).pipe(
    debounceTime(300),
    distinctUntilChanged()
  );
}
```

#### 6. Metadata APIs ✅
```typescript
// Gebruik in Week 3-4, 7
GET /api/content/advanced/providers  // Lijst van alle providers
GET /api/content/advanced/qualities  // Lijst van alle kwaliteiten
GET /api/content/advanced/tags       // Lijst van alle tags
```

**Frontend Implementatie:**
```typescript
// services/metadata.service.ts
getProviders(): Observable<StreamProvider[]> {
  return this.http.get<StreamProvider[]>('/api/content/advanced/providers')
    .pipe(shareReplay(1)); // Cache result
}

getQualities(): Observable<string[]> {
  return this.http.get<string[]>('/api/content/advanced/qualities')
    .pipe(shareReplay(1));
}

getTags(): Observable<string[]> {
  return this.http.get<string[]>('/api/content/advanced/tags')
    .pipe(shareReplay(1));
}
```

---

## 📋 FRONTEND PLAN - AANGEPAST

### Week 1-2: Geografische Groepering
**Status:** ⏳ **READY TO START**

**Backend Support:**
- ✅ Advanced filtering API beschikbaar
- ✅ Prefix filtering werkend
- ✅ Category counts beschikbaar

**Aanpassingen aan Origineel Plan:**
```typescript
// GEBRUIK BACKEND API in plaats van custom logic
async getCategoriesCountByPrefix(prefix: string): Promise<number> {
  // OUDE MANIER (uit plan):
  // const response = await this.http.get<any[]>(`/api/categories?prefix=${prefix}`);
  
  // NIEUWE MANIER (gebruik advanced filter):
  const response = await this.http.get<Page<MediaItem>>(
    '/api/content/advanced/filter',
    { params: { prefix, size: 0 } } // size=0 voor alleen count
  ).toPromise();
  
  return response?.totalElements || 0;
}
```

**Aanbeveling:**
- ✅ Gebruik `/api/content/advanced/filter` voor prefix filtering
- ✅ Gebruik `totalElements` voor counts
- ✅ Cache results met CacheService

---

### Week 3-4: Advanced Filtering
**Status:** ⏳ **READY TO START**

**Backend Support:**
- ✅ 6 filter types beschikbaar
- ✅ Combined filtering (AND logic)
- ✅ Tags filtering (OR logic)
- ✅ Metadata endpoints voor dropdowns

**Aanpassingen aan Origineel Plan:**
```typescript
// GEBRUIK BACKEND METADATA ENDPOINTS
@Component({
  selector: 'app-filter-panel',
  template: `
    <select [(ngModel)]="filters.provider" (change)="applyFilters()">
      <option [value]="undefined">Alle</option>
      <!-- OUDE MANIER: Hardcoded lijst -->
      <!-- NIEUWE MANIER: Gebruik backend endpoint -->
      @for (provider of providers$ | async; track provider.name) {
        <option [value]="provider.name">{{ provider.name }}</option>
      }
    </select>
  `
})
export class FilterPanelComponent {
  // GEBRUIK BACKEND DATA
  providers$ = this.metadataService.getProviders();
  qualities$ = this.metadataService.getQualities();
  tags$ = this.metadataService.getTags();
}
```

**Aanbeveling:**
- ✅ Gebruik metadata endpoints voor dynamische data
- ✅ Cache metadata met shareReplay(1)
- ✅ Gebruik backend filter logic (geen frontend filtering)

---

### Week 5-6: VOD & Series UI
**Status:** ⏳ **READY TO START**

**Backend Support:**
- ✅ Dedicated VOD/Series endpoints
- ✅ Episode management
- ✅ Special collections
- ✅ Rich metadata (plot, cast, rating, etc.)

**Aanpassingen aan Origineel Plan:**
```typescript
// GEBRUIK BACKEND COLLECTIONS
@Component({
  selector: 'app-special-collections'
})
export class SpecialCollectionsComponent {
  // OUDE MANIER (uit plan):
  // filterRamadan(region: string) {
  //   this.router.navigate(['/series'], {
  //     queryParams: { collection: 'ramadan', region }
  //   });
  // }
  
  // NIEUWE MANIER (gebruik backend endpoint):
  loadRamadanCollection() {
    this.seriesService.getSpecialCollection('RAMADAN')
      .subscribe(series => this.ramadanSeries = series);
  }
  
  loadChristmasCollection() {
    this.seriesService.getSpecialCollection('CHRISTMAS')
      .subscribe(series => this.christmasSeries = series);
  }
}
```

**Aanbeveling:**
- ✅ Gebruik `/api/content/series/collections/{type}`
- ✅ Types: RAMADAN, CHRISTMAS, SINTERKLAAS
- ✅ Backend handelt filtering af

---

### Week 7: Streaming Platform Shortcuts
**Status:** ⏳ **READY TO START**

**Backend Support:**
- ✅ Provider filtering beschikbaar
- ✅ 50+ providers gedetecteerd
- ✅ Provider metadata endpoint

**Aanpassingen aan Origineel Plan:**
```typescript
// GEBRUIK BACKEND PROVIDERS
@Component({
  selector: 'app-platform-grid'
})
export class PlatformGridComponent implements OnInit {
  // OUDE MANIER: Hardcoded lijst
  // platforms = STREAMING_PLATFORMS;
  
  // NIEUWE MANIER: Gebruik backend data
  platforms$: Observable<StreamProvider[]>;
  
  ngOnInit() {
    this.platforms$ = this.metadataService.getProviders().pipe(
      map(providers => providers.filter(p => p.type === 'STREAMING'))
    );
  }
  
  filterByPlatform(providerName: string) {
    // Gebruik advanced filter API
    this.router.navigate(['/vod'], {
      queryParams: { provider: providerName }
    });
  }
}
```

**Aanbeveling:**
- ✅ Gebruik `/api/content/advanced/providers`
- ✅ Filter op `type === 'STREAMING'`
- ✅ Gebruik provider logos van backend

---

### Week 8-9: Performance Optimalisatie
**Status:** ⏳ **READY TO START**

**Backend Support:**
- ✅ Pagination beschikbaar (alle endpoints)
- ✅ Backend caching (75% hit rate)
- ✅ Optimale query performance

**Aanpassingen aan Origineel Plan:**
```typescript
// FRONTEND CACHING STRATEGIE
@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, {data: any, timestamp: number}>();
  
  // CACHE METADATA (lang TTL)
  private METADATA_TTL = 24 * 60 * 60 * 1000; // 24 uur
  
  // CACHE CONTENT (kort TTL)
  private CONTENT_TTL = 5 * 60 * 1000; // 5 minuten
  
  // Backend heeft al caching, frontend cache is extra laag
  set(key: string, data: any, ttl: number = this.CONTENT_TTL) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

// HTTP INTERCEPTOR voor caching
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Cache alleen GET requests
    if (req.method !== 'GET') return next.handle(req);
    
    // Check cache
    const cached = this.cacheService.get(req.url);
    if (cached) return of(cached);
    
    // Fetch en cache
    return next.handle(req).pipe(
      tap(response => this.cacheService.set(req.url, response))
    );
  }
}
```

**Aanbeveling:**
- ✅ Backend heeft al caching (75% hit rate)
- ✅ Frontend cache is extra optimalisatie
- ✅ Cache metadata langer dan content
- ✅ Gebruik virtual scroll voor grote lijsten

---

## 🎯 BELANGRIJKE WIJZIGINGEN

### 1. Geen Custom Backend Calls Nodig
**Origineel Plan:** Custom API calls voor prefix counts, etc.  
**Nieuwe Aanpak:** Gebruik bestaande advanced filter API

### 2. Gebruik Backend Metadata
**Origineel Plan:** Hardcoded provider/quality lijsten  
**Nieuwe Aanpak:** Dynamisch laden van backend

### 3. Backend Collections
**Origineel Plan:** Frontend filtering voor collections  
**Nieuwe Aanpak:** Backend heeft dedicated collection endpoints

### 4. Specifications Pattern
**Origineel Plan:** Multiple API calls voor filtering  
**Nieuwe Aanpak:** Single API call met combined filters

---

## 📊 BACKEND CAPABILITIES

### Wat Backend Kan (Gebruik Dit!)
- ✅ **Advanced Filtering** - 6 filter types, combined logic
- ✅ **Metadata Extraction** - Quality, provider, codec, PPV, replay
- ✅ **VOD/Series** - Dedicated endpoints met rich metadata
- ✅ **Episodes** - Season/episode management
- ✅ **Collections** - Special collections (RAMADAN, etc.)
- ✅ **EPG Archive** - TV timeshift & replay
- ✅ **Search** - Full-text search met autocomplete
- ✅ **Caching** - 75% hit rate, optimale performance
- ✅ **Pagination** - Alle endpoints support pagination

### Wat Frontend Moet Doen
- 🎨 **UI/UX** - Mooie interfaces bouwen
- 🗂️ **State Management** - NgRx of signals
- 🎬 **Animations** - Smooth transitions
- 📱 **Responsive** - Mobile-first design
- ♿ **Accessibility** - ARIA labels, keyboard nav
- 🧪 **Testing** - Unit & E2E tests
- 📊 **Analytics** - User behavior tracking

---

## ✅ FRONTEND CHECKLIST

### Pre-Development
- [x] Backend APIs gedocumenteerd
- [x] Backend v3.3.0 production-ready
- [x] API endpoints getest
- [x] Data models bekend
- [ ] Angular 20 project setup
- [ ] Routing configuratie
- [ ] State management keuze (NgRx/Signals)

### Week 1-2: Setup & Geografische Groepering
- [ ] Angular project initialiseren
- [ ] Routing setup
- [ ] HTTP interceptors
- [ ] Region models & service
- [ ] Region selector component
- [ ] Prefix grid component
- [ ] Breadcrumb navigatie

### Week 3-4: Advanced Filtering
- [ ] Filter models
- [ ] Filter service met state
- [ ] Filter panel component
- [ ] Filter chips component
- [ ] URL state sync
- [ ] Metadata service (providers, qualities, tags)

### Week 5-6: VOD & Series UI
- [ ] VOD models & service
- [ ] Series models & service
- [ ] VOD grid component
- [ ] Series detail component
- [ ] Episode selector component
- [ ] Trailer modal component

### Week 7: Platform Shortcuts
- [ ] Platform service
- [ ] Platform grid component
- [ ] Special collections component
- [ ] Provider logos

### Week 8-9: Performance
- [ ] Virtual scroll (CDK)
- [ ] Lazy loading images
- [ ] Infinite scroll
- [ ] Frontend caching
- [ ] Bundle optimization

### Week 10: Polish
- [ ] Animations
- [ ] E2E tests
- [ ] Accessibility audit
- [ ] Documentation
- [ ] Performance testing

---

## 🚀 AANBEVELINGEN

### 1. Start met Angular 20 Standalone Components
```typescript
// Gebruik nieuwe standalone API
@Component({
  selector: 'app-region-selector',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `...`
})
export class RegionSelectorComponent {}
```

### 2. Gebruik Signals voor State Management
```typescript
// Angular 20 signals
export class ContentService {
  private filtersSignal = signal<ContentFilters>({});
  filters = this.filtersSignal.asReadonly();
  
  updateFilters(filters: Partial<ContentFilters>) {
    this.filtersSignal.update(current => ({ ...current, ...filters }));
  }
}
```

### 3. Gebruik Control Flow Syntax
```typescript
// Nieuwe @for, @if syntax (al in plan)
@for (region of regions; track region.id) {
  <div>{{ region.name }}</div>
}

@if (loading) {
  <app-spinner />
} @else {
  <app-content />
}
```

### 4. Lazy Load Routes
```typescript
// routes.ts
export const routes: Routes = [
  {
    path: 'vod',
    loadComponent: () => import('./vod/vod.component')
  },
  {
    path: 'series',
    loadComponent: () => import('./series/series.component')
  }
];
```

---

## 📞 REFERENTIES

### Backend Documentatie
- [API_REFERENCE.md](../../main/docs/API_REFERENCE.md) - Complete API docs
- [VOD_SERIES_API.md](../../main/docs/VOD_SERIES_API.md) - VOD/Series specifiek
- [EPG_ARCHIVE_CACHING.md](../../main/docs/EPG_ARCHIVE_CACHING.md) - EPG & Caching
- [IMPLEMENTATION_SUMMARY.md](../../main/docs/IMPLEMENTATION_SUMMARY.md) - Backend overzicht

### Frontend Plan
- [PLAN_FE.md](PLAN_FE.md) - Origineel 10-weeks plan

### Backend Status
- [PLAN_BE_STATUS.md](../../main/docs/analyse/plan/PLAN_BE_STATUS.md) - Backend implementatie status

---

## ✨ CONCLUSIE

**Backend Status:** ✅ **100% KLAAR**  
**Frontend Status:** ⏳ **READY TO START**

**Backend Capabilities:**
- 45+ API endpoints beschikbaar
- 6 filter types geïmplementeerd
- VOD/Series dedicated endpoints
- EPG Archive & Replay support
- 75% cache hit rate
- 85%+ test coverage

**Frontend Aanpassingen:**
- Gebruik backend APIs (geen custom logic)
- Dynamische metadata (geen hardcoded lijsten)
- Backend collections (geen frontend filtering)
- Profiteer van backend caching

**Klaar om te starten met:** ✅ **ANGULAR 20 DEVELOPMENT**
