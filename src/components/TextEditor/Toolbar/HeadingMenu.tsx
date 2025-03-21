import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Heading,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

const HeadingMenu = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const handleHeading1 = () => {
    editor.chain().focus().toggleHeading({ level: 1 }).run();
  };

  const handleHeading2 = () => {
    editor.chain().focus().toggleHeading({ level: 2 }).run();
  };

  const handleHeading3 = () => {
    editor.chain().focus().toggleHeading({ level: 3 }).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-0 p-1 text-gray-600 hover:bg-slate-200 dark:text-gray-400 dark:hover:bg-slate-700">
        <Heading className="h-4 w-4" />
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={handleHeading1}
          className={cn(
            editor.isActive("heading", { level: 1 })
              ? "bg-slate-200 dark:bg-slate-700"
              : "bg-transparent",
          )}
        >
          <Heading1 className="mr-2 h-6 w-6" />{" "}
          <span className="text-xl">Heading 1</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleHeading2}
          className={cn(
            editor.isActive("heading", { level: 2 })
              ? "bg-slate-200 dark:bg-slate-700"
              : "bg-transparent",
          )}
        >
          <Heading2 className="mr-2 h-5 w-5" />{" "}
          <span className="text-lg">Heading 2</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleHeading3}
          className={cn(
            editor.isActive("heading", { level: 3 })
              ? "bg-slate-200 dark:bg-slate-700"
              : "bg-transparent",
          )}
        >
          <Heading3 className="mr-2 h-4 w-4" />{" "}
          <span className="text-md">Heading 3</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeadingMenu;
