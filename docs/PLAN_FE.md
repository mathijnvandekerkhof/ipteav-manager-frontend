# Frontend Verbeterings- en Optimalisatieplan

**Project:** IPTeaV Manager Frontend  
**Versie:** 3.0.0  
**Datum:** 16 november 2025  
**Duur:** 10 weken  
**Gebaseerd op:** ANALYSE_FE.md

---

## 🎯 DOELSTELLINGEN

### Primaire Doelen
1. **Geografische Groepering** - 80+ prefixes organiseren in 4 regio's
2. **Advanced Filtering** - Filter op kwaliteit, provider, features
3. **VOD/Series UI** - Dedicated interfaces voor movies en series
4. **Performance** - 60% snellere laadtijden via virtual scroll
5. **Smart Search** - Autocomplete met multi-type zoeken

### Meetbare Resultaten
- 70% sneller content vinden
- 50% minder klikken nodig
- 90% betere overzichtelijkheid
- 60% snellere laadtijden

---

## 📅 IMPLEMENTATIE ROADMAP

### Week 1-2: Geografische Groepering

**Doel:** 80+ prefixes organiseren in regio's

**Tasks:**
1. Region grouping service implementeren
2. Region selector component
3. Prefix cards met counts
4. Breadcrumb navigatie

**Deliverables:**
```typescript
// models/region.model.ts
export interface RegionGroup {
  id: string;
  name: string;
  icon: string;
  prefixes: string[];
  color: string;
}

export const REGIONS: RegionGroup[] = [
  {
    id: 'europa',
    name: 'Europa',
    icon: '🌍',
    prefixes: ['NL', 'BE', 'DE', 'UK', 'FR', 'ES', 'IT', 'PT'],
    color: '#4CAF50'
  },
  {
    id: 'amerika',
    name: 'Amerika',
    icon: '🌎',
    prefixes: ['USA', 'CA', 'BR', 'MX', 'ARG'],
    color: '#2196F3'
  },
  {
    id: 'azie',
    name: 'Azië & Midden-Oosten',
    icon: '🌏',
    prefixes: ['ASIA', 'AR', 'TR', 'IR', 'PK'],
    color: '#FF9800'
  },
  {
    id: 'sport',
    name: 'Sport Internationaal',
    icon: '⚽',
    prefixes: ['UCL', 'PPV', 'MOTOGP', 'MXGP'],
    color: '#F44336'
  }
];

// services/region.service.ts
@Injectable({ providedIn: 'root' })
export class RegionService {
  
  getRegionByPrefix(prefix: string): RegionGroup | undefined {
    return REGIONS.find(r => r.prefixes.includes(prefix));
  }
  
  getPrefixesByRegion(regionId: string): string[] {
    return REGIONS.find(r => r.id === regionId)?.prefixes || [];
  }
  
  async getCategoriesCountByPrefix(prefix: string): Promise<number> {
    const response = await this.http.get<any[]>(
      `/api/categories?prefix=${prefix}`
    ).toPromise();
    return response?.length || 0;
  }
}

// components/region-selector/region-selector.component.ts
@Component({
  selector: 'app-region-selector',
  template: `
    <div class="region-grid">
      @for (region of regions; track region.id) {
        <div class="region-card" 
             [style.border-color]="region.color"
             (click)="selectRegion(region)">
          <span class="region-icon">{{ region.icon }}</span>
          <h3>{{ region.name }}</h3>
          <p>{{ region.prefixes.length }} landen</p>
        </div>
      }
    </div>
  `
})
export class RegionSelectorComponent {
  regions = REGIONS;
  
  selectRegion(region: RegionGroup) {
    this.router.navigate(['/content', region.id]);
  }
}

// components/prefix-grid/prefix-grid.component.ts
@Component({
  selector: 'app-prefix-grid',
  template: `
    <div class="prefix-grid">
      @for (prefix of prefixes; track prefix) {
        <div class="prefix-card" (click)="selectPrefix(prefix)">
          <span class="prefix-flag">{{ getFlag(prefix) }}</span>
          <h4>{{ prefix }}</h4>
          <p>{{ counts[prefix] || 0 }} groepen</p>
        </div>
      }
    </div>
  `
})
export class PrefixGridComponent implements OnInit {
  @Input() regionId!: string;
  prefixes: string[] = [];
  counts: Record<string, number> = {};
  
  ngOnInit() {
    this.prefixes = this.regionService.getPrefixesByRegion(this.regionId);
    this.loadCounts();
  }
  
  async loadCounts() {
    for (const prefix of this.prefixes) {
      this.counts[prefix] = await this.regionService.getCategoriesCountByPrefix(prefix);
    }
  }
}
```

