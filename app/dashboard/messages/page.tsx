"use client";

import { useEffect, useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface ChatUser {
  id: string;
  name: string;
  lastMessage: string;
}

type Friend = {
  id: string;
  name: string;
};

type FriendData = {
  friend_id: string;
};
export default function Messages() {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiver, setReceiver] = useState("");
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showFriendList, setShowFriendList] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    if (user) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
        } else {
          setMessages(data || []);
          updateChatUsers(data || []);
        }
      };

      const fetchFriends = async () => {
        // Fetch the friend ids
        const { data: friendsData, error: friendsError } = await supabase
          .from("friends")
          .select("friend_id")
          .eq("user_id", user.id)
          .eq("status", "accepted");

        if (friendsError) {
          console.error(friendsError);
          return;
        }

        if (!friendsData) {
          console.error("No friend data found");
          return;
        }

        // Fetch user details for each friend
        const friends = await Promise.all(
          friendsData.map(async (x: FriendData) => {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("id, raw_user_meta_data->>name")
              .eq("id", x.friend_id)
              .single();

            if (userError) {
              console.error(userError);
              return null;
            }

            return userData as Friend; // Ensure proper typing here
          })
        );

        // Filter out any null values in case of errors
        const validFriends = friends.filter((f): f is Friend => f !== null);

        setFriends(validFriends);
      };

      fetchMessages();
      fetchFriends();

      const messagesSubscription = supabase
        .channel("messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            updateChatUsers([...messages, newMessage]);
          }
        )
        .subscribe();

      return () => {
        messagesSubscription.unsubscribe();
      };
    }
  }, [user, supabase]);

  const updateChatUsers = (messages: Message[]) => {
    const userMap = new Map<string, ChatUser>();
    messages.forEach((message) => {
      const otherUserId =
        message.sender_id === user?.id
          ? message.receiver_id
          : message.sender_id;
      if (!userMap.has(otherUserId)) {
        userMap.set(otherUserId, {
          id: otherUserId,
          name: `User ${otherUserId.slice(0, 5)}`,
          lastMessage: message.content,
        });
      } else {
        userMap.get(otherUserId)!.lastMessage = message.content;
      }
    });
    setChatUsers(Array.from(userMap.values()));
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || !selectedUser) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selectedUser,
      content: newMessage.trim(),
    });

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
    }
  };

  const selectUser = (userId: string) => {
    setSelectedUser(userId);
    setReceiver(userId);
  };

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <HeaderDashboard />

        <h1 className="text-3xl md:text-4xl font-extrabold">Messages</h1>

        <div className="flex bg-base-200 rounded-lg">
          {/* Sidebar */}
          <div className="w-1/4 border-r border-base-300 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chats</h2>
              <button
                className="btn btn-circle btn-sm"
                onClick={() => setShowFriendList(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <dialog className="modal" open={showFriendList}>
                <div className="modal-box w-11/12 h-1/2">
                  <h3 id="options-menu" className="text-lg font-bold mb-2">
                    Friends
                  </h3>
                  <form method="dialog">
                    <button
                      className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                      onClick={() => {
                        setShowFriendList(false);
                      }}
                    >
                      ✕
                    </button>
                  </form>
                  <div className="absolute right-0 mt-2ounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="grid grid-cols-3 gap-5">
                      {friends.length > 0 ? (
                        friends.map((friend) => (
                          <button
                            key={friend.id}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                            role="menuitem"
                            onClick={() => {
                              setSelectedUser(friend.id);
                              setShowFriendList(false);
                            }}
                          >
                            {friend.name}
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-2">
                          You don't have any friends yet!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </dialog>
            </div>

            {chatUsers.length != 0 ? (
              <ul>
                {chatUsers.map((chatUser) => (
                  <li
                    key={chatUser.id}
                    className={`cursor-pointer p-2 rounded ${
                      selectedUser === chatUser.id
                        ? "bg-base-300"
                        : "hover:bg-base-300"
                    }`}
                    onClick={() => selectUser(chatUser.id)}
                  >
                    <div className="font-semibold">{chatUser.name}</div>
                    <div className="text-sm text-base-content/70 truncate">
                      {chatUser.lastMessage}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div>Start a new conversation!</div>
            )}
          </div>

          {/* Chat area */}
          <div className="w-3/4 p-4">
            <div className="h-96 overflow-y-auto mb-4">
              {messages
                .filter(
                  (message) =>
                    message.sender_id === selectedUser ||
                    message.receiver_id === selectedUser
                )
                .map((message) => (
                  <div
                    key={message.id}
                    className={`chat ${
                      message.sender_id === user?.id ? "chat-end" : "chat-start"
                    }`}
                  >
                    <div className="chat-bubble">{message.content}</div>
                    <div className="chat-footer opacity-50">
                      {new Date(message.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message here"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="input input-bordered flex-grow"
              />
              <button type="submit" className="btn btn-primary">
                Send
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
