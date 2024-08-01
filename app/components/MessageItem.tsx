// app/components/MessageItem.tsx
"use client";

import { useState } from "react";
import config from "@/config";

export default function MessageItem({ message }) {
  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-bold">{message.title}</h2>
      <p>{message.content}</p>
      <button
        className="btn btn-sm btn-primary"
        onClick={() => console.log("Reply to message")}
      >
        Reply
      </button>
    </div>
  );
}
