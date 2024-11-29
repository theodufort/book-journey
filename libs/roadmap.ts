import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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

export async function updateStatus(id: string, newStatus: string) {
  const supabase = createClientComponentClient();
  const { error } = await supabase
    .from("roadmap")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) throw error;
}

export async function updateVotes(id: string, increment: boolean) {
  const supabase = createClientComponentClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Check if user has already voted
  const { data: existingVote } = await supabase
    .from("roadmap_votes")
    .select("increment")
    .eq("roadmap_id", id)
    .eq("user_id", user.id)
    .single();

  // If vote exists and is the same direction, remove the vote
  if (existingVote && existingVote.increment === increment) {
    const { error: deleteError } = await supabase
      .from("roadmap_votes")
      .delete()
      .eq("roadmap_id", id)
      .eq("user_id", user.id);

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
    const { error: upsertError } = await supabase.from("roadmap_votes").upsert({
      roadmap_id: id,
      user_id: user.id,
      increment: increment,
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
