import { Router } from "express";
const router = Router();
// Components
import * as UserComponent from "../components/User";
import * as BookComponent from "../components/Book";
//Validators
import * as userValidators from "../validators/user";
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
  // bookValidations.addBooksValidation,
  BookComponent.bulkAddBooks
);

export default router;
