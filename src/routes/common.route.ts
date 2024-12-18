import { Router } from "express";
const router = Router();
// Components
import * as UserComponent from "../components/User";
import * as BookComponent from "../components/Book";
import * as GramComponent from "../components/Gram";
import * as CommentComponent from "../components/Comment";
import * as SearchComponent from "../components/Search";
import * as AppStatsComponent from "../components/AppStats";
//Validators
import * as userValidators from "../validators/user";
import * as bookValidators from "../validators/book";
import * as gramValidators from "../validators/gram";
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
router.get(
  "/logout/:userId",
  authenticateToken,
  userValidators.logoutValidation,
  UserComponent.userLogout
);
router.get(
  "/deactivate-user/:userId",
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
 * gram routes
 */
router.put(
  "/gram",
  authenticateToken,
  gramValidators.addOrUpdateValidation,
  GramComponent.upsertGram
);
router.get(
  "/gram/:id",
  authenticateToken,
  gramValidators.idValidation,
  GramComponent.getGramById
);
router.get(
  "/grams",
  authenticateToken,
  gramValidators.getGramsByQueryValidation,
  GramComponent.getGramsByQuery
);
router.delete(
  "/gram/:id",
  authenticateToken,
  gramValidators.idValidation,
  GramComponent.deleteGram
);
router.get(
  "/gram-visibility/:id/:flag",
  authenticateToken,
  gramValidators.updateVisibilityValidation,
  GramComponent.updateGramVisibility
);

/**
 * Bookmark routes
 */
router.post(
  "/bookmark",
  authenticateToken,
  gramValidators.saveBookmarkValidation,
  GramComponent.bookmarkGram
);
router.get(
  "/bookmark/:id",
  authenticateToken,
  gramValidators.idValidation,
  GramComponent.getBookmarks
);
router.delete(
  "/bookmark/:gramId/:userId",
  authenticateToken,
  gramValidators.bookmarkParamsValidation,
  GramComponent.deleteBookmark
);
router.get(
  "/is-bookmarked/:gramId/:userId",
  authenticateToken,
  gramValidators.bookmarkParamsValidation,
  GramComponent.isBookmarked
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

/**
 * App stats route
 */
router.get("/app-stats", authenticateToken, AppStatsComponent.getAppStats);

export default router;
