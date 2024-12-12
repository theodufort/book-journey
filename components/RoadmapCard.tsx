import { RoadmapItem, updateStatus, updateVotes } from "@/libs/roadmap";
import { getUser } from "@/libs/supabase/queries";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

export default function RoadmapCard({
  id,
  title,
  description,
  tags,
  votes,
  status,
}: RoadmapItem) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [voteCount, setVoteCount] = useState(votes);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUserCall = async () => {
      const user = await getUser(supabase);
      if (user) {
        setUser(user);
        checkUserVote();
        checkAdminStatus();
      } else {
        console.log("User not authenticated");
      }
    };
    getUserCall();
  }, [supabase]);

  const checkUserVote = async () => {
    if (user) {
      const { data: voteData } = await supabase
        .from("roadmap_votes")
        .select("increment")
        .eq("roadmap_id", id)
        .eq("user_id", user.id)
        .single();

      setUserVote(voteData?.increment ?? null);
    }
  };

  const checkAdminStatus = async () => {
    if (user?.email === "theodufort05@gmail.com") {
      setIsAdmin(true);
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    try {
      await updateStatus(id, e.target.value);
      // You might want to add some visual feedback here
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleVote = async (increment: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // You could add a toast notification here
      console.log("Please login to vote");
      return;
    }
    if (isVoting) return;
    setIsVoting(true);
    try {
      const voteAdded = await updateVotes(id, increment);
      if (voteAdded) {
        setVoteCount((prev) => (increment ? prev + 1 : prev - 1));
        setUserVote(increment);
      } else {
        // Vote was removed
        setVoteCount((prev) => (increment ? prev - 1 : prev + 1));
        setUserVote(null);
      }
    } catch (error) {
      console.error("Failed to update votes:", error);
    } finally {
      setIsVoting(false);
    }
  };
  return (
    <div className="card bg-base-100 shadow-xl mb-4">
      <div className="card-body p-4">
        <h3 className="card-title text-lg">{title}</h3>
        <p className="text-sm">{description}</p>
        <div className="flex flex-wrap gap-2 my-2">
          {tags.map((tag, index) => (
            <span key={index} className="badge badge-primary badge-sm">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${
                userVote === true ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => handleVote(true)}
              disabled={isVoting}
            >
              👍
            </button>
            <span className="flex items-center">{voteCount}</span>
            <button
              className={`btn btn-sm ${
                userVote === false ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => handleVote(false)}
              disabled={isVoting}
            >
              👎
            </button>
          </div>
          {isAdmin && (
            <select
              className="select select-bordered select-sm"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="ideas">Ideas</option>
              <option value="planned">Planned</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
