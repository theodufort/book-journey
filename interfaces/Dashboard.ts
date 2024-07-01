interface RowRating {
  ratingName: string;
  ratingValue: Number;
}
export interface Row {
  bookName: string;
  category: string;
  generalRating: Number;
  status: string;
}
export interface ReadingListItem {
  id: string;
  book_isbn: string;
  status: string;
}
