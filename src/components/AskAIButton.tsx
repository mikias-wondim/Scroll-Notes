"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import {
  ArrowUpIcon,
  SparklesIcon,
  EraserIcon,
  Replace,
  ListStart,
  ListEnd,
} from "lucide-react";
import {
  askAIAboutNotesAction,
  clearConversationHistoryAction,
  getConversationHistoryAction,
  updateNoteAction,
} from "@/app/actions/notes";
import "@/styles/ai-response.css";
import { format } from "date-fns";
import { Tooltip } from "./ui/tooltip";
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import useNote from "@/hooks/useNote";
import { ReplaceNote } from "./ReplaceNote";

type Conversation = {
  id: string;
  question: string;
  response: string;
  createdAt: Date;
};

type Props = {
  user: User | null;
  noteId: string;
  noteText: string;
  prefetchedConversations?: Conversation[];
};

let updateTimeout: NodeJS.Timeout;

function AskAIButton({
  user,
  noteId,
  prefetchedConversations,
  noteText,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(
    prefetchedConversations || [],
  );
  const [error, setError] = useState<string | null>(null);
  const { setNoteText } = useNote();

  // Track the current noteId for comparison
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(
    noteId || null,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update conversations when prefetchedConversations changes
  useEffect(() => {
    if (prefetchedConversations) {
      setConversations(prefetchedConversations);
      scrollToBottom();
    }
  }, [prefetchedConversations]);

  const handleOnOpenChange = (isOpen: boolean) => {
    if (!user) {
      router.push("/login");
    } else {
      if (isOpen) {
        setQuestionText("");
        // Check if this is a different note than before
        if (currentNoteId !== noteId) {
          setConversations(prefetchedConversations || []);
          setCurrentNoteId(noteId);
        }

        // Only fetch if we don't have prefetched conversations
        if (!prefetchedConversations) {
          loadConversationHistory();
        }
        // Scroll to the bottom after the dialog opens
        setTimeout(scrollToBottom, 50); // Small delay to ensure the content is rendered
      }
      setOpen(isOpen);
    }
  };

  const loadConversationHistory = useCallback(() => {
    if (!noteId) {
      setError("Note ID is required");
      return;
    }

    // setIsLoading(true);
    startTransition(async () => {
      const result = await getConversationHistoryAction(noteId);
      if (result.errorMessage) {
        setError(result.errorMessage);
      } else {
        scrollToBottom();
        setConversations(result.conversations);
      }
      setIsLoading(false);
    });
  }, [noteId, setError, setIsLoading, setConversations]);

  const handleClearConversation = () => {
    startTransition(async () => {
      const result = await clearConversationHistoryAction(noteId);
      if (typeof result === "object" && result.errorMessage) {
        setError(result.errorMessage);
      } else {
        setConversations([]);
      }
    });
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleClickInput = () => {
    textareaRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!questionText.trim()) return;
    if (!noteId) {
      setError("Note ID is required");
      return;
    }

    const currentQuestion = questionText;
    setQuestionText("");
    setTimeout(scrollToBottom, 100);

    startTransition(async () => {
      const response = await askAIAboutNotesAction(noteId, currentQuestion);

      // Refresh the conversation history
      loadConversationHistory();

      setTimeout(scrollToBottom, 100);
    });
  };

  const scrollToBottom = () => {
    contentRef.current?.scrollTo({
      top: contentRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Function to handle inserting/replacing text in the note
  const handleModifyNote = async (
    action: "insertStart" | "insertEnd" | "replace",
    responseText: string,
  ) => {
    if (!noteId) {
      setError("Note ID is required");
      return;
    }

    // Use the current note text from state
    const currentNoteText = noteText;

    let updatedText = currentNoteText;

    // Modify the note text based on the action
    switch (action) {
      case "insertStart":
        updatedText = `${responseText}\n\n${currentNoteText}`;
        break;
      case "insertEnd":
        updatedText = `${currentNoteText}\n\n${responseText}`;
        break;
      case "replace":
        updatedText = responseText;
        break;
      default:
        break;
    }

    // Use handleUpdateNote to update the note in the UI and database
    handleUpdateNote(updatedText);
  };

  const handleUpdateNote = (content: string) => {
    // Only update if content actually changed to prevent loops
    if (content !== noteText) {
      setNoteText(content);
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        updateNoteAction(noteId, content);
      }, 500); // Debounced update

      setOpen(false);
    }
  };

  // Update currentNoteId when noteId prop changes
  useEffect(() => {
    if (noteId !== currentNoteId) {
      setCurrentNoteId(noteId);
      setConversations(prefetchedConversations || []);

      // Only fetch if we don't have prefetched conversations
      if (!prefetchedConversations && noteId) {
        console.log("loading conversation history");
        loadConversationHistory();
        scrollToBottom();
      }
    }
  }, [noteId, currentNoteId, loadConversationHistory, prefetchedConversations]);

  return (
    <Dialog open={open} onOpenChange={handleOnOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <SparklesIcon className="size-4" /> Ask AI
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[85vh] max-w-4xl flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Ask AI About This Note</DialogTitle>
            <DialogDescription>
              Our AI can answer questions about this specific note
            </DialogDescription>
          </div>
        </DialogHeader>

        <div
          ref={contentRef}
          className="scrollbar-hide mt-4 flex flex-1 flex-col gap-8 overflow-y-auto"
        >
          {isLoading ? (
            <p className="animate-pulse text-center text-sm">
              Loading conversations...
            </p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : conversations.length === 0 ? (
            <p className="text-muted-foreground text-center text-sm">
              No conversation history yet. Ask a question to get started.
            </p>
          ) : (
            conversations.map((conv, index) => (
              <Fragment key={conv.id}>
                <div>
                  <p className="bg-muted text-muted-foreground ml-auto max-w-[60%] rounded-md px-2 py-1 text-sm">
                    {conv.question}
                  </p>
                  <p className="text-muted-foreground text-right text-xs">
                    {format(
                      new Date(conv.createdAt),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </p>
                </div>
                <div>
                  <p
                    className="bot-response text-muted-foreground text-sm"
                    dangerouslySetInnerHTML={{
                      __html: conv.response.replace(/^```html|```$/g, ""),
                    }}
                  />
                  {index === conversations.length - 1 && (
                    <div className="flex flex-row items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="size-5" asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleModifyNote("insertStart", conv.response)
                              }
                            >
                              <ListStart className="size-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Add at the start of the note
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="size-5" asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleModifyNote("insertEnd", conv.response)
                              }
                            >
                              <ListEnd className="size-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Add at the end of the note
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <ReplaceNote
                        responseText={conv.response}
                        onReplace={(responseText) =>
                          handleModifyNote("replace", responseText)
                        }
                      />
                    </div>
                  )}
                </div>
              </Fragment>
            ))
          )}
          {isPending && <p className="animate-pulse text-sm">Thinking...</p>}
        </div>

        <div
          className="mt-4 flex items-center gap-4"
          onClick={handleClickInput}
        >
          <div className="flex flex-1 cursor-text flex-row items-center justify-between rounded-lg border p-4">
            <Textarea
              ref={textareaRef}
              placeholder="Ask me anything about this note..."
              className="placeholder:text-muted-foreground resize-none rounded-none border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 lg:text-base"
              style={{
                minHeight: "0",
                lineHeight: "normal",
              }}
              rows={1}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              disabled={isPending}
            />
            <Button
              className="ml-auto size-8 rounded-full"
              onClick={handleSubmit}
              type="button"
              disabled={isPending || !questionText.trim()}
            >
              <ArrowUpIcon className="text-background" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleClearConversation}
            disabled={conversations.length === 0 || isPending}
            className="size-10 cursor-pointer rounded-full hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-500 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-500"
          >
            <EraserIcon />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AskAIButton;
