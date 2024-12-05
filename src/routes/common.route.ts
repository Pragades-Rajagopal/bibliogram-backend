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
// router.get("/book-notes/:id", authenticateToken, NoteComponent.getNote);
// router.get("/book-notes", authenticateToken, NoteComponent.getNotesByQuery);
// router.delete(
//   "/book-notes/:id",
//   authenticateToken,
//   NoteComponent.deleteNote
// );
// router.get(
//   "/book-notes-visibility/:id/:flag",
//   authenticateToken,
//   NoteComponent.updateNoteVisibility
// );

export default router;
