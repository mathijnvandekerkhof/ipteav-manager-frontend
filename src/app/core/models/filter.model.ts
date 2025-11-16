export interface FilterOptions {
  prefix?: string;
  quality?: string;
  provider?: string;
  ppvOnly?: boolean;
  replayOnly?: boolean;
  tags?: string[];
}

export interface FilterMetadata {
  providers: string[];
  qualities: string[];
  tags: string[];
}
