export interface CreateNoteRequest {
  title: string
  content: string[]
  type: "bullet" | "checklist"
}

export interface UpdateNoteRequest {
  title: string
  content: string[]
  type: "bullet" | "checklist"
}
