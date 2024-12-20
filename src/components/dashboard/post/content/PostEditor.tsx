import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface PostEditorProps {
  content: string;
  onEditContentChange: (content: string) => void;
}

export const PostEditor = ({ content, onEditContentChange }: PostEditorProps) => {
  return (
    <textarea
      value={content}
      onChange={(e) => onEditContentChange(e.target.value)}
      className="w-full min-h-[100px] p-2 border rounded"
    />
  );
};