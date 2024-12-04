import { Router } from "express";
const router = Router();
// Components
import * as UserComponent from "../components/User";
import * as BookComponent from "../components/Book";
//Validators
import * as userValidators from "../validators/user";
import * as bookValidators from "../validators/book";
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
// router.delete(
//   "/books",
//   authenticateToken,
//   bookValidations.deleteBooksValidation,
//   BookComponent.deleteBooks
// );

export default router;
