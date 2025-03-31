import React from 'react';
import { Textarea } from "../../components/ui/textarea";

interface EditorProps {
  onContentChange: (content: string) => void;
}

// Editor

export function Editor({ onContentChange }: EditorProps) {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(event.target.value);
  };

  return <Textarea placeholder="Add remarks..." onChange={handleChange} />
};
