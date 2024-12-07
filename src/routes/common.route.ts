import { Router } from "express";
const router = Router();
// Components
import * as UserComponent from "../components/User";
import * as BookComponent from "../components/Book";
import * as NoteComponent from "../components/Note";
//Validators
import * as userValidators from "../validators/user";
import * as bookValidators from "../validators/book";
import * as noteValidators from "../validators/note";
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
// router.delete(
//   "/save-later/:noteId/:userId",
//   authenticateToken,
//   BookNoteComponent.deleteSavedNoteForLater
// );
// router.get(
//   "/is-saved-note/:noteId/:userId",
//   authenticateToken,
//   BookNoteComponent.isNoteSavedForLater
// );

export default router;
