import express from "express";
import { getScreensByTheater, getScreenById } from "../controllers/screenController.js";

const router = express.Router();

router.get("/theater/:theaterId", getScreensByTheater);
router.get("/:id", getScreenById);

export default router;

