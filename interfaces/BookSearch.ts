export interface Book {
  title: string;
  title_long: string;
  isbn: string;
  isbn13: string;
  dewey_decimal: string;
  binding: string;
  publisher: string;
  language: string;
  date_published: string; // Format: $date-time
  edition: string;
  pages: number;
  dimensions: string;
  dimensions_structured: Dimensions;
  overview: string;
  image: string; // The link to the cover image
  msrp: number;
  excerpt: string;
  synopsis: string;
  authors: string[];
  subjects: string[];
  reviews: string[];
  prices?: Merchant[]; // Only included if 'with_prices' query parameter is present
  related: {
    type: string;
  };
  other_isbns: OtherISBN[];
}

interface Dimensions {
  // Structure of dimensions_structured
  height?: number;
  width?: number;
  thickness?: number;
  unit?: string; // e.g., 'cm' or 'inches'
}

interface Merchant {
  name: string;
  price: number;
  currency: string;
  link: string;
}

interface OtherISBN {
  isbn: string;
  binding: string;
}
export interface BookSearchResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    categories?: string[];
    reviews?: string[];
    pageCount: number;
    imageLinks?: {
      thumbnail: string;
    };
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
  };
}