**Styling:**
```scss
.region-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.region-card {
  padding: 2rem;
  border: 3px solid;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .region-icon {
    font-size: 3rem;
  }
}

.prefix-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.prefix-card {
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  
  &:hover {
    background: #f5f5f5;
  }
}
```

---

### Week 3-4: Advanced Filtering

**Doel:** Multi-criteria filtering implementeren

**Tasks:**
1. Filter service met state management
2. Filter panel component
3. Filter chips voor actieve filters
4. URL state synchronisatie

**Deliverables:**
```typescript
// models/filter.model.ts
export interface ContentFilters {
  region?: string;
  prefix?: string;
  minQuality?: 'SD' | 'HD' | 'FHD' | '4K' | '8K';
  contentType?: 'LIVE' | 'VOD' | 'SERIES' | 'RADIO';
  provider?: string;
  hasReplay?: boolean;
  isPPV?: boolean;
  hasEPG?: boolean;
  sortBy?: 'name' | 'quality' | 'added' | 'popular';
  tags?: string[];
}

// services/filter.service.ts
@Injectable({ providedIn: 'root' })
export class FilterService {
  private filtersSubject = new BehaviorSubject<ContentFilters>({});
  filters$ = this.filtersSubject.asObservable();
  
  updateFilters(filters: Partial<ContentFilters>) {
    const current = this.filtersSubject.value;
    this.filtersSubject.next({ ...current, ...filters });
    this.syncToUrl(this.filtersSubject.value);
  }
  
  clearFilters() {
    this.filtersSubject.next({});
    this.router.navigate([], { queryParams: {} });
  }
  
  private syncToUrl(filters: ContentFilters) {
    this.router.navigate([], {
      queryParams: filters,
      queryParamsHandling: 'merge'
    });
  }
  
  loadFromUrl() {
    this.route.queryParams.subscribe(params => {
      this.filtersSubject.next(params as ContentFilters);
    });
  }
}

// components/filter-panel/filter-panel.component.ts
@Component({
  selector: 'app-filter-panel',
  template: `
    <div class="filter-panel">
      <h3>Filters</h3>
      
      <div class="filter-group">
        <label>Kwaliteit</label>
        <select [(ngModel)]="filters.minQuality" (change)="applyFilters()">
          <option [value]="undefined">Alle</option>
          <option value="HD">HD+</option>
          <option value="FHD">Full HD+</option>
          <option value="4K">4K+</option>
          <option value="8K">8K</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Provider</label>
        <select [(ngModel)]="filters.provider" (change)="applyFilters()">
          <option [value]="undefined">Alle</option>
          @for (provider of providers; track provider) {
            <option [value]="provider">{{ provider }}</option>
          }
        </select>
      </div>
      
      <div class="filter-group">
        <label>
          <input type="checkbox" [(ngModel)]="filters.hasReplay" (change)="applyFilters()">
          Alleen met Replay
        </label>
      </div>
      
      <div class="filter-group">
        <label>
          <input type="checkbox" [(ngModel)]="filters.isPPV" (change)="applyFilters()">
          PPV Events
        </label>
      </div>
      
      <button (click)="clearFilters()" class="clear-btn">
        Wis Filters
      </button>
    </div>
  `
})
export class FilterPanelComponent implements OnInit {
  filters: ContentFilters = {};
  providers = ['NETFLIX', 'DAZN', 'SKY', 'DISNEY+', 'AMAZON PRIME'];
  
  ngOnInit() {
    this.filterService.filters$.subscribe(f => this.filters = f);
  }
  
  applyFilters() {
    this.filterService.updateFilters(this.filters);
  }
  
  clearFilters() {
    this.filterService.clearFilters();
  }
}

// components/filter-chips/filter-chips.component.ts
@Component({
  selector: 'app-filter-chips',
  template: `
    <div class="filter-chips">
      @for (chip of activeChips; track chip.key) {
        <div class="chip">
          <span>{{ chip.label }}: {{ chip.value }}</span>
          <button (click)="removeFilter(chip.key)">×</button>
        </div>
      }
    </div>
  `
})
export class FilterChipsComponent implements OnInit {
  activeChips: Array<{key: string, label: string, value: string}> = [];
  
  ngOnInit() {
    this.filterService.filters$.subscribe(filters => {
      this.activeChips = this.buildChips(filters);
    });
  }
  
  buildChips(filters: ContentFilters) {
    const chips = [];
    if (filters.minQuality) chips.push({key: 'minQuality', label: 'Kwaliteit', value: filters.minQuality});
    if (filters.provider) chips.push({key: 'provider', label: 'Provider', value: filters.provider});
    if (filters.hasReplay) chips.push({key: 'hasReplay', label: 'Replay', value: 'Ja'});
    if (filters.isPPV) chips.push({key: 'isPPV', label: 'PPV', value: 'Ja'});
    return chips;
  }
  
  removeFilter(key: string) {
    this.filterService.updateFilters({ [key]: undefined });
  }
}
```

