import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { Note } from "../models/Note";
import mongoose from "mongoose";

export const getAllNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({
      updatedAt: -1,
    });
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

export const createNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, type, content } = req.body;

    if (!title || !type || !content || !Array.isArray(content)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["bullet", "checklist"].includes(type)) {
      return res.status(400).json({ error: "Invalid note type" });
    }

    const note = new Note({
      title,
      type,
      content: content.filter((item: string) => item.trim() !== ""),
      userId: req.userId,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
};

export const updateNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const { title, type, content } = req.body;

    if (!title || !type || !content || !Array.isArray(content)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["bullet", "checklist"].includes(type)) {
      return res.status(400).json({ error: "Invalid note type" });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.userId }, // Ensure user can only update their own notes
      {
        title,
        type,
        content: content.filter((item: string) => item.trim() !== ""),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
};

export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const note = await Note.findOneAndDelete({ _id: id, userId: req.userId }); // Ensure user can only delete their own notes

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
};
