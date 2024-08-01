// app/components/SendMessageForm.tsx
"use client";

import { useState } from "react";
import config from "@/config";

export default function SendMessageForm({ onSendMessage }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <form className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="input input-bordered w-full"
      />
      <textarea
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        className="textarea textarea-bordered h-24 w-full"
      />
      <button
        type="submit"
        onClick={(e) => {
          e.preventDefault();
          onSendMessage({ title, content });
        }}
        className="btn btn-primary"
      >
        Send Message
      </button>
    </form>
  );
}
