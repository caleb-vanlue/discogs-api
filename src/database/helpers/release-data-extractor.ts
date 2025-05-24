import { BasicInformation } from '../../discogs/types/discogs.types';

export class ReleaseDataExtractor {
  static extractSortableFields(basicInfo: BasicInformation) {
    return {
      primaryArtist: this.extractPrimaryArtist(basicInfo.artists),
      allArtists: this.extractAllArtists(basicInfo.artists),
      primaryGenre: this.extractPrimaryGenre(basicInfo.genres),
      primaryStyle: this.extractPrimaryStyle(basicInfo.styles),
      primaryFormat: this.extractPrimaryFormat(basicInfo.formats),
      vinylColor: this.extractVinylColor(basicInfo.formats),
      catalogNumber: this.extractCatalogNumber(basicInfo.labels),
      recordLabel: this.extractRecordLabel(basicInfo.labels),
    };
  }

  private static extractPrimaryArtist(
    artists: Array<{ name: string; anv: string }>,
  ): string | null {
    if (!artists || artists.length === 0) return null;

    const firstArtist = artists[0];
    return firstArtist.name || firstArtist.anv || null;
  }

  private static extractAllArtists(
    artists: Array<{ name: string; anv: string }>,
  ): string | null {
    if (!artists || artists.length === 0) return null;

    return artists
      .map((artist) => artist.name || artist.anv)
      .filter((name) => name)
      .join(', ');
  }

  private static extractPrimaryGenre(genres?: string[]): string | null {
    if (!genres || genres.length === 0) return null;
    return genres[0];
  }

  private static extractPrimaryStyle(styles?: string[]): string | null {
    if (!styles || styles.length === 0) return null;
    return styles[0];
  }

  private static extractPrimaryFormat(
    formats: Array<{
      name: string;
      qty: string;
      descriptions: string[];
      text?: string;
    }>,
  ): string | null {
    if (!formats || formats.length === 0) return null;
    return formats[0].name;
  }

  private static extractVinylColor(
    formats: Array<{
      name: string;
      qty: string;
      descriptions: string[];
      text?: string;
    }>,
  ): string | null {
    if (!formats || formats.length === 0) return null;

    const vinylFormat = formats.find(
      (format) => format.name?.toLowerCase().includes('vinyl') || format.text,
    );

    if (vinylFormat?.text) {
      let color = vinylFormat.text;
      color = color.replace(/,\s*$/, '').replace(/,\s+/g, ', ').trim();
      return color || null;
    }

    return null;
  }

  private static extractCatalogNumber(
    labels: Array<{ name: string; catno: string }>,
  ): string | null {
    if (!labels || labels.length === 0) return null;

    const labelWithCatno = labels.find(
      (label) => label.catno && label.catno.trim() !== '',
    );
    return labelWithCatno?.catno || null;
  }

  private static extractRecordLabel(
    labels: Array<{ name: string; catno: string }>,
  ): string | null {
    if (!labels || labels.length === 0) return null;
    return labels[0].name;
  }

  static copyReleaseDataForSorting(release: any) {
    return {
      title: release.title,
      primaryArtist: release.primaryArtist,
      allArtists: release.allArtists,
      year: release.year,
      primaryGenre: release.primaryGenre,
      primaryFormat: release.primaryFormat,
      vinylColor: release.vinylColor,
    };
  }
}
