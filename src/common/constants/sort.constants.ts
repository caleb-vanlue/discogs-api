export type SortOrder = 'ASC' | 'DESC';

export type CollectionSortField =
  | 'dateAdded'
  | 'title'
  | 'primaryArtist'
  | 'year'
  | 'rating'
  | 'primaryGenre'
  | 'primaryFormat';

export type WantlistSortField =
  | 'dateAdded'
  | 'title'
  | 'primaryArtist'
  | 'year'
  | 'primaryGenre'
  | 'primaryFormat';

export const DEFAULT_LIMIT = 50;
export const DEFAULT_OFFSET = 0;
export const DEFAULT_SORT_ORDER: SortOrder = 'DESC';

export function mapCollectionSortField(sortBy?: string): CollectionSortField {
  const mapping: Record<string, CollectionSortField> = {
    added: 'dateAdded',
    date_added: 'dateAdded',
    dateAdded: 'dateAdded',
    title: 'title',
    artist: 'primaryArtist',
    primaryArtist: 'primaryArtist',
    year: 'year',
    rating: 'rating',
    genre: 'primaryGenre',
    primaryGenre: 'primaryGenre',
    format: 'primaryFormat',
    primaryFormat: 'primaryFormat',
  };
  return mapping[sortBy || 'added'] || 'dateAdded';
}

export function mapWantlistSortField(sortBy?: string): WantlistSortField {
  const mapping: Record<string, WantlistSortField> = {
    added: 'dateAdded',
    date_added: 'dateAdded',
    dateAdded: 'dateAdded',
    title: 'title',
    artist: 'primaryArtist',
    primaryArtist: 'primaryArtist',
    year: 'year',
    genre: 'primaryGenre',
    primaryGenre: 'primaryGenre',
    format: 'primaryFormat',
    primaryFormat: 'primaryFormat',
  };
  return mapping[sortBy || 'added'] || 'dateAdded';
}

export function mapSortOrder(sortOrder?: string): SortOrder {
  const order = sortOrder?.toLowerCase();
  return order === 'asc' || order === 'ascending' ? 'ASC' : 'DESC';
}
