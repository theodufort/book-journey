import { Volume } from "./GoogleAPI";

export interface ReadingListItem extends Volume {
  book_id: string;
  status: string;
}
