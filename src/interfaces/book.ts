export interface IBook {
  name: string;
  author: string;
  summary?: string;
  rating?: number;
  pages?: number;
  publishedOn?: Date;
  createdBy: string;
}

export interface IBookNote {
  id: number;
  userId: number;
  bookId: number;
  note: string;
  created_on: string;
  modified_on: string;
  isPrivate: number;
}

export interface IComment {
  id: number;
  userId: number;
  noteId: number;
  comment: string;
  created_on: string;
}

export interface ISaveNote {
  id: number;
  userId: number;
  noteId: number;
}
