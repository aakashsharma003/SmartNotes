import { useAuth } from "@clerk/clerk-react";
import type { Note, CreateNoteRequest, UpdateNoteRequest } from "@/types/note";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create a hook to use the service with auth
export const useNoteService = () => {
  const { getToken } = useAuth();

  const request = async (
    endpoint: string,
    options?: RequestInit
  ): Promise<any> => {
    const token = await getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Request failed");
    }

    return response.json();
  };

  return {
    getAllNotes: (): Promise<Note[]> => request("/notes"),
    createNote: (noteData: CreateNoteRequest): Promise<Note> =>
      request("/notes", {
        method: "POST",
        body: JSON.stringify(noteData),
      }),
    updateNote: (id: string, noteData: UpdateNoteRequest): Promise<Note> =>
      request(`/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(noteData),
      }),
    deleteNote: (id: string): Promise<void> =>
      request(`/notes/${id}`, {
        method: "DELETE",
      }),
  };
};