---

### Week 5-6: VOD & Series UI

**Doel:** Dedicated interfaces voor movies en series

**Tasks:**
1. VOD grid component met posters
2. Series detail component met backdrop
3. Episode selector
4. Trailer modal

**Deliverables:**
```typescript
// components/vod-grid/vod-grid.component.ts
@Component({
  selector: 'app-vod-grid',
  template: `
    <div class="vod-grid">
      @for (item of vodItems; track item.stream_id) {
        <div class="vod-card" (click)="selectVod(item)">
          <img [src]="item.stream_icon" [alt]="item.name" loading="lazy">
          <div class="vod-info">
            <h4>{{ item.name }}</h4>
            <div class="badges">
              @if (item.container_extension === 'mkv') {
                <span class="badge badge-format">MKV</span>
              }
              @if (item.rating_5based > 0) {
                <span class="badge badge-rating">⭐ {{ item.rating_5based }}</span>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class VodGridComponent {
  @Input() vodItems: VodItem[] = [];
  
  selectVod(item: VodItem) {
    this.router.navigate(['/vod', item.stream_id]);
  }
}

// components/series-detail/series-detail.component.ts
@Component({
  selector: 'app-series-detail',
  template: `
    <div class="series-detail">
      <div class="series-backdrop" 
           [style.background-image]="'url(' + series.backdrop_path[0] + ')'">
      </div>
      
      <div class="series-content">
        <img [src]="series.cover" [alt]="series.name" class="series-cover">
        
        <div class="series-info">
          <h1>{{ series.name }}</h1>
          
          @if (isShowingNow(series)) {
            <span class="badge badge-live">🔴 Nu te Zien</span>
          }
          
          <p class="series-plot">{{ series.plot }}</p>
          
          <div class="series-meta">
            <span>🎬 {{ series.director }}</span>
            <span>🎭 {{ series.cast }}</span>
            <span>📅 {{ series.releaseDate | date }}</span>
            @if (series.episode_run_time) {
              <span>⏱️ {{ series.episode_run_time }} min</span>
            }
          </div>
          
          @if (series.youtube_trailer) {
            <button (click)="playTrailer()" class="trailer-btn">
              ▶️ Trailer
            </button>
          }
        </div>
      </div>
      
      <app-episode-selector [seriesId]="series.series_id"></app-episode-selector>
    </div>
  `
})
export class SeriesDetailComponent implements OnInit {
  @Input() seriesId!: number;
  series!: Series;
  
  ngOnInit() {
    this.loadSeries();
  }
  
  async loadSeries() {
    this.series = await this.contentService.getSeries(this.seriesId);
  }
  
  playTrailer() {
    this.trailerService.open(this.series.youtube_trailer);
  }
  
  isShowingNow(series: Series): boolean {
    return series.category_name?.includes('NU TE ZIEN') || false;
  }
}

// components/episode-selector/episode-selector.component.ts
@Component({
  selector: 'app-episode-selector',
  template: `
    <div class="episode-selector">
      <select [(ngModel)]="selectedSeason" (change)="loadEpisodes()">
        @for (season of seasons; track season.number) {
          <option [value]="season.number">Seizoen {{ season.number }}</option>
        }
      </select>
      
      <div class="episode-grid">
        @for (episode of episodes; track episode.id) {
          <div class="episode-card" (click)="playEpisode(episode)">
            <img [src]="episode.thumbnail" [alt]="episode.title">
            <div class="episode-info">
              <span class="episode-number">E{{ episode.number }}</span>
              <span class="episode-title">{{ episode.title }}</span>
              <span class="episode-duration">{{ episode.duration }} min</span>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class EpisodeSelectorComponent implements OnInit {
  @Input() seriesId!: number;
  seasons: Season[] = [];
  episodes: Episode[] = [];
  selectedSeason = 1;
  
  ngOnInit() {
    this.loadSeasons();
  }
  
  async loadSeasons() {
    this.seasons = await this.contentService.getSeasons(this.seriesId);
    this.loadEpisodes();
  }
  
  async loadEpisodes() {
    this.episodes = await this.contentService.getEpisodes(
      this.seriesId, 
      this.selectedSeason
    );
  }
  
  playEpisode(episode: Episode) {
    this.playerService.play(episode.streamUrl);
  }
}
```

**Styling:**
```scss
.vod-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.vod-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  img {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
  }
}

.series-detail {
  .series-backdrop {
    height: 400px;
    background-size: cover;
    background-position: center;
    position: relative;
  }
  
  .series-content {
    display: flex;
    gap: 2rem;
    padding: 2rem;
    margin-top: -100px;
    position: relative;
  }
  
  .series-cover {
    width: 200px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
}

.episode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
```

---

### Week 7: Streaming Platform Shortcuts

**Doel:** Quick access voor populaire platforms

**Tasks:**
1. Platform service met logo's
2. Platform grid component
3. Platform filter integratie
4. Special collections

**Deliverables:**
```typescript
// models/platform.model.ts
export interface StreamingPlatform {
  name: string;
  icon: string;
  color: string;
  prefix: string;
  logo?: string;
}

export const STREAMING_PLATFORMS: StreamingPlatform[] = [
  { name: 'Netflix', icon: '🎬', color: '#E50914', prefix: 'NETFLIX' },
  { name: 'Disney+', icon: '✨', color: '#113CCF', prefix: 'DISNEY+' },
  { name: 'Amazon Prime', icon: '📦', color: '#00A8E1', prefix: 'AMAZON PRIME' },
  { name: 'HBO Max', icon: '🎭', color: '#B100E8', prefix: 'HBOMAX' },
  { name: 'Videoland', icon: '🎥', color: '#FF6600', prefix: 'VIDEOLAND' },
  { name: 'NPO Start', icon: '📺', color: '#0066CC', prefix: 'NPO START' }
];

// components/platform-grid/platform-grid.component.ts
@Component({
  selector: 'app-platform-grid',
  template: `
    <div class="platform-section">
      <h2>Streaming Platforms</h2>
      <div class="platform-grid">
        @for (platform of platforms; track platform.name) {
          <button class="platform-btn"
                  [style.background-color]="platform.color"
                  (click)="filterByPlatform(platform.prefix)">
            <span class="icon">{{ platform.icon }}</span>
            <span class="name">{{ platform.name }}</span>
          </button>
        }
      </div>
    </div>
  `
})
export class PlatformGridComponent {
  platforms = STREAMING_PLATFORMS;
  
  filterByPlatform(prefix: string) {
    this.filterService.updateFilters({ provider: prefix });
    this.router.navigate(['/vod']);
  }
}

// components/special-collections/special-collections.component.ts
@Component({
  selector: 'app-special-collections',
  template: `
    <div class="collections">
      <div class="collection ramadan">
        <h2>🌙 Ramadan 2025</h2>
        <div class="collection-tabs">
          <button (click)="filterRamadan('egypt')">Egypte</button>
          <button (click)="filterRamadan('morocco')">Marokko</button>
          <button (click)="filterRamadan('syria')">Syrië</button>
          <button (click)="filterRamadan('gulf')">Golf</button>
        </div>
      </div>
      
      <div class="collection holiday">
        <h2>🎄 Feestdagen</h2>
        <button (click)="filterSpecial('KERSTFILMS')">🎅 Kerstfilms</button>
        <button (click)="filterSpecial('SINTERKLAAS')">🎁 Sinterklaas</button>
      </div>
    </div>
  `
})
export class SpecialCollectionsComponent {
  filterRamadan(region: string) {
    this.router.navigate(['/series'], {
      queryParams: { collection: 'ramadan', region }
    });
  }
  
  filterSpecial(type: string) {
    this.router.navigate(['/vod'], {
      queryParams: { collection: type }
    });
  }
}
```

---

### Week 8-9: Performance Optimalisatie

**Doel:** Virtual scroll en lazy loading

**Tasks:**
1. Virtual scroll implementeren
2. Image lazy loading
3. Infinite scroll pagination
4. State caching

**Deliverables:**
```typescript
// components/virtual-channel-list/virtual-channel-list.component.ts
@Component({
  selector: 'app-virtual-channel-list',
  template: `
    <cdk-virtual-scroll-viewport itemSize="80" class="channel-viewport">
      <div *cdkVirtualFor="let channel of channels" class="channel-item">
        <img [src]="channel.logo" loading="lazy" [alt]="channel.name">
        <div class="channel-info">
          <h4>{{ channel.name }}</h4>
          <div class="badges">
            @if (channel.quality) {
              <span class="badge">{{ channel.quality }}</span>
            }
            @if (channel.hasReplay) {
              <span class="badge">⏮️</span>
            }
          </div>
        </div>
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class VirtualChannelListComponent {
  @Input() channels: Channel[] = [];
}

// directives/lazy-load.directive.ts
@Directive({
  selector: 'img[appLazyLoad]'
})
export class LazyLoadDirective implements OnInit {
  @Input() appLazyLoad!: string;
  
  ngOnInit() {
    const img = this.el.nativeElement;
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = this.appLazyLoad;
          observer.unobserve(img);
        }
      });
    });
    
    observer.observe(img);
  }
  
  constructor(private el: ElementRef) {}
}

