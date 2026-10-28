import express from "express";
import { getTheaters, getTheaterById, getCities } from "../controllers/theaterController.js";

const router = express.Router();

router.get("/cities", getCities);
router.get("/", getTheaters);
router.get("/:id", getTheaterById);

export default router;

