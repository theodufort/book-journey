// app/pages/messaging-system.tsx
"use client";

import { useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import MessageList from "@/components/MessageList";
import SendMessageForm from "@/components/SendMessageForm";
import config from "@/config";

export default function MessagingSystem() {
  const [messages, setMessages] = useState([]);

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <HeaderDashboard />

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
          Messaging System
        </hassistant>

        <MessageList messages={messages} />

        <SendMessageForm onSendMessage={(message) => setMessages((prevMessages) => [...prevMessages, message])} />
      </section>
    </main>
  );
}
