export interface Artist {
  name: string;
  anv: string;
}

export interface BasicInformation {
  id: number;
  title: string;
  year: number;
  thumb: string;
  cover_image: string;
  artists: Artist[];
  labels: Array<{ name: string; catno: string }>;
  formats: Array<{
    name: string;
    qty: string;
    descriptions: string[];
    text?: string;
  }>;
  genres?: string[];
  styles?: string[];
}

export interface DiscogsRelease {
  id: number;
  instance_id?: number;
  rating: number;
  basic_information: BasicInformation;
  notes?: string | Array<{ field_id: number; value: string }>;
  date_added?: string;
  folder_id?: number;
}

export interface Pagination {
  page: number;
  pages: number;
  per_page: number;
  items: number;
}

export interface CollectionResponse {
  pagination: Pagination;
  releases: DiscogsRelease[];
}

export interface WantlistResponse {
  pagination: Pagination;
  wants: DiscogsRelease[];
}

export type SortOption = 'artist' | 'title' | 'rating' | 'added' | 'year';
export type SortOrder = 'asc' | 'desc';

export interface DiscogsQueryParams {
  type?: 'collection' | 'wantlist';
  folder?: string;
  sort?: SortOption;
  sortOrder?: SortOrder;
  page?: number;
  perPage?: number;
}
