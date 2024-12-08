export interface IBook {
  name: string;
  author: string;
  summary?: string;
  rating?: number;
  pages?: number;
  publishedOn?: Date;
  createdBy: string;
}

export interface INote {
  id?: string;
  userId: string;
  bookId: string;
  note: string;
  created_on?: string;
  modified_on?: string;
  isPrivate: boolean;
}

export interface IComment {
  id?: string;
  userId: string;
  noteId: string;
  comment: string;
  created_on?: string;
}

export interface IBookmarkNote {
  id?: string;
  userId: string;
  noteId: string;
}
