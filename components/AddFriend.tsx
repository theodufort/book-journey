import { FormEvent, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

interface AddFriendProps {
  user: User | null;
  onFriendAdded: () => void;
}

export default function AddFriend({ user, onFriendAdded }: AddFriendProps) {
  const [friendId, setFriendId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  const handleAddFriend = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase
        .from("friends")
        .insert([{ user_id: user.id, friend_id: friendId, status: "pending" }]);

      if (error) throw error;

      setSuccess("Friend request sent successfully!");
      setFriendId("");
      onFriendAdded();
    } catch (error) {
      setError("Failed to add friend. Please enter a valid id.");
      console.error("Error adding friend:", error);
    }
  };

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Add a Friend</h2>
      <form onSubmit={handleAddFriend} className="space-y-4">
        <input
          type="text"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
          placeholder="Enter friend's User ID"
          className="input input-bordered w-full max-w-xs"
          required
        />
        <button type="submit" className="btn btn-primary ml-5">
          Add Friend
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </div>
  );
}
