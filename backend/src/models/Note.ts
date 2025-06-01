import mongoose, { Schema, type Document } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string[];
  type: "bullet" | "checklist";
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v && v.length > 0,
        message: "Content must have at least one item",
      },
    },
    type: {
      type: String,
      required: true,
      enum: ["bullet", "checklist"],
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user-specific queries
NoteSchema.index({ userId: 1, updatedAt: -1 });

export const Note = mongoose.model<INote>("Note", NoteSchema);
