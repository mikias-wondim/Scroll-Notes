"use client";

import BulletList from "@tiptap/extension-bullet-list";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Heading from "@tiptap/extension-heading";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { ToolBar } from "./Toolbar/ToolBar";
import { cn } from "@/lib/utils";

interface Props {
  isEditable?: boolean;
  content: string;
  onChange: (content: string) => void;
  resetKey?: number;
  width?: string;
  height?: string;
}

const TextEditor = ({
  isEditable = false,
  content,
  onChange,
  resetKey = 0,
  width = "max-w-4xl",
  height = "h-full",
}: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      ListItem,

      Code.configure({
        HTMLAttributes: {
          class: "rounded-xl px-3 py-1 bg-gray-100 dark:bg-gray-900 my-2",
        },
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),

      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: "font-bold",
        },
      }),

      BulletList.configure({
        HTMLAttributes: {
          class: "pl-8 list-disc",
        },
      }),

      OrderedList.configure({
        HTMLAttributes: {
          class: "pl-8 list-decimal",
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class:
            "bg-gray-100 dark:bg-gray-900 rounded-sm p-4 border border-gray-200 dark:border-gray-800 my-2",
        },
      }),
    ],
    editable: isEditable,
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-li:my-1 prose-ul:list-disc prose-ol:list-decimal",
          "prose-sm sm:prose lg:prose-lg xl:prose-xl px-2 pb-2 pt-3 border custom-scrollbar mb-4",
          "resize-none border p-4 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
          width,
          height,

          isEditable ? "border-t-0" : "border-0",

          "border-gray-200 dark:border-gray-800 rounded-b-sm",

          isEditable ? "min-h-[180px]" : "",

          "w-full focus:ring-0 focus:outline-none text-xs md:text-sm",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && resetKey > 0) {
      editor.commands.setContent("");
    }
  }, [editor, resetKey]);

  useEffect(() => {
    editor?.setEditable(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditable]);

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      if (!editor.isFocused) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className={cn("flex h-full w-full flex-col", width)}>
        {isEditable && (
          <div className="w-full rounded-t-sm border bg-slate-100 dark:bg-gray-900">
            <ToolBar editor={editor} />
          </div>
        )}
        <EditorContent
          editor={editor}
          placeholder="Start typing..."
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default TextEditor;
