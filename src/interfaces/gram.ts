interface Gram {
  id: string;
  userId: string;
  bookId: string;
  gram: string;
  isPrivate: boolean;
  createdOn: Date;
  modifiedOn: Date;
  user: string;
  book: string;
  author: string;
  comments: number;
  shortDate: string;
}

export interface GetGramsResponse {
  data: Gram[];
  totalRecords: [{ count: number }];
}
