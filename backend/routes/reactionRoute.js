import express from "express";
import { runReaction } from "../controllers/reactionController.js";

const router = express.Router();

// Route → Controller
router.post("/", runReaction);

export default router;
