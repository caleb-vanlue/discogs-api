import { ReleaseDataExtractor } from '../release-data-extractor';
import { BasicInformation } from '../../../discogs/types/discogs.types';

describe('ReleaseDataExtractor', () => {
  describe('extractSortableFields', () => {
    it('should extract all sortable fields from complete basic information', () => {
      const basicInfo: BasicInformation = {
        id: 12345,
        title: 'Test Album',
        year: 2023,
        thumb: 'thumb.jpg',
        cover_image: 'cover.jpg',
        artists: [
          { name: 'Main Artist', anv: '' },
          { name: 'Featured Artist', anv: 'Feat. Artist' },
        ],
        labels: [
          { name: 'Test Label', catno: 'CAT-001' },
          { name: 'Second Label', catno: 'CAT-002' },
        ],
        formats: [
          {
            name: 'Vinyl',
            qty: '2',
            descriptions: ['LP', '45 RPM'],
            text: 'Blue Marble',
          },
        ],
        genres: ['Electronic', 'Ambient'],
        styles: ['Downtempo', 'Experimental'],
      };

      const result = ReleaseDataExtractor.extractSortableFields(basicInfo);

      expect(result).toEqual({
        primaryArtist: 'Main Artist',
        allArtists: 'Main Artist, Featured Artist',
        primaryGenre: 'Electronic',
        primaryStyle: 'Downtempo',
        primaryFormat: 'Vinyl',
        vinylColor: 'Blue Marble',
        catalogNumber: 'CAT-001',
        recordLabel: 'Test Label',
      });
    });

    it('should handle missing optional fields', () => {
      const basicInfo: BasicInformation = {
        id: 12345,
        title: 'Test Album',
        year: 2023,
        thumb: 'thumb.jpg',
        cover_image: 'cover.jpg',
        artists: [{ name: 'Artist', anv: '' }],
        labels: [{ name: 'Label', catno: 'CAT-001' }],
        formats: [{ name: 'CD', qty: '1', descriptions: [] }],
        // genres and styles are optional and missing
      };

      const result = ReleaseDataExtractor.extractSortableFields(basicInfo);

      expect(result).toEqual({
        primaryArtist: 'Artist',
        allArtists: 'Artist',
        primaryGenre: null,
        primaryStyle: null,
        primaryFormat: 'CD',
        vinylColor: null,
        catalogNumber: 'CAT-001',
        recordLabel: 'Label',
      });
    });

    it('should handle empty arrays', () => {
      const basicInfo: BasicInformation = {
        id: 12345,
        title: 'Test Album',
        year: 2023,
        thumb: 'thumb.jpg',
        cover_image: 'cover.jpg',
        artists: [],
        labels: [],
        formats: [],
        genres: [],
        styles: [],
      };

      const result = ReleaseDataExtractor.extractSortableFields(basicInfo);

      expect(result).toEqual({
        primaryArtist: null,
        allArtists: null,
        primaryGenre: null,
        primaryStyle: null,
        primaryFormat: null,
        vinylColor: null,
        catalogNumber: null,
        recordLabel: null,
      });
    });
  });

  describe('extractPrimaryArtist', () => {
    it('should extract primary artist from artist name', () => {
      const artists = [
        { name: 'Main Artist', anv: '' },
        { name: 'Other Artist', anv: '' },
      ];

      const result = ReleaseDataExtractor['extractPrimaryArtist'](artists);

      expect(result).toBe('Main Artist');
    });

    it('should use anv when name is empty', () => {
      const artists = [
        { name: '', anv: 'Alternative Name' },
        { name: 'Other Artist', anv: '' },
      ];

      const result = ReleaseDataExtractor['extractPrimaryArtist'](artists);

      expect(result).toBe('Alternative Name');
    });

    it('should return null for empty artist array', () => {
      const result = ReleaseDataExtractor['extractPrimaryArtist']([]);

      expect(result).toBeNull();
    });

    it('should return null for null/undefined artists', () => {
      expect(
        ReleaseDataExtractor['extractPrimaryArtist'](null as any),
      ).toBeNull();
      expect(
        ReleaseDataExtractor['extractPrimaryArtist'](undefined as any),
      ).toBeNull();
    });
  });

  describe('extractAllArtists', () => {
    it('should join all artist names with comma separator', () => {
      const artists = [
        { name: 'Artist 1', anv: '' },
        { name: 'Artist 2', anv: '' },
        { name: 'Artist 3', anv: '' },
      ];

      const result = ReleaseDataExtractor['extractAllArtists'](artists);

      expect(result).toBe('Artist 1, Artist 2, Artist 3');
    });

    it('should use anv when name is not available', () => {
      const artists = [
        { name: 'Artist 1', anv: '' },
        { name: '', anv: 'Alternative Name' },
        { name: 'Artist 3', anv: 'Ignored ANV' },
      ];

      const result = ReleaseDataExtractor['extractAllArtists'](artists);

      expect(result).toBe('Artist 1, Alternative Name, Artist 3');
    });

    it('should filter out empty names', () => {
      const artists = [
        { name: 'Artist 1', anv: '' },
        { name: '', anv: '' },
        { name: 'Artist 2', anv: '' },
      ];

      const result = ReleaseDataExtractor['extractAllArtists'](artists);

      expect(result).toBe('Artist 1, Artist 2');
    });

    it('should handle single artist', () => {
      const artists = [{ name: 'Solo Artist', anv: '' }];

      const result = ReleaseDataExtractor['extractAllArtists'](artists);

      expect(result).toBe('Solo Artist');
    });

    it('should return null for empty array', () => {
      const result = ReleaseDataExtractor['extractAllArtists']([]);

      expect(result).toBeNull();
    });
  });

  describe('extractPrimaryGenre', () => {
    it('should extract first genre', () => {
      const genres = ['Rock', 'Alternative', 'Indie'];

      const result = ReleaseDataExtractor['extractPrimaryGenre'](genres);

      expect(result).toBe('Rock');
    });

    it('should return null for empty genres', () => {
      expect(ReleaseDataExtractor['extractPrimaryGenre']([])).toBeNull();
      expect(ReleaseDataExtractor['extractPrimaryGenre'](undefined)).toBeNull();
    });
  });

  describe('extractPrimaryStyle', () => {
    it('should extract first style', () => {
      const styles = ['Shoegaze', 'Dream Pop', 'Noise'];

      const result = ReleaseDataExtractor['extractPrimaryStyle'](styles);

      expect(result).toBe('Shoegaze');
    });

    it('should return null for empty styles', () => {
      expect(ReleaseDataExtractor['extractPrimaryStyle']([])).toBeNull();
      expect(ReleaseDataExtractor['extractPrimaryStyle'](undefined)).toBeNull();
    });
  });

  describe('extractPrimaryFormat', () => {
    it('should extract format name from first format', () => {
      const formats = [
        { name: 'Vinyl', qty: '1', descriptions: ['LP'] },
        { name: 'CD', qty: '1', descriptions: [] },
      ];

      const result = ReleaseDataExtractor['extractPrimaryFormat'](formats);

      expect(result).toBe('Vinyl');
    });

    it('should return null for empty formats', () => {
      expect(ReleaseDataExtractor['extractPrimaryFormat']([])).toBeNull();
      expect(
        ReleaseDataExtractor['extractPrimaryFormat'](null as any),
      ).toBeNull();
    });
  });

  describe('extractVinylColor', () => {
    it('should extract vinyl color from text field', () => {
      const formats = [
        {
          name: 'Vinyl',
          qty: '1',
          descriptions: ['LP'],
          text: 'Blue Marble',
        },
      ];

      const result = ReleaseDataExtractor['extractVinylColor'](formats);

      expect(result).toBe('Blue Marble');
    });

    it('should clean up trailing commas and extra spaces', () => {
      const formats = [
        {
          name: 'Vinyl',
          qty: '1',
          descriptions: ['LP'],
          text: 'Red,  Black Splatter,  ',
        },
      ];

      const result = ReleaseDataExtractor['extractVinylColor'](formats);

      expect(result).toBe('Red, Black Splatter');
    });

    it('should find vinyl format by name containing "vinyl"', () => {
      const formats = [
        { name: 'CD', qty: '1', descriptions: [] },
        {
          name: '2xVinyl',
          qty: '2',
          descriptions: ['LP'],
          text: 'Clear',
        },
      ];

      const result = ReleaseDataExtractor['extractVinylColor'](formats);

      expect(result).toBe('Clear');
    });

    it('should handle case-insensitive vinyl matching', () => {
      const formats = [
        {
          name: 'VINYL',
          qty: '1',
          descriptions: [],
          text: 'Green',
        },
      ];

      const result = ReleaseDataExtractor['extractVinylColor'](formats);

      expect(result).toBe('Green');
    });

    it('should return null when no vinyl format found', () => {
      const formats = [
        { name: 'CD', qty: '1', descriptions: [] },
        { name: 'Cassette', qty: '1', descriptions: [] },
      ];

      const result = ReleaseDataExtractor['extractVinylColor'](formats);

      expect(result).toBeNull();
    });

    it('should return null when vinyl has no text', () => {
      const formats = [{ name: 'Vinyl', qty: '1', descriptions: ['LP'] }];

      const result = ReleaseDataExtractor['extractVinylColor'](formats);

      expect(result).toBeNull();
    });

    it('should return null for empty text after cleanup', () => {
      const formats = [
        {
          name: 'Vinyl',
          qty: '1',
          descriptions: [],
          text: '  ,  ',
        },
      ];

      const result = ReleaseDataExtractor['extractVinylColor'](formats);

      expect(result).toBeNull();
    });

    it('should return null for empty formats', () => {
      expect(ReleaseDataExtractor['extractVinylColor']([])).toBeNull();
    });
  });

  describe('extractCatalogNumber', () => {
    it('should extract catalog number from first label with catno', () => {
      const labels = [
        { name: 'Label 1', catno: '' },
        { name: 'Label 2', catno: 'CAT-123' },
        { name: 'Label 3', catno: 'CAT-456' },
      ];

      const result = ReleaseDataExtractor['extractCatalogNumber'](labels);

      expect(result).toBe('CAT-123');
    });

    it('should skip empty or whitespace-only catalog numbers', () => {
      const labels = [
        { name: 'Label 1', catno: '   ' },
        { name: 'Label 2', catno: 'VALID-123' },
      ];

      const result = ReleaseDataExtractor['extractCatalogNumber'](labels);

      expect(result).toBe('VALID-123');
    });

    it('should return null when no valid catalog number found', () => {
      const labels = [
        { name: 'Label 1', catno: '' },
        { name: 'Label 2', catno: '  ' },
      ];

      const result = ReleaseDataExtractor['extractCatalogNumber'](labels);

      expect(result).toBeNull();
    });

    it('should return null for empty labels', () => {
      expect(ReleaseDataExtractor['extractCatalogNumber']([])).toBeNull();
      expect(
        ReleaseDataExtractor['extractCatalogNumber'](null as any),
      ).toBeNull();
    });
  });

  describe('extractRecordLabel', () => {
    it('should extract first label name', () => {
      const labels = [
        { name: 'Primary Label', catno: 'CAT-001' },
        { name: 'Secondary Label', catno: 'CAT-002' },
      ];

      const result = ReleaseDataExtractor['extractRecordLabel'](labels);

      expect(result).toBe('Primary Label');
    });

    it('should return null for empty labels', () => {
      expect(ReleaseDataExtractor['extractRecordLabel']([])).toBeNull();
      expect(
        ReleaseDataExtractor['extractRecordLabel'](null as any),
      ).toBeNull();
    });
  });

  describe('copyReleaseDataForSorting', () => {
    it('should copy specific fields for sorting', () => {
      const release = {
        id: 123,
        title: 'Test Album',
        primaryArtist: 'Test Artist',
        allArtists: 'Test Artist, Other Artist',
        year: 2023,
        primaryGenre: 'Rock',
        primaryFormat: 'Vinyl',
        vinylColor: 'Black',
        otherField: 'Should not be copied',
        rating: 5,
      };

      const result = ReleaseDataExtractor.copyReleaseDataForSorting(release);

      expect(result).toEqual({
        title: 'Test Album',
        primaryArtist: 'Test Artist',
        allArtists: 'Test Artist, Other Artist',
        year: 2023,
        primaryGenre: 'Rock',
        primaryFormat: 'Vinyl',
        vinylColor: 'Black',
      });
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('otherField');
      expect(result).not.toHaveProperty('rating');
    });

    it('should handle missing fields', () => {
      const release = {
        title: 'Minimal Album',
        year: 2023,
      };

      const result = ReleaseDataExtractor.copyReleaseDataForSorting(release);

      expect(result).toEqual({
        title: 'Minimal Album',
        primaryArtist: undefined,
        allArtists: undefined,
        year: 2023,
        primaryGenre: undefined,
        primaryFormat: undefined,
        vinylColor: undefined,
      });
    });

    it('should handle null/undefined values', () => {
      const release = {
        title: null,
        primaryArtist: undefined,
        allArtists: null,
        year: null,
        primaryGenre: undefined,
        primaryFormat: null,
        vinylColor: undefined,
      };

      const result = ReleaseDataExtractor.copyReleaseDataForSorting(release);

      expect(result).toEqual({
        title: null,
        primaryArtist: undefined,
        allArtists: null,
        year: null,
        primaryGenre: undefined,
        primaryFormat: null,
        vinylColor: undefined,
      });
    });
  });
});
