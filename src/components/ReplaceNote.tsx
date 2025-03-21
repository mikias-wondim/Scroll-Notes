"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Replace } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

type ReplaceNoteProps = {
  onReplace: (responseText: string) => void; // Callback when the user confirms the replacement
  responseText: string; // The AI response to replace the note with
};

export function ReplaceNote({ onReplace, responseText }: ReplaceNoteProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleConfirm = () => {
    onReplace(responseText); // Trigger the replacement action
    setIsAlertOpen(false); // Close the dialog
  };

  return (
    <>
      {/* Tooltip-Embedded Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="size-5" asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAlertOpen(true)} // Open the alert dialog
            >
              <Replace className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Replace the note with this response</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Alert Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will replace your entire note with the AI's response.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
