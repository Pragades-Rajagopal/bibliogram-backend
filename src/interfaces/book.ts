export interface IBook {
  name: string;
  author: string;
  summary?: string;
  rating?: number;
  pages?: number;
  publishedOn?: Date;
  createdBy: string;
}

export interface IGram {
  id?: string;
  userId: string;
  bookId: string;
  gram: string;
  created_on?: string;
  modified_on?: string;
  isPrivate: boolean;
}

export interface IComment {
  id?: string;
  userId: string;
  gramId: string;
  comment: string;
  created_on?: string;
}

export interface IBookmarkGram {
  id?: string;
  userId: string;
  gramId: string;
}
