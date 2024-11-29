"use client";
import Header from "@/components/Header";
import RoadmapCard from "@/components/RoadmapCard";
import { useEffect, useState } from "react";
import IdeaSubmissionForm from "@/components/IdeaSubmissionForm";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { useRouter } from "next/navigation";

export interface RoadmapItem {
  id: string;
  created_at: string;
  title: string;
  description: string;
  is_approved: boolean;
  tags: string[];
  votes: number;
  status: "ideas" | "planned" | "inProgress" | "completed";
}

export async function fetchRoadmapItems() {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from("roadmap")
    .select("*")
    .order("votes", { ascending: false });

  if (error) {
    console.error("Error fetching roadmap items:", error);
    return [];
  }

  return data as RoadmapItem[];
}

export async function submitIdea(idea: {
  title: string;
  description: string;
  tags: string[];
}) {
  const supabase = createClientComponentClient();
  const { error } = await supabase.from("roadmap").insert([
    {
      title: idea.title,
      description: idea.description,
      tags: idea.tags,
      status: "ideas",
    },
  ]);

  if (error) {
    console.error("Error submitting idea:", error);
    throw error;
  }
}

export async function updateVotes(id: string, increment: boolean) {
  const supabase = createClientComponentClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Check if user has already voted
  const { data: existingVote } = await supabase
    .from('roadmap_votes')
    .select('increment')
    .eq('roadmap_id', id)
    .eq('user_id', user.id)
    .single();

  // If vote exists and is the same direction, remove the vote
  if (existingVote && existingVote.increment === increment) {
    const { error: deleteError } = await supabase
      .from('roadmap_votes')
      .delete()
      .eq('roadmap_id', id)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    // Update the vote count in the opposite direction
    const { error: voteError } = await supabase.rpc("increment_votes", {
      row_id: id,
      increment: !increment,
    });

    if (voteError) throw voteError;
    return false; // Indicates vote was removed

  } else {
    // If vote exists but in opposite direction or doesn't exist, upsert the vote
    const { error: upsertError } = await supabase
      .from('roadmap_votes')
      .upsert({
        roadmap_id: id,
        user_id: user.id,
        increment: increment
      });

    if (upsertError) throw upsertError;

    // Update the vote count
    const { error: voteError } = await supabase.rpc("increment_votes", {
      row_id: id,
      increment: increment,
    });

    if (voteError) throw voteError;
    return true; // Indicates vote was added/changed
  }
}

export default function Roadmap() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"roadmap" | "ideas">("roadmap");
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const loadItems = async () => {
    const data = await fetchRoadmapItems();
    setItems(data);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        await loadItems();
      } else {
        console.log("User not authenticated");
      }
    };
    getUser();
  }, [supabase]);
  const allTags = Array.from(new Set(items.flatMap((item) => item.tags)));

  const itemsByStatus = {
    ideas: items.filter((item) => item.status === "ideas"),
    planned: items.filter((item) => item.status === "planned"),
    inProgress: items.filter((item) => item.status === "inProgress"),
    completed: items.filter((item) => item.status === "completed"),
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filterTasks = (tasks: RoadmapItem[]) => {
    if (selectedTags.length === 0) return tasks;
    return tasks.filter((task) =>
      task.tags.some((tag) => selectedTags.includes(tag))
    );
  };
  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 pb-24">
        <section className="max-w-7xl mx-auto">
          <div className="justify-between items-center mb-8 space-y-4">
            <div className="justify-between flex m-auto">
              <h1 className="text-3xl font-bold">Product Roadmap</h1>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-outline">
                  Filter by tags ({selectedTags.length})
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </label>
                <div
                  tabIndex={0}
                  className="dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                >
                  {allTags.map((tag, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-2 p-2 hover:bg-base-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                      />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div role="tablist" className="tabs tabs-boxed">
              <a
                role="tab"
                className={`tab ${
                  activeTab == "roadmap" ? "tab-active" : null
                }`}
                onClick={() => setActiveTab("roadmap")}
              >
                Roadmap
              </a>
              <a
                role="tab"
                className={`tab ${activeTab == "ideas" ? "tab-active" : null}`}
                onClick={() => setActiveTab("ideas")}
              >
                Ideas
              </a>
            </div>

            <div className={`${activeTab == "roadmap" ? "block" : "hidden"}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Planned Column */}
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Planned</h2>
                    <div className="space-y-4">
                      {filterTasks(itemsByStatus.planned).map((task, index) => (
                        <RoadmapCard key={task.id} {...task} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-xl mb-4">In Progress</h2>
                    <div className="space-y-4">
                      {filterTasks(itemsByStatus.inProgress).map(
                        (task, index) => (
                          <RoadmapCard key={task.id} {...task} />
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Completed Column */}
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Completed</h2>
                    <div className="space-y-4">
                      {filterTasks(itemsByStatus.completed).map(
                        (task, index) => (
                          <RoadmapCard key={task.id} {...task} />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${activeTab == "ideas" ? "block" : "hidden"}`}>
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">Community Ideas</h2>
                  <IdeaSubmissionForm
                    onSubmit={async (idea) => {
                      try {
                        await submitIdea(idea);
                        const updatedItems = await fetchRoadmapItems();
                        setItems(updatedItems);
                      } catch (error) {
                        console.error("Failed to submit idea:", error);
                      }
                    }}
                  />
                  <div className="divider">Submitted Ideas</div>
                  <div className="space-y-4">
                    {filterTasks(itemsByStatus.ideas).map((task, index) => (
                      <RoadmapCard key={task.id} {...task} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
