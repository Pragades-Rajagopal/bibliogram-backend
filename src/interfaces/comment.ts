interface Comment {
  id: string;
  userId: string;
  gramId: string;
  comment: string;
  createdOn: Date;
  user: string;
  shortDate: string;
}

export interface GetCommentByQueryResponse {
  data: Comment[];
  totalRecords: [{ count: number }];
}
