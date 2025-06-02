export interface Note {
  _id: string;
  title: string;
  content: string[];
  type: "bullet" | "checklist";
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string[];
  type: "bullet" | "checklist";
}

export interface UpdateNoteRequest {
  title: string;
  content: string[];
  type: "bullet" | "checklist";
}
