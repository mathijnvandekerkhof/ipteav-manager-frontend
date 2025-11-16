export interface VodItem {
  id: number;
  name: string;
  streamUrl: string;
  logo?: string;
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  releaseDate?: string;
  rating?: number;
  duration?: string;
  quality?: string;
  platform?: string;
}

export interface Series {
  id: number;
  name: string;
  logo?: string;
  plot?: string;
  cast?: string;
  genre?: string;
  releaseDate?: string;
  rating?: number;
  network?: string;
  episodeCount?: number;
}

export interface Episode {
  id: number;
  seriesId: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  plot?: string;
  duration?: string;
  releaseDate?: string;
  streamUrl: string;
}
