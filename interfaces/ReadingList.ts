import { Volume } from "./GoogleAPI";

export interface ReadingListItem extends Volume {
  data: Volume;
  book_id: string;
  status: string;
}
