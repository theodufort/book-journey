"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaRegCopy } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

interface Props {
  editable: boolean;
  mode: "chat" | "view";
  conversationId: string | null;
}

interface ChatMessage {
  role: "ai" | "user";
  messageContent: string;
}

function HelperUI({ editable, mode, conversationId }: Props) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInputText, setChatInputText] = useState("");
  const [savedConversationId, setSavedConversationId] = useState<string | null>(
    null
  );
  const [isConversationSaved, setIsConversationSaved] = useState(false);
  const router = useRouter();

  const chatContainerRef = useRef<HTMLDivElement>(null);

  async function fetchConversationById(conversationId: string) {
    try {
      const response = await fetch(
        `/api/ai/recommendations/find/${conversationId}`
      );
      const data = await response.json();

      if (response.ok) {
        setChatMessages(data.messages);
      } else {
        console.error("Error fetching conversation:", data.error);
        setChatMessages([
          {
            role: "ai",
            messageContent:
              "Sorry, this conversation doesn't exist or couldn't be loaded.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      setChatMessages([
        {
          role: "ai",
          messageContent:
            "An error occurred while trying to load the conversation.",
        },
      ]);
    }
  }

  async function saveConversation(
    conversation: ChatMessage[],
    conversationId?: string
  ) {
    try {
      const response = await fetch("/api/ai/recommendations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation, conversationId, replace: true }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Conversation saved/updated with ID:", data.conversationId);
        return data.conversationId;
      } else {
        console.error("Error saving/updating conversation:", data.error);
      }
    } catch (error) {
      console.error("Error saving/updating conversation:", error);
    }
  }

  const handleSend = async () => {
    if (chatInputText.trim() === "") return;

    const userMessage: ChatMessage = {
      role: "user",
      messageContent: chatInputText,
    };

    setChatMessages((prevMessages) => [...prevMessages, userMessage]);
    setChatInputText("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/ai/recommendations/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInputText }),
      });

      if (!response.body) {
        throw new Error("No response body from the server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      setChatMessages((prevMessages) => [
        ...prevMessages,
        { role: "ai", messageContent: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        setChatMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessageIndex = updatedMessages.length - 1;

          if (updatedMessages[lastMessageIndex]?.role === "ai") {
            updatedMessages[lastMessageIndex].messageContent = aiResponse;
          }

          return updatedMessages;
        });
      }

      const newConversation: any = [
        ...chatMessages,
        userMessage,
        { role: "ai", messageContent: aiResponse },
      ];
      const updatedConversationId = await saveConversation(
        newConversation,
        savedConversationId || conversationId
      );
      setSavedConversationId(updatedConversationId);
      setIsConversationSaved(true);
      setChatLoading(false);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: ChatMessage = {
        role: "ai",
        messageContent: "Sorry, I couldn't process your request.",
      };
      setChatMessages((prevMessages) => [...prevMessages, errorMessage]);
      setChatLoading(false);
    }
  };

  const addInitialMessageIfNeeded = () => {
    if (chatMessages.length === 0 && mode === "chat") {
      setChatMessages([
        { role: "ai", messageContent: "Ask me for suggestions!" },
      ]);
    }
  };

  useEffect(() => {
    if (mode === "view" && conversationId) {
      fetchConversationById(conversationId);
    } else if (mode === "chat") {
      if (!savedConversationId) {
        addInitialMessageIfNeeded();
      } else {
        fetchConversationById(savedConversationId);
      }
    }
  }, [mode, conversationId, savedConversationId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <section>
      <div className="max-w-7xl mx-auto px-8 py-5 text-center">
        <h2 className="max-w-3xl mx-auto font-extrabold text-4xl md:text-5xl tracking-tight">
          AI Book Recommendations
        </h2>
      </div>
      <div className="card bg-base-200 shadow-xl mt-5 w-full max-w-6xl mx-auto">
        <div
          className="card-body flex flex-col h-full max-h-[600px] overflow-y-auto"
          ref={chatContainerRef}
        >
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`chat ${
                message.role === "ai" ? "chat-start" : "chat-end"
              }`}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="Avatar"
                    src={
                      message.role === "ai"
                        ? "https://img.icons8.com/fluency/48/000000/bot.png"
                        : "https://img.icons8.com/fluency/48/000000/user-male-circle.png"
                    }
                  />
                </div>
              </div>
              <div className="chat-bubble leading-loose relative">
                <ReactMarkdown>{message.messageContent}</ReactMarkdown>
                <button
                  className="absolute bottom-2 right-2 text-gray-500 hover:text-gray-700 contents"
                  onClick={() => {
                    const tempElement = document.createElement('div');
                    tempElement.innerHTML = message.messageContent;
                    const plainText = tempElement.textContent || tempElement.innerText || "";
                    navigator.clipboard.writeText(plainText);
                    alert("Message copied to clipboard!");
                  }}
                >
                  <FaRegCopy />
                </button>
              </div>
            </div>
          ))}
        </div>

        {mode === "chat" && (
          <>
            <div
              className={`card-actions m-2 mt-5 p-5 flex items-end justify-between max-h-max ${
                editable ? "block" : "hidden"
              }`}
            >
              <label className="form-control flex-grow md:mr-5">
                <input
                  type="text"
                  value={chatInputText}
                  placeholder="Ask the AI for book recommendations"
                  className="input input-bordered w-full m-auto"
                  disabled={chatLoading}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !chatLoading && chatInputText.trim() !== '') {
                      handleSend();
                    }
                  }}
                />
              </label>
              <div className="md:flex m-auto">
                {isConversationSaved && savedConversationId && (
                  <button
                    className="btn btn-secondary mr-2"
                    onClick={() => {
                      const url = `https://mybookquest.com/tools/ai-book-recommendations/${savedConversationId}`;
                      navigator.clipboard.writeText(url);
                      alert("Conversation link copied to clipboard!");
                    }}
                  >
                    Share
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  disabled={chatLoading || chatInputText === ""}
                  onClick={handleSend}
                >
                  {chatLoading ? "Loading..." : "Send"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default HelperUI;
