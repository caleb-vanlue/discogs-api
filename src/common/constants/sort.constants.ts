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
