import React from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

export const AlignMenu = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const handleAlignLeft = () => {
    editor.chain().focus().setTextAlign("left").run();
  };

  const handleAlignRight = () => {
    editor.chain().focus().setTextAlign("right").run();
  };

  const handleAlignCenter = () => {
    editor.chain().focus().setTextAlign("center").run();
  };

  const handleAlignJustify = () => {
    editor.chain().focus().setTextAlign("justify").run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title="Text align"
        className="flex cursor-pointer items-center gap-0 p-1 text-gray-600 hover:bg-slate-200 dark:text-gray-400 dark:hover:bg-slate-700"
      >
        <AlignJustify className="h-4 w-4" />
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={handleAlignLeft}
          className={cn(
            editor.isActive({ textAlign: "left" })
              ? "bg-slate-200 dark:bg-slate-700"
              : "bg-transparent",
          )}
        >
          <AlignLeft className="mr-2 h-4 w-4" />{" "}
          <span className="text-xs">Align left</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleAlignCenter}
          className={cn(
            editor.isActive({ textAlign: "center" })
              ? "bg-slate-200 dark:bg-slate-700"
              : "bg-transparent",
          )}
        >
          <AlignCenter className="mr-2 h-4 w-4" />{" "}
          <span className="text-xs">Align center</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleAlignRight}
          className={cn(
            editor.isActive({ textAlign: "right" })
              ? "bg-slate-200 dark:bg-slate-700"
              : "bg-transparent",
          )}
        >
          <AlignRight className="mr-2 h-4 w-4" />
          <span className="text-xs">Align right</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleAlignJustify}
          className={cn(
            editor.isActive({ textAlign: "justify" })
              ? "bg-slate-200 dark:bg-slate-700"
              : "bg-transparent",
          )}
        >
          <AlignJustify className="mr-2 h-4 w-4" />{" "}
          <span className="text-xs">Align justify</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
