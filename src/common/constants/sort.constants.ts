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

export type ReleaseSortField =
  | 'title'
  | 'primaryArtist'
  | 'year'
  | 'primaryGenre'
  | 'createdAt';

export const COLLECTION_SORT_OPTIONS: {
  field: CollectionSortField;
  label: string;
}[] = [
  { field: 'dateAdded', label: 'Date Added' },
  { field: 'title', label: 'Title' },
  { field: 'primaryArtist', label: 'Artist' },
  { field: 'year', label: 'Year' },
  { field: 'rating', label: 'Rating' },
  { field: 'primaryGenre', label: 'Genre' },
  { field: 'primaryFormat', label: 'Format' },
];

export const WANTLIST_SORT_OPTIONS: {
  field: WantlistSortField;
  label: string;
}[] = [
  { field: 'dateAdded', label: 'Date Added' },
  { field: 'title', label: 'Title' },
  { field: 'primaryArtist', label: 'Artist' },
  { field: 'year', label: 'Year' },
  { field: 'primaryGenre', label: 'Genre' },
  { field: 'primaryFormat', label: 'Format' },
];

export const DEFAULT_LIMIT = 50;
export const DEFAULT_OFFSET = 0;
export const DEFAULT_SORT_ORDER: SortOrder = 'DESC';
