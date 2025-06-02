import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, FileText, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNoteService } from "@/services/noteService";
import type { Note, UpdateNoteRequest } from "@/types/note";

interface EditNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note;
  onNoteUpdated: (note: Note) => void;
}

export function EditNoteDialog({
  open,
  onOpenChange,
  note,
  onNoteUpdated,
}: EditNoteDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"bullet" | "checklist">("bullet");
  const [content, setContent] = useState<
    (string | { text: string; isMarked: boolean })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const noteService = useNoteService();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setType(note.type);
      // Handle both old string format and new object format
      const processedContent = note.content.map((item) => {
        if (typeof item === "string") {
          return note.type === "checklist"
            ? { text: item, isMarked: false }
            : item;
        }
        return item;
      });
      setContent([...processedContent]);
    }
  }, [note]);

  const addContentItem = () => {
    if (type === "checklist") {
      setContent([...content, { text: "", isMarked: false }]);
    } else {
      setContent([...content, ""]);
    }
  };

  const removeContentItem = (index: number) => {
    if (content.length > 1) {
      setContent(content.filter((_, i) => i !== index));
    }
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

  const toggleChecklistItem = (index: number) => {
    if (type === "checklist") {
      const newContent = [...content];
      if (typeof newContent[index] === "object") {
        (newContent[index] as { text: string; isMarked: boolean }).isMarked = !(
          newContent[index] as { text: string; isMarked: boolean }
        ).isMarked;
      }
      setContent(newContent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    const filteredContent = content.filter((item) =>
      typeof item === "string" ? item.trim() !== "" : item.text.trim() !== ""
    );
    if (filteredContent.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const updateData: UpdateNoteRequest = {
        title: title.trim(),
        type,
        content: filteredContent,
      };

      const updatedNote = await noteService.updateNote(note._id, updateData);
      onNoteUpdated(updatedNote);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>
            Update your note content and settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Note Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) =>
                setType(value as "bullet" | "checklist")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bullet" id="bullet" />
                <Label
                  htmlFor="bullet"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Bullet Points
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="checklist" id="checklist" />
                <Label
                  htmlFor="checklist"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" />
                  Checklist
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Content</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addContentItem}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {content.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    {type === "bullet" ? (
                      <span className="text-muted-foreground">•</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleChecklistItem(index)}
                        className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors ${
                          typeof item === "object" && item.isMarked
                            ? "bg-primary border-primary"
                            : "border-muted-foreground hover:border-primary"
                        }`}
                      >
                        {typeof item === "object" && item.isMarked && (
                          <svg
                            className="w-3 h-3 text-primary-foreground"
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
                    <Input
                      value={typeof item === "string" ? item : item.text}
                      onChange={(e) => updateContentItem(index, e.target.value)}
                      placeholder={`${
                        type === "bullet" ? "Bullet point" : "Checklist item"
                      } ${index + 1}...`}
                      className={`flex-1 ${
                        type === "checklist" &&
                        typeof item === "object" &&
                        item.isMarked
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    />
                  </div>
                  {content.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContentItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
