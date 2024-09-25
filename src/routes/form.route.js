import {Router} from "express";
import {createForm,exportResponses,getAllFormResponses,getUserForms,submitFormResponse} from "../controllers/form.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware";

const router=Router();

router.route("/create").post(verifyJWT,createForm);
router.route("/get-user-forms").get(verifyJWT,getUserForms);
router.route("/getAllFormResponses/:formId").get(verifyJWT,getAllFormResponses);
router.route("/export-responses").post(verifyJWT,exportResponses);
router.route("/submit").post(submitFormResponse);

export default router;
