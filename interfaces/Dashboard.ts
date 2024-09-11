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
  data: any;
  id: string;
  book_id: string;
  status: string;
}

export interface UserPoints {
  points_earned: number;
  points_redeemed: number;
}

export interface Reward {
  id: number;
  type: string;
  name: string;
  merchant: string;
  description: string;
  cost: number;
  link: string;
}
