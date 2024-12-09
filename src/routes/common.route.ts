import { Router } from "express";
const router = Router();
// Components
import * as UserComponent from "../components/User";
import * as BookComponent from "../components/Book";
import * as NoteComponent from "../components/Note";
import * as CommentComponent from "../components/Comment";
import * as SearchComponent from "../components/Search";
//Validators
import * as userValidators from "../validators/user";
import * as bookValidators from "../validators/book";
import * as noteValidators from "../validators/note";
import * as commentValidators from "../validators/comment";
import * as searchValidators from "../validators/search";
import { authenticateToken } from "../services/auth";

/**
 * User routes
 */
router.post(
  "/register",
  userValidators.registerValidation,
  UserComponent.registerUser
);
router.post("/login", userValidators.loginValidation, UserComponent.userLogin);
router.post(
  "/logout",
  authenticateToken,
  userValidators.logoutValidation,
  UserComponent.userLogout
);
router.post(
  "/deactivate-user",
  authenticateToken,
  userValidators.deactivateUserValidation,
  UserComponent.deactivateUser
);

/**
 * Book routes
 */
router.post(
  "/books",
  authenticateToken,
  bookValidators.addBooksValidation,
  BookComponent.bulkAddBooks
);
router.get(
  "/book/:id",
  authenticateToken,
  bookValidators.getBookByIdValidation,
  BookComponent.getBookById
);
router.get("/books", authenticateToken, BookComponent.getAllBooks);
router.get("/top-books", authenticateToken, BookComponent.getTopBooks);
router.delete(
  "/books",
  authenticateToken,
  bookValidators.deleteBooksValidation,
  BookComponent.deleteBooks
);

/**
 * Note routes
 */
router.put(
  "/note",
  authenticateToken,
  noteValidators.addOrUpdateValidation,
  NoteComponent.upsertNote
);
router.get(
  "/note/:id",
  authenticateToken,
  noteValidators.idValidation,
  NoteComponent.getNoteById
);
router.get(
  "/notes",
  authenticateToken,
  noteValidators.getNotesByQueryValidation,
  NoteComponent.getNotesByQuery
);
router.delete(
  "/note/:id",
  authenticateToken,
  noteValidators.idValidation,
  NoteComponent.deleteNote
);
router.get(
  "/note-visibility/:id/:flag",
  authenticateToken,
  noteValidators.updateVisibilityValidation,
  NoteComponent.updateNoteVisibility
);

/**
 * Bookmark routes
 */
router.post(
  "/bookmark",
  authenticateToken,
  noteValidators.saveBookmarkValidation,
  NoteComponent.bookmarkNote
);
router.get(
  "/bookmark/:id",
  authenticateToken,
  noteValidators.idValidation,
  NoteComponent.getBookmarks
);
router.delete(
  "/bookmark/:noteId/:userId",
  authenticateToken,
  noteValidators.bookmarkParamsValidation,
  NoteComponent.deleteBookmark
);
router.get(
  "/is-bookmarked/:noteId/:userId",
  authenticateToken,
  noteValidators.bookmarkParamsValidation,
  NoteComponent.isBookmarked
);

/**
 * Comment routes
 */
router.put(
  "/comment",
  authenticateToken,
  commentValidators.upsertCommentValidation,
  CommentComponent.upsertComment
);
router.get(
  "/comment/:id",
  authenticateToken,
  commentValidators.idValidation,
  CommentComponent.getCommentById
);
router.get(
  "/comment",
  authenticateToken,
  commentValidators.getCommentByQueryValidation,
  CommentComponent.getCommentByQuery
);
router.delete(
  "/comment/:id",
  authenticateToken,
  commentValidators.idValidation,
  CommentComponent.deleteComment
);

/**
 * Search route
 */
router.get(
  "/search",
  authenticateToken,
  searchValidators.searchValidation,
  SearchComponent.globalSearch
);

export default router;
