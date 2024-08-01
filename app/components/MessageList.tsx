// app/components/MessageList.tsx
"use client";

import { useState } from "react";
import MessageItem from "./MessageItem";

export default function MessageList({ messages }) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}
    </div>
  );
}
