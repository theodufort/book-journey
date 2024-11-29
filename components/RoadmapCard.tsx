import { RoadmapItem, updateVotes } from "@/app/roadmap/page";
import { useState } from "react";

export default function RoadmapCard({
  id,
  title,
  description,
  tags,
  votes,
}: RoadmapItem) {
  const [voteCount, setVoteCount] = useState(votes);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (increment: boolean) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await updateVotes(id, increment);
      setVoteCount((prev) => (increment ? prev + 1 : prev - 1));
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
              className="btn btn-sm btn-ghost"
              onClick={() => handleVote(true)}
              disabled={isVoting}
            >
              👍
            </button>
            <span className="flex items-center">{voteCount}</span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => handleVote(false)}
              disabled={isVoting}
            >
              👎
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
