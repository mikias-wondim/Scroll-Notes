"use client";

import useNote from "@/hooks/useNote";
import { Note } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarMenuButton } from "./ui/sidebar";
import Link from "next/link";
import { format } from "date-fns";

type Props = {
  note: Note;
};

function SelectNoteButton({ note }: Props) {
  const noteId = useSearchParams().get("noteId") || "";
  const { noteText: selectedNoteText } = useNote();
  const [shouldUseGlobalNoteText, setShouldUseGlobalNoteText] = useState(false);
  const [localNoteText, setLocalNoteText] = useState(note.text);
  const [formattedText, setFormattedText] = useState("");

  useEffect(() => {
    if (noteId === note.id) {
      setShouldUseGlobalNoteText(true);
    } else {
      setShouldUseGlobalNoteText(false);
    }
  }, [noteId, note.id]);

  useEffect(() => {
    if (shouldUseGlobalNoteText) {
      setLocalNoteText(selectedNoteText);
    }
  }, [selectedNoteText, shouldUseGlobalNoteText]);

  // Move all document operations to useEffect to ensure client-side only
  useEffect(() => {
    const textToFormat = shouldUseGlobalNoteText
      ? selectedNoteText
      : localNoteText;

    // Format HTML content
    const formatHeader = (html: string) => {
      // Create a temporary div to parse HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // Get all paragraph and heading elements
      const paragraphs = tempDiv.querySelectorAll("p, h1, h2, h3");

      // If no paragraphs found, return original text
      if (paragraphs.length === 0) {
        return html;
      }

      // Return first paragraph's text content
      return paragraphs[0].textContent || "";
    };

    const formattedResult = formatHeader(textToFormat) || "EMPTY NOTE";
    setFormattedText(formattedResult);
  }, [localNoteText, selectedNoteText, shouldUseGlobalNoteText]);

  // Server-side fallback
  const fallbackText = (localNoteText || "EMPTY NOTE").substring(0, 30);

  return (
    <SidebarMenuButton
      asChild
      className={`items-start gap-0 pr-12 ${note.id === noteId && "bg-sidebar-accent/80 border-muted/80 border"}`}
    >
      <Link href={`/?noteId=${note.id}`} className="flex h-fit flex-col">
        <p className="w-full truncate overflow-hidden text-ellipsis whitespace-nowrap">
          {formattedText || fallbackText}
        </p>

        <p className="text-muted-foreground text-xs">
          {format(note.updatedAt, "MMM d, yyyy ' ' h:mm a")}
        </p>
      </Link>
    </SidebarMenuButton>
  );
}

export default SelectNoteButton;
