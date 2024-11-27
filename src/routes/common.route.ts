import { Router } from "express";
const router = Router();
// Components
import * as UserComponent from "../components/User";
//Validators
import * as userValidators from "../validators/user";

/**
 * User routes
 */
router.post(
  "/register",
  userValidators.registerValidation,
  UserComponent.registerUser
);
router.post("/login", userValidators.loginValidation, UserComponent.userLogin);

export default router;
