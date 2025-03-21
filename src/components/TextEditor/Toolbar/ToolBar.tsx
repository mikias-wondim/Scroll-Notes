import { Editor } from "@tiptap/react";
import {
  Bold,
  Braces,
  Code,
  Italic,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import { AlignMenu } from "./AlignMenu";
import HeadingMenu from "./HeadingMenu";
import { ToolbarIconButton } from "./IconButton";

export const ToolBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const handleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const handleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const handleUnderline = () => {
    editor.chain().focus().toggleUnderline().run();
  };

  const handleCode = () => {
    editor.chain().focus().toggleCode().run();
  };

  const handleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
  };

  const handleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
  };

  const handleCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  return (
    <div className="flex flex-wrap items-center space-x-2 px-2">
      <HeadingMenu editor={editor} />
      <AlignMenu editor={editor} />
      <ToolbarIconButton
        onClick={handleBold}
        isActive={editor.isActive("bold")}
        title="bold (ctrl + b)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarIconButton>
      <ToolbarIconButton
        onClick={handleItalic}
        isActive={editor.isActive("italic")}
        title="italic (ctrl + i)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarIconButton>
      <ToolbarIconButton
        onClick={handleUnderline}
        isActive={editor.isActive("underline")}
        title="underline (ctrl + u)"
      >
        <Underline className="h-4 w-4" />
      </ToolbarIconButton>

      <ToolbarIconButton
        onClick={handleCode}
        isActive={editor.isActive("code")}
        title="code (ctrl + e)"
      >
        <Code className="h-4 w-4" />
      </ToolbarIconButton>

      <ToolbarIconButton
        onClick={handleBulletList}
        isActive={editor.isActive("bulletList")}
        title="bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarIconButton>
      <ToolbarIconButton
        onClick={handleOrderedList}
        isActive={editor.isActive("orderedList")}
        title="ordered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarIconButton>
      <ToolbarIconButton
        onClick={handleCodeBlock}
        isActive={editor.isActive("codeBlock")}
        title="code block"
      >
        <Braces className="h-4 w-4" />
      </ToolbarIconButton>
    </div>
  );
};
