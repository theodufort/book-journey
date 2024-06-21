interface VolumeInfo {
  title: string;
  subtitle?: string;
  authors?: string[];
  publishedDate?: string;
  industryIdentifiers?: {
    type: string;
    identifier: string;
  }[];
  readingModes?: {
    text: boolean;
    image: boolean;
  };
  description: string;
  pageCount?: number;
  printType?: string;
  mainCategory: string;
  categories?: string[];
  maturityRating?: string;
  allowAnonLogging?: boolean;
  contentVersion?: string;
  panelizationSummary?: {
    containsEpubBubbles: boolean;
    containsImageBubbles: boolean;
  };
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };
  language?: string;
  previewLink?: string;
  infoLink?: string;
  canonicalVolumeLink?: string;
}

interface SaleInfo {
  country: string;
  saleability: string;
  isEbook: boolean;
  buyLink?: string;
}

interface AccessInfo {
  country: string;
  viewability: string;
  embeddable: boolean;
  publicDomain: boolean;
  textToSpeechPermission: string;
  epub?: {
    isAvailable: boolean;
    downloadLink: string;
  };
  pdf?: {
    isAvailable: boolean;
    downloadLink: string;
  };
  webReaderLink?: string;
  accessViewStatus: string;
  quoteSharingAllowed: boolean;
}

interface SearchInfo {
  textSnippet: string;
}

export interface Volume {
  kind: string;
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: VolumeInfo;
  saleInfo: SaleInfo;
  accessInfo: AccessInfo;
  searchInfo?: SearchInfo;
}

export interface BookVolumes {
  kind: string;
  totalItems: number;
  items: Volume[];
}
