import { useState, useEffect, useRef, useCallback } from "react";
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
  Plus,
  Trash2,
  User,
  Calendar,
  Hash,
  Eye,
  EyeOff,
  Download,
  Share,
  Copy,
  Check,
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
  const [content, setContent] = useState<
    (string | { text: string; isMarked: boolean })[]
  >([""]);
  const [type, setType] = useState<"bullet" | "checklist">("bullet");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isNewNote, setIsNewNote] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const noteService = useNoteService();

  const isNew = id === "new";

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (
      !title.trim() ||
      content.every((item) =>
        typeof item === "string" ? !item.trim() : !item.text.trim()
      )
    )
      return;

    setAutoSaving(true);
    try {
      const filteredContent = content.filter((item) => {
        if (typeof item === "string") {
          return item.trim() !== "";
        } else {
          return item.text.trim() !== "";
        }
      });

      if (isNew) {
        const noteData: CreateNoteRequest = {
          title: title.trim(),
          type,
          content: filteredContent,
        };
        const newNote = await noteService.createNote(noteData);
        setNote(newNote);
        setIsNewNote(false);
        // Update URL to reflect the new note ID
        window.history.replaceState({}, "", `/note/${newNote._id}`);
      } else if (note) {
        const updateData: UpdateNoteRequest = {
          title: title.trim(),
          type,
          content: filteredContent,
        };
        await noteService.updateNote(note._id, updateData);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setAutoSaving(false);
    }
  }, [title, content, type, isNew, note, noteService]);

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (
        !isNew ||
        (title.trim() &&
          content.some((item) =>
            typeof item === "string" ? item.trim() : item.text.trim()
          ))
      ) {
        autoSave();
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content, type, autoSave, isNew]);

  // History management for undo/redo
  const saveToHistory = useCallback(() => {
    const state = { title, content: [...content], type };
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(state);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [title, content, type, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setTitle(prevState.title);
      setContent(prevState.content);
      setType(prevState.type);
      setHistoryIndex((prev) => prev - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setTitle(nextState.title);
      setContent(nextState.content);
      setType(nextState.type);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    if (isNew) {
      setIsNewNote(true);
      setTitle("");
      setContent([""]);
      setType("bullet");
      saveToHistory();
    } else if (id) {
      fetchNote();
    }
  }, [id]);

  useEffect(() => {
    const totalChars =
      content.reduce((acc, item) => {
        if (typeof item === "string") {
          return acc + item.length;
        } else {
          return acc + item.text.length;
        }
      }, 0) + title.length;

    const totalWords =
      content.reduce((acc, item) => {
        const text = typeof item === "string" ? item : item.text;
        return (
          acc +
          text
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length
        );
      }, 0) +
      title
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

    setCharacterCount(totalChars);
    setWordCount(totalWords);
  }, [content, title]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            handleSave();
            break;
          case "z":
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
          case "y":
            e.preventDefault();
            redo();
            break;
          case "Enter":
            e.preventDefault();
            addContentItem();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const fetchNote = async () => {
    if (!id || isNew) return;

    setLoading(true);
    try {
      const notes = await noteService.getAllNotes();
      const foundNote = notes.find((n) => n._id === id);
      if (foundNote) {
        setNote(foundNote);
        setTitle(foundNote.title);
        const processedContent = foundNote.content.map((item) => {
          if (typeof item === "string") {
            return foundNote.type === "checklist"
              ? { text: item, isMarked: false }
              : item;
          }
          return item;
        });
        setContent(processedContent);
        setType(foundNote.type);
        saveToHistory();
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

    const filteredContent = content.filter((item) => {
      if (typeof item === "string") {
        return item.trim() !== "";
      } else {
        return item.text.trim() !== "";
      }
    });
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
      setLastSaved(new Date());
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
    const newItem = type === "checklist" ? { text: "", isMarked: false } : "";
    setContent([...content, newItem]);
    saveToHistory();

    setTimeout(() => {
      const lastIndex = content.length;
      const textarea = textareaRefs.current[lastIndex];
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  };

  const updateContentItem = (index: number, value: string) => {
    const newContent = [...content];
    if (type === "checklist") {
      if (typeof newContent[index] === "object") {
        (newContent[index] as { text: string; isMarked: boolean }).text = value;
      } else {
        newContent[index] = { text: value, isMarked: false };
      }
    } else {
      newContent[index] = value;
    }
    setContent(newContent);
  };

  const removeContentItem = (index: number) => {
    if (content.length > 1) {
      setContent(content.filter((_, i) => i !== index));
      saveToHistory();
    }
  };

  const moveContentItem = (fromIndex: number, toIndex: number) => {
    const newContent = [...content];
    const [movedItem] = newContent.splice(fromIndex, 1);
    newContent.splice(toIndex, 0, movedItem);
    setContent(newContent);
    saveToHistory();
  };

  const duplicateContentItem = (index: number) => {
    const itemToDuplicate = content[index];
    const duplicatedItem =
      typeof itemToDuplicate === "string"
        ? itemToDuplicate
        : { ...itemToDuplicate };
    const newContent = [...content];
    newContent.splice(index + 1, 0, duplicatedItem);
    setContent(newContent);
    saveToHistory();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addContentItem();
    } else if (
      e.key === "Backspace" &&
      (typeof content[index] === "string"
        ? content[index] === ""
        : (content[index] as { text: string; isMarked: boolean }).text ===
          "") &&
      content.length > 1
    ) {
      e.preventDefault();
      removeContentItem(index);
      setTimeout(() => {
        const prevTextarea = textareaRefs.current[Math.max(0, index - 1)];
        if (prevTextarea) {
          prevTextarea.focus();
          prevTextarea.setSelectionRange(
            prevTextarea.value.length,
            prevTextarea.value.length
          );
        }
      }, 100);
    } else if (e.key === "ArrowUp" && e.ctrlKey && index > 0) {
      e.preventDefault();
      moveContentItem(index, index - 1);
    } else if (
      e.key === "ArrowDown" &&
      e.ctrlKey &&
      index < content.length - 1
    ) {
      e.preventDefault();
      moveContentItem(index, index + 1);
    } else if (e.key === "d" && e.ctrlKey) {
      e.preventDefault();
      duplicateContentItem(index);
    }
  };

  const toggleChecklistItem = (index: number) => {
    if (type === "checklist") {
      const newContent = [...content];
      if (typeof newContent[index] === "object") {
        (newContent[index] as { text: string; isMarked: boolean }).isMarked = !(
          newContent[index] as { text: string; isMarked: boolean }
        ).isMarked;
      }
      setContent(newContent);
      saveToHistory();
    }
  };

  const handleTypeChange = (newType: "bullet" | "checklist") => {
    if (newType === type) return;

    const convertedContent = content.map((item) => {
      if (newType === "checklist") {
        return typeof item === "string"
          ? { text: item, isMarked: false }
          : item;
      } else {
        return typeof item === "string" ? item : item.text;
      }
    });

    setType(newType);
    setContent(convertedContent);
    saveToHistory();
  };

  const copyToClipboard = async () => {
    const text = `${title}\n\n${content
      .map((item, index) => {
        const text = typeof item === "string" ? item : item.text;
        const prefix = type === "bullet" ? "• " : `${index + 1}. `;
        const status =
          type === "checklist" && typeof item === "object" && item.isMarked
            ? " ✓"
            : "";
        return `${prefix}${text}${status}`;
      })
      .join("\n")}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Note content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const exportNote = () => {
    const text = `${title}\n\n${content
      .map((item, index) => {
        const text = typeof item === "string" ? item : item.text;
        const prefix = type === "bullet" ? "• " : `${index + 1}. `;
        const status =
          type === "checklist" && typeof item === "object" && item.isMarked
            ? " ✓"
            : "";
        return `${prefix}${text}${status}`;
      })
      .join("\n")}`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "note"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-all duration-300">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-all duration-200 hover:scale-105"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-all duration-200 hover:scale-105"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-save indicator */}
          {autoSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-500"></div>
              <span>Saving...</span>
            </div>
          )}
          {lastSaved && !autoSaving && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Check className="w-3 h-3" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}

          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={exportNote}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Badge
            variant={type === "bullet" ? "default" : "secondary"}
            className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 transition-all duration-200"
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
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
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
          placeholder="Untitled Note"
          className="text-3xl font-bold bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-0 mb-4 focus:ring-0 shadow-none"
        />

        {/* Meta info */}
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            <span>{characterCount} characters</span>
          </div>
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            <span>{wordCount} words</span>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>
                {user.firstName || user.emailAddresses[0]?.emailAddress}
              </span>
            </div>
          )}
        </div>

        {/* Type selector */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={type === "bullet" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTypeChange("bullet")}
            className={`transition-all duration-200 hover:scale-105 ${
              type === "bullet"
                ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Bullet Points
          </Button>
          <Button
            variant={type === "checklist" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTypeChange("checklist")}
            className={`transition-all duration-200 hover:scale-105 ${
              type === "checklist"
                ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <CheckSquare className="w-5 h-5 mr-2" />
            Checklist
          </Button>
        </div>

        {/* Content items */}
        <div className="space-y-4">
          {content.map((item, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 group transition-all duration-200 ${
                focusedIndex === index
                  ? "bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 -m-3"
                  : ""
              }`}
            >
              <div className="flex items-center mt-3">
                {type === "bullet" ? (
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                ) : (
                  <button
                    onClick={() => toggleChecklistItem(index)}
                    className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                      typeof item === "object" && item.isMarked
                        ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500"
                        : "border-gray-400 dark:border-gray-500 hover:border-blue-600 dark:hover:border-blue-400"
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
                  </button>
                )}
              </div>

              <div className="flex-1">
                <Textarea
                  ref={(el) => {
                    textareaRefs.current[index] = el;
                  }}
                  data-content-item
                  value={typeof item === "string" ? item : item.text}
                  onChange={(e) => updateContentItem(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  placeholder={
                    index === 0 &&
                    (typeof item === "string" ? item === "" : item.text === "")
                      ? "Start writing your thoughts..."
                      : `${type === "bullet" ? "Bullet point" : "Task"} ${
                          index + 1
                        }`
                  }
                  className={`w-full bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none min-h-[40px] p-2 focus:ring-0 focus:outline-none text-lg leading-relaxed ${
                    type === "checklist" &&
                    typeof item === "object" &&
                    item.isMarked
                      ? "line-through text-gray-500 dark:text-gray-400"
                      : ""
                  }`}
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

              {/* Item actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicateContentItem(index)}
                  className="h-8 w-8 p-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                {content.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContentItem(index)}
                    className="h-8 w-8 p-0 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add item button */}
        <Button
          variant="ghost"
          onClick={addContentItem}
          className="mt-6 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 w-full justify-start transition-all duration-200 hover:scale-[1.02] hover:text-gray-700 dark:hover:text-gray-200 py-6"
        >
          <div className="flex items-center gap-4">
            <Plus className="w-5 h-5" />
            <span className="text-lg">
              Add {type === "bullet" ? "bullet point" : "task"}
            </span>
          </div>
        </Button>

        {/* Preview mode */}
        {showPreview && (
          <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Preview
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <h1 className="text-2xl font-bold mb-4">
                {title || "Untitled Note"}
              </h1>
              <div className="space-y-2">
                {content.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {type === "bullet" ? (
                      <>
                        <span className="text-blue-500 dark:text-blue-400 mt-2">
                          •
                        </span>
                        <span>
                          {typeof item === "string" ? item : item.text}
                        </span>
                      </>
                    ) : (
                      <>
                        <div
                          className={`w-4 h-4 border-2 rounded-sm mt-1 ${
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
                        <span
                          className={
                            typeof item === "object" && item.isMarked
                              ? "line-through text-gray-500 dark:text-gray-400"
                              : ""
                          }
                        >
                          {typeof item === "string" ? item : item.text}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 p-4 transition-all duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            >
              <Underline className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-yellow-500 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            >
              <Highlighter className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Ctrl+S to save</span>
            <span>Ctrl+Z to undo</span>
            <span>Ctrl+Enter to add item</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            >
              <Share className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom padding to account for fixed toolbar */}
      <div className="h-20"></div>
    </div>
  );
}
