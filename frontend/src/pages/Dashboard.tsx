import { useState, useEffect } from "react";
import { useUser, UserButton, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  CheckSquare,
  Edit,
  Trash2,
  LogOut,
  User,
} from "lucide-react";
import { CreateNoteDialog } from "@/components/CreateNoteDialog";
import { EditNoteDialog } from "@/components/EditNoteDialog";
import { ProfileDialog } from "@/components/ProfileDailog";
import { useToast } from "@/hooks/use-toast";
import { useNoteService } from "@/services/noteService";
import type { Note } from "@/types/note";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();
  const noteService = useNoteService();

  const fetchNotes = async () => {
    try {
      const data = await noteService.getAllNotes();
      setNotes(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await noteService.deleteNote(id);
      setNotes(notes.filter((note) => note._id !== id));
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const handleNoteCreated = (newNote: Note) => {
    setNotes([newNote, ...notes]);
    setCreateDialogOpen(false);
  };

  const handleNoteUpdated = (updatedNote: Note) => {
    setNotes(
      notes.map((note) => (note._id === updatedNote._id ? updatedNote : note))
    );
    setEditDialogOpen(false);
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditDialogOpen(true);
  };

  const handleCreateNote = () => {
    navigate("/note/new");
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Notes
          </h1>
          <UserButton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Notes
            </h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProfileDialogOpen(true)}
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <User className="w-4 h-4" />
                Profile
              </Button>
              {/* <SignOutButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </SignOutButton> */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "w-10 h-10 transition-all duration-200 hover:scale-105",
                  },
                }}
              />
            </div>
          </div>
          <p className="text-muted-foreground dark:text-gray-400">
            Welcome back,{" "}
            {user?.firstName || user?.emailAddresses[0]?.emailAddress}! You have{" "}
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreateNote}
            className="w-full sm:w-auto transition-all duration-200 hover:scale-105 hover:shadow-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Write Note
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            variant="outline"
            className="w-full sm:w-auto transition-all duration-200 hover:scale-105 hover:shadow-md border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Note
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <Card className="text-center py-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent>
            <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              No notes yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first note to get started organizing your thoughts
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleCreateNote}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write Your First Note
              </Button>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Quick Note
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card
              key={note._id}
              className="hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-bottom-3 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              onClick={() => navigate(`/note/${note._id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate text-gray-900 dark:text-white">
                      {note.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1 text-gray-500 dark:text-gray-400">
                      {note.type === "bullet" ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <CheckSquare className="w-4 h-4" />
                      )}
                      <Badge
                        variant="secondary"
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {note.type === "bullet" ? "Bullet Points" : "Checklist"}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditNote(note);
                      }}
                      className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note._id);
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 hover:scale-110 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {note.content.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      {note.type === "bullet" ? (
                        <>
                          <span className="text-gray-400 dark:text-gray-500 mt-1">
                            •
                          </span>
                          <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                            {typeof item === "string" ? item : item.text}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center mt-0.5">
                            <div
                              className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${
                                typeof item === "object" && item.isMarked
                                  ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500"
                                  : "border-gray-400 dark:border-gray-500"
                              }`}
                            >
                              {typeof item === "object" && item.isMarked && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span
                            className={`flex-1 truncate ${
                              typeof item === "object" && item.isMarked
                                ? "line-through text-gray-400 dark:text-gray-500"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {typeof item === "string" ? item : item.text}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                  {note.content.length > 3 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      +{note.content.length - 3} more items
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateNoteDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onNoteCreated={handleNoteCreated}
      />

      {editingNote && (
        <EditNoteDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          note={editingNote}
          onNoteUpdated={handleNoteUpdated}
        />
      )}

      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </div>
  );
}
