import express from "express";
import {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

router.get("/", getAllNotes);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
