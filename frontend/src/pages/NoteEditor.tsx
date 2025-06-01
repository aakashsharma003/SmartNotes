import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Undo,
  Redo,
  FileText,
  CheckSquare,
  Highlighter,
  Bold,
  Italic,
  Underline,
  ImageIcon,
  Type,
  MoreHorizontal,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNoteService } from "@/services/noteService";
import type { Note, CreateNoteRequest, UpdateNoteRequest } from "@/types/note";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<string[]>([""]);
  const [type, setType] = useState<"bullet" | "checklist">("bullet");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [isNewNote, setIsNewNote] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const noteService = useNoteService();

  const isNew = id === "new";

  useEffect(() => {
    if (isNew) {
      setIsNewNote(true);
      setTitle("");
      setContent([""]);
      setType("bullet");
    } else if (id) {
      fetchNote();
    }
  }, [id]);

  useEffect(() => {
    const totalChars = content.join("").length + title.length;
    setCharacterCount(totalChars);
  }, [content, title]);

  const fetchNote = async () => {
    if (!id || isNew) return;

    setLoading(true);
    try {
      const notes = await noteService.getAllNotes();
      const foundNote = notes.find((n) => n._id === id);
      if (foundNote) {
        setNote(foundNote);
        setTitle(foundNote.title);
        setContent(foundNote.content);
        setType(foundNote.type);
      } else {
        toast({
          title: "Error",
          description: "Note not found",
          variant: "destructive",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load note",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    const filteredContent = content.filter((item) => item.trim() !== "");
    if (filteredContent.length === 0) {
      toast({
        title: "Error",
        description: "Please add some content",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const noteData: CreateNoteRequest = {
          title: title.trim(),
          type,
          content: filteredContent,
        };
        await noteService.createNote(noteData);
        toast({
          title: "Success",
          description: "Note created successfully",
        });
      } else if (note) {
        const updateData: UpdateNoteRequest = {
          title: title.trim(),
          type,
          content: filteredContent,
        };
        await noteService.updateNote(note._id, updateData);
        toast({
          title: "Success",
          description: "Note saved successfully",
        });
      }
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addContentItem = () => {
    setContent([...content, ""]);
    setTimeout(() => {
      const textareas = document.querySelectorAll(
        "textarea[data-content-item]"
      );
      const lastTextarea = textareas[
        textareas.length - 1
      ] as HTMLTextAreaElement;
      if (lastTextarea) {
        lastTextarea.focus();
      }
    }, 100);
  };

  const updateContentItem = (index: number, value: string) => {
    const newContent = [...content];
    newContent[index] = value;
    setContent(newContent);
  };

  const removeContentItem = (index: number) => {
    if (content.length > 1) {
      setContent(content.filter((_, i) => i !== index));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addContentItem();
    } else if (
      e.key === "Backspace" &&
      content[index] === "" &&
      content.length > 1
    ) {
      e.preventDefault();
      removeContentItem(index);
      // Focus previous item
      setTimeout(() => {
        const textareas = document.querySelectorAll(
          "textarea[data-content-item]"
        );
        const prevTextarea = textareas[
          Math.max(0, index - 1)
        ] as HTMLTextAreaElement;
        if (prevTextarea) {
          prevTextarea.focus();
          prevTextarea.setSelectionRange(
            prevTextarea.value.length,
            prevTextarea.value.length
          );
        }
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 transition-all duration-300">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-gray-800 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-gray-800 transition-all duration-200 hover:scale-105"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-gray-800 transition-all duration-200 hover:scale-105"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Badge
            variant={type === "bullet" ? "default" : "secondary"}
            className="bg-gray-800 text-white transition-all duration-200"
          >
            {type === "bullet" ? (
              <FileText className="w-3 h-3 mr-1" />
            ) : (
              <CheckSquare className="w-3 h-3 mr-1" />
            )}
            {type === "bullet" ? "Bullet" : "Checklist"}
          </Badge>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Title */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="text-2xl font-bold bg-transparent border-none text-white placeholder-gray-500 p-0 mb-2 focus:ring-0"
        />

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
          <span>
            {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span>{characterCount} characters</span>
        </div>

        {/* Type selector */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={type === "bullet" ? "default" : "ghost"}
            size="sm"
            onClick={() => setType("bullet")}
            className={`transition-all duration-200 hover:scale-105 ${
              type === "bullet"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Bullet Points
          </Button>
          <Button
            variant={type === "checklist" ? "default" : "ghost"}
            size="sm"
            onClick={() => setType("checklist")}
            className={`transition-all duration-200 hover:scale-105 ${
              type === "checklist"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <CheckSquare className="w-5 h-5 mr-2" />
            Checklist
          </Button>
        </div>

        {/* Content items */}
        <div className="space-y-3">
          {content.map((item, index) => (
            <div key={index} className="flex items-start gap-3 group">
              <div className="flex items-center mt-3">
                {type === "bullet" ? (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                ) : (
                  <CheckSquare className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <Textarea
                data-content-item
                value={item}
                onChange={(e) => updateContentItem(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder={
                  index === 0 && item === ""
                    ? "Start typing..."
                    : `${type === "bullet" ? "Bullet point" : "Task"} ${
                        index + 1
                      }`
                }
                className="flex-1 bg-transparent border-none text-white placeholder-gray-500 resize-none min-h-[40px] p-2 focus:ring-0 focus:outline-none"
                rows={1}
                style={{
                  height: "auto",
                  minHeight: "40px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = target.scrollHeight + "px";
                }}
              />
            </div>
          ))}
        </div>

        {/* Add item button */}
        <Button
          variant="ghost"
          onClick={addContentItem}
          className="mt-4 text-gray-400 hover:bg-gray-800 w-full justify-start transition-all duration-200 hover:scale-[1.02] hover:text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-gray-600 rounded-full transition-all duration-200"></div>
            <span>Add {type === "bullet" ? "bullet point" : "task"}</span>
          </div>
        </Button>
      </div>

      {/* Bottom toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 transition-all duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-gray-700 transition-all duration-200 hover:scale-110"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-gray-700 transition-all duration-200 hover:scale-110"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-gray-700 transition-all duration-200 hover:scale-110"
            >
              <Underline className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-yellow-500 hover:bg-gray-700 transition-all duration-200 hover:scale-110"
            >
              <Highlighter className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-gray-700 transition-all duration-200 hover:scale-110"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-gray-700 transition-all duration-200 hover:scale-110"
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-gray-700 transition-all duration-200 hover:scale-110"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
