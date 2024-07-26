"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import AddFriend from "@/components/AddFriend";
import { Database } from "@/types/supabase";
type Friend = {
  id: string;
  name: string;
};

type FriendData = {
  friend_id: string;
};
export default function Profile() {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchFriends();
      fetchFriendRequests();
    }
  }, [user]);

  async function fetchFriendRequests() {
    if (!user) return;

    const { data: requests, error } = await supabase
      .from("friends")
      .select("*")
      .eq("friend_id", user.id)
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching friend requests:", error);
    } else {
      setFriendRequests(requests || []);
    }
  }

  async function handleFriendRequest(
    requestId: string,
    action: "accept" | "refuse"
  ) {
    if (!user) return;

    const newStatus = action === "accept" ? "accepted" : "rejected";

    const { error } = await supabase
      .from("friends")
      .update({ status: newStatus })
      .eq("id", requestId);

    if (error) {
      console.error("Error updating friend request:", error);
    } else {
      fetchFriendRequests();
      if (action === "accept") {
        fetchFriends();
      }
    }
  }

  async function fetchProfile() {
    if (!user) return;

    const { data: preferences, error: preferencesError } = await supabase
      .from("user_preferences")
      .select("preferred_categories, username, bio, profile_picture_url")
      .eq("user_id", user.id)
      .single();

    if (preferencesError) {
      console.error("Error fetching preferences:", preferencesError);
    } else {
      setPreferredCategories(preferences?.preferred_categories || []);
      setUsername(preferences?.username || "");
      setBio(preferences?.bio || "");
      setProfilePictureUrl(preferences?.profile_picture_url || "");
    }
  }

  async function fetchFriends() {
    if (!user) return;

    const { data: friendsData, error: friendsError } = await supabase
      .from("friends")
      .select("user_id, friend_id")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq("status", "accepted");

    if (friendsError) {
      console.error("Error fetching friends:", friendsError);
    } else {
      if (friendsData?.length != 0) {
        friendsData.forEach((friend, i) => {
          if (friend?.friend_id === user?.id) {
            friendsData[i].friend_id = friend.user_id;
          }
        });
      }
      setFriends(friendsData || []);
    }
  }

  async function updateProfile() {
    if (!user) return;

    setIsUpdated(false);
    const { error: preferencesError } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        preferred_categories: preferredCategories,
        username,
        bio,
        profile_picture_url: profilePictureUrl,
      });

    if (preferencesError) {
      console.error("Error updating preferences:", preferencesError);
    } else {
      setIsUpdated(true);
      setTimeout(() => setIsUpdated(false), 3000);
    }
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <HeaderDashboard />

        <h1 className="text-3xl md:text-4xl font-extrabold">My Profile</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateProfile();
          }}
          className="space-y-6"
        >
          <div>
            <span className="label-text">
              Preferred Book Categories (Choose up to 3)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {[
                "Fiction",
                "Non-fiction",
                "Mystery",
                "Science Fiction",
                "Fantasy",
                "Romance",
                "Thriller",
                "Biography",
                "History",
                "Self-help",
              ].map((category) => (
                <label
                  key={category}
                  className="label cursor-pointer justify-start gap-2"
                >
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={preferredCategories.includes(category)}
                    onChange={() => {
                      setPreferredCategories((prev) => {
                        if (prev.includes(category)) {
                          return prev.filter((c) => c !== category);
                        } else if (prev.length < 3) {
                          return [...prev, category];
                        }
                        return prev;
                      });
                    }}
                  />
                  <span className="label-text">{category}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Save Profile
          </button>
          {isUpdated && (
            <p className="text-green-500 mt-2">Profile updated successfully!</p>
          )}
        </form>
        {user ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Share Your User ID</h2>
            <p>Your user ID: {user.id}</p>
          </div>
        ) : null}
        <AddFriend user={user} onFriendAdded={fetchFriends} />
        <div>
          <h2 className="text-2xl font-bold mb-4">Friend Requests</h2>
          {friendRequests.length > 0 ? (
            <ul>
              {friendRequests.map((request) => (
                <li key={request.id} className="mb-2 flex items-center">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user?.user_metadata?.avatar_url}
                      alt={"Profile picture"}
                      className="rounded-full shrink-0"
                      referrerPolicy="no-referrer"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <span className="w-8 h-8 bg-base-100 flex justify-center items-center rounded-full shrink-0 capitalize ">
                      {user?.email?.charAt(0)}
                    </span>
                  )}
                  <span className="ml-2">{request.user_id}</span>
                  <button
                    onClick={() => handleFriendRequest(request.id, "accept")}
                    className="btn btn-sm btn-primary ml-2"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleFriendRequest(request.id, "refuse")}
                    className="btn btn-sm btn-error ml-2"
                  >
                    Refuse
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending friend requests.</p>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">My Friends</h2>
          {friends.length > 0 ? (
            <ul>
              {friends.map((friend) => (
                <li key={friend.friend_id}>{friend.friend_id}</li>
              ))}
            </ul>
          ) : (
            <p>You haven't added any friends yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
