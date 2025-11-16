export interface Category {
  id: number;
  normalizedName: string;
  originalName: string;
  itemCount: number;
}

export interface MediaItem {
  id: number;
  streamId: number;
  name: string;
  logo?: string;
  streamUrl: string;
  contentType: string;
  categoryName: string;
}

export type ContentType = 'LIVE' | 'VOD' | 'SERIES' | 'RADIO';
