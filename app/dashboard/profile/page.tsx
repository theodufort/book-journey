"use client";
import CategorySelection from "@/components/CategorySelection";
import HeaderDashboard from "@/components/DashboardHeader";
import ImportFromApps from "@/components/ImportFromApps";
import { LanguagePreferences } from "@/components/LanguagePreferences";
import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/libs/locale";
import { getUser } from "@/libs/supabase/queries";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
type Friend = {
  id: string;
  name: string;
  img: string;
};

type FriendData = {
  friend_id: string;
};
export default function Profile() {
  const t = useTranslations("Profile");
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const getUserCall = async () => {
      const user = await getUser(supabase);
      setUser(user);
      if (user) {
        const { data: preferences, error } = await supabase
          .from("user_preferences")
          .select("preferred_ui_language")
          .eq("user_id", user.id)
          .single();

        if (!error && preferences?.preferred_ui_language) {
          await setUserLocale(preferences.preferred_ui_language as Locale);
        }
      } else {
        console.log("User not authenticated");
      }
    };
    getUserCall();
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

    // Fetch username from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else {
      setUsername(profile?.username || "");
    }

    // Fetch other preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from("user_preferences")
      .select("preferred_categories, bio, profile_picture_url")
      .eq("user_id", user.id)
      .single();

    if (preferencesError) {
      console.error("Error fetching preferences:", preferencesError);
    } else {
      setPreferredCategories(preferences?.preferred_categories || []);
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
        const friendsCleaned = await Promise.all(
          friendsData.map(async (friend, i) => {
            if (friend?.friend_id === user?.id) {
              friendsData[i].friend_id = friend.user_id;
            }
            const { data: userData, error: userError }: any =
              await supabase.rpc("get_user_metadata", {
                user_id: friend.friend_id,
              });
            const cleanedUserData: Friend = {
              id: friend.friend_id,
              name: userData.raw_user_meta_data.name,
              img: userData.raw_user_meta_data.avatar_url,
            };
            if (userError) {
              console.error(userError);
              return null;
            }

            return cleanedUserData;
          })
        );
        setFriends(friendsCleaned || []);
      }
    }
  }

  async function updateProfile() {
    if (!user) return;

    // Update username in profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      toast.error(t("error_updating_profile"));
      return;
    }

    // Update other preferences
    const { error: preferencesError } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        preferred_categories: preferredCategories,
        bio,
        profile_picture_url: profilePictureUrl,
      });

    if (preferencesError) {
      console.error("Error updating preferences:", preferencesError);
      toast.error(t("error_updating_profile"));
    } else {
      toast.success(t("profile_updated"));
    }
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="sticky top-0 z-50 bg-base-100">
          <HeaderDashboard />
        </div>
        <div className="flex">
          <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>
          {user ? (
            <button className="btn btn-primary ml-5">
              <Link href={"/profile/" + user.id} target="_blank" passHref>
                {t("public_profile")}
              </Link>
            </button>
          ) : null}
        </div>
        {user ? (
          <div className="space-y-4">
            <div className="form-control w-full max-w-md">
              <label className="label">
                <span className="label-text font-semibold">
                  {t("username")}
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder={t("enter_username")}
                />
                <button className="btn btn-primary" onClick={updateProfile}>
                  {t("update")}
                </button>
              </div>
            </div>
            <LanguagePreferences userId={user.id} />
          </div>
        ) : null}
        {user ? <CategorySelection userId={user.id} /> : null}
        <ImportFromApps />
        {/* {user ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Share Your User ID</h2>
            <p>Your user ID: {user.id}</p>
          </div>
        ) : null} */}
        {/* <AddFriend user={user} onFriendAdded={fetchFriends} /> */}
        {/* <div>
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
        </div> */}
        {/* <div>
          <h2 className="text-2xl font-bold mb-4">My Friends</h2>

          {friends.length > 0 ? (
            <div className="grid-cols-4 col-span-4">
              {friends.map((friend, index) => (
                <Link
                  href={"/profile/" + friend.id}
                  target="_blank"
                  key={friend.id}
                >
                  <div
                    className="grid grid-cols-2 grid-rows-1 w-1/5"
                    key={`friend-${friend.id}-${index}`}
                  >
                    <img
                      height={40}
                      width={40}
                      src={friend.img}
                      className="rounded-full shrink-0"
                      referrerPolicy="no-referrer"
                    ></img>
                    <p className="m-auto">{friend.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>You haven&apos;t added any friends yet.</p>
          )}
        </div> */}
      </section>
    </main>
  );
}
