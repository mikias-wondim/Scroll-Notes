"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useNote from "@/hooks/useNote";
import { updateNoteAction } from "@/app/actions/notes";
import TextEditor from "./TextEditor";

type Props = {
  noteId: string;
  startingNoteText: string;
};

let updateTimeout: NodeJS.Timeout;

function NoteTextInput({ noteId, startingNoteText }: Props) {
  const noteIdParam = useSearchParams().get("noteId") || "";
  const { noteText, setNoteText } = useNote();
  const [resetKey, setResetKey] = useState(0);

  // Reset editor when switching between notes
  useEffect(() => {
    if (noteIdParam === noteId) {
      setNoteText(startingNoteText);
    }
  }, [startingNoteText, noteIdParam, noteId, setNoteText]);

  // Use reset key to force editor clear when noteText is empty
  useEffect(() => {
    if (noteText === "") {
      setResetKey((prev) => prev + 1);
    }
  }, [noteText]);

  const handleUpdateNote = (content: string) => {
    // Only update if content actually changed to prevent loops
    if (content !== noteText) {
      setNoteText(content);

      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        updateNoteAction(noteId, content);
      }, 500); // Reduced from 1500ms to 500ms for more responsive saving
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)] w-full flex-col items-center">
      <TextEditor
        isEditable={true}
        content={noteText}
        onChange={handleUpdateNote}
        resetKey={resetKey}
        width="max-w-5xl"
        height="h-full"
      />
    </div>
  );
}

export default NoteTextInput;
