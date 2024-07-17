export interface BookSearchResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail: string;
    };
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
  };
}
