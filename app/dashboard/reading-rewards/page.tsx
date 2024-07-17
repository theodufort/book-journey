"use client";
import { useEffect, useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface UserPoints {
  points: number;
  points_earned: number;
  points_redeemed: number;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  cost: number;
}

export default function ReadingRewards() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    if (user) {
      fetchUserPoints();
      fetchRewards();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchUserPoints() {
    try {
      const { data, error } = await supabase
        .from("user_points")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setUserPoints(data);
    } catch (error) {
      console.error("Error fetching user points:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRewards() {
    // In a real application, you would fetch this from an API or database
    setRewards([
      { id: 1, name: "Free eBook", description: "Get a free eBook of your choice", cost: 500 },
      { id: 2, name: "Audiobook Credit", description: "Get one free audiobook credit", cost: 1000 },
      { id: 3, name: "Exclusive Author Q&A", description: "Access to an exclusive author Q&A session", cost: 1500 },
    ]);
  }

  async function redeemReward(reward: Reward) {
    if (!userPoints || userPoints.points < reward.cost) {
      alert("Not enough points to redeem this reward.");
      return;
    }

    try {
      const { error } = await supabase.from("user_points").update({
        points: userPoints.points - reward.cost,
        points_redeemed: userPoints.points_redeemed + reward.cost,
      }).eq("user_id", user.id);

      if (error) throw error;

      await supabase.from("point_transactions").insert({
        user_id: user.id,
        points: -reward.cost,
        type: "redeemed",
        description: `Redeemed ${reward.name}`,
      });

      alert(`Successfully redeemed ${reward.name}!`);
      fetchUserPoints();
    } catch (error) {
      console.error("Error redeeming reward:", error);
      alert("Failed to redeem reward. Please try again.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 pb-24 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <HeaderDashboard />

        <h1 className="text-3xl md:text-4xl font-extrabold">Reading Rewards</h1>

        {userPoints && (
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Available Points</div>
              <div className="stat-value">{userPoints.points}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Points Earned</div>
              <div className="stat-value">{userPoints.points_earned}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Points Redeemed</div>
              <div className="stat-value">{userPoints.points_redeemed}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div key={reward.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{reward.name}</h2>
                <p>{reward.description}</p>
                <div className="card-actions justify-end">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => redeemReward(reward)}
                    disabled={!userPoints || userPoints.points < reward.cost}
                  >
                    Redeem for {reward.cost} points
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
