import {Router} from "express";
import {loginUser,logoutUser,refreshAccessToken,registerUser,resendOTP,verifyOTP} from "../controllers/user.controller"
import { verifyJWT } from "../middlewares/auth.middleware";

const router=Router();


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/verify").post(verifyOTP);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/resend-otp").post(resendOTP);

export default router;