// services/cache.service.ts
@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, {data: any, timestamp: number}>();
  private TTL = 5 * 60 * 1000; // 5 minuten
  
  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  clear() {
    this.cache.clear();
  }
}
```

---

### Week 10: Polish & Testing

**Doel:** Animations, testing en documentatie

**Tasks:**
1. Animations toevoegen
2. E2E tests schrijven
3. Accessibility audit
4. Documentatie

**Deliverables:**
```typescript
// animations/route.animations.ts
export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

// e2e/navigation.spec.ts
describe('Navigation', () => {
  it('should navigate through regions', () => {
    cy.visit('/');
    cy.contains('Europa').click();
    cy.url().should('include', '/content/europa');
    cy.contains('NL').click();
    cy.url().should('include', '/content/europa/NL');
  });
  
  it('should filter by quality', () => {
    cy.visit('/content');
    cy.get('select[name="quality"]').select('4K');
    cy.get('.channel-item').should('contain', '4K');
  });
});

// Accessibility
@Component({
  template: `
    <button [attr.aria-label]="'Filter op ' + filter.name"
            [attr.aria-pressed]="isActive"
            (click)="toggle()">
      {{ filter.name }}
    </button>
  `
})
```

---

## 🧪 TESTING STRATEGIE

### Unit Tests
- Component logic
- Service methods
- Pipe transformations
- 80%+ coverage target

### Integration Tests
- API communication
- State management
- Routing flows

### E2E Tests
- User journeys
- Filter combinations
- Performance benchmarks

---

## 📊 PERFORMANCE METRICS

### Voor Optimalisatie
- Initial load: 3-5s
- Time to interactive: 4-6s
- Scroll FPS: 30-40
- Memory usage: 150MB+

### Na Optimalisatie (Target)
- Initial load: 1-2s (60% verbetering)
- Time to interactive: 2-3s (50% verbetering)
- Scroll FPS: 55-60 (50% verbetering)
- Memory usage: 80-100MB (40% verbetering)

---

## ✅ ACCEPTATIE CRITERIA

### Functioneel
- [ ] Geografische groepering werkend
- [ ] Advanced filtering volledig
- [ ] VOD/Series UI compleet
- [ ] Platform shortcuts operationeel
- [ ] Virtual scroll geïmplementeerd

### Performance
- [ ] Initial load < 2s
- [ ] Smooth scrolling 60fps
- [ ] Memory < 100MB
- [ ] Lighthouse score > 90

### Kwaliteit
- [ ] Test coverage > 80%
- [ ] Accessibility score > 95
- [ ] Zero console errors
- [ ] Documentatie compleet

---

## 🚀 DEPLOYMENT PLAN

### Pre-Deployment
1. Build optimalisatie
2. Bundle size analyse
3. Performance testing
4. Browser compatibility check

### Deployment
1. Staging deployment
2. Smoke tests
3. Production deployment
4. Monitoring activeren

### Post-Deployment
1. Performance monitoring
2. Error tracking
3. User feedback
4. Hotfix readiness

---

## 📈 SUCCESS METRICS

### Week 5 Checkpoint
- Geografische groepering live
- Advanced filtering 80% compleet
- VOD UI prototype klaar

### Week 10 Final
- Alle features live
- Performance targets behaald
- Tests passing
- Documentation compleet

### 1 Maand Post-Launch
- 90%+ user satisfaction
- < 2s avg load time
- 60fps scroll performance
- < 0.5% error rate
