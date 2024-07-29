export interface Book {
  "Book Title": string;
  Author: string;
  "Main Category": string;
  Subcategory: string;
  "Personal Rating"?: string;
}

export interface Preferences {
  Author: { [key: string]: number };
  "Main Category": { [key: string]: number };
  Subcategory: { [key: string]: number };
}
