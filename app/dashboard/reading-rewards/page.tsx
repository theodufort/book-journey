"use client";
import { useEffect, useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { UserPoints, Reward } from "@/interfaces/Dashboard";
import { Database } from "@/types/supabase";
import { DashboardFooter } from "@/components/DashboardFooter";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ReadingRewards() {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
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
      {
        id: 1,
        name: "Coupon: 10% off $25",
        type: "coupon",
        merchant: "BOOKSAMILLION",
        description:
          "Get a coupon to buy any book on a trusted book selling website!",
        cost: 100,
        link: "https://www.kqzyfj.com/click-101259626-13986197",
      },
      {
        id: 2,
        name: "Coupon: 15% off $35",
        type: "coupon",
        merchant: "BOOKSAMILLION",
        description:
          "Get a coupon to buy any book on a trusted book selling website!",
        cost: 200,
        link: "https://www.jdoqocy.com/click-101259626-13986208",
      },
      {
        id: 3,
        name: "Coupon: 20% off $100",
        type: "coupon",
        merchant: "BOOKSAMILLION",
        description:
          "Get a coupon to buy any book on a trusted book selling website!",
        cost: 300,
        link: "https://www.jdoqocy.com/click-101259626-13986212",
      },
      {
        id: 4,
        name: "Coupon: 10% off $25",
        type: "coupon",
        merchant: "2NDANDCHARLES",
        description:
          "Get a coupon to buy any book on a trusted book selling website!",
        cost: 100,
        link: "https://www.tkqlhce.com/click-101259626-15658770",
      },
      {
        id: 5,
        name: "Coupon: 15% off $35",
        type: "coupon",
        merchant: "2NDANDCHARLES",
        description:
          "Get a coupon to buy any book on a trusted book selling website!",
        cost: 200,
        link: "https://www.dpbolvw.net/click-101259626-15658774",
      },
      {
        id: 6,
        name: "Coupon: 20% off $100",
        type: "coupon",
        merchant: "2NDANDCHARLES",
        description:
          "Get a coupon to buy any book on a trusted book selling website!",
        cost: 300,
        link: "https://www.anrdoezrs.net/click-101259626-15658777",
      },
    ]);
  }

  async function redeemReward(reward: Reward) {
    if (
      !userPoints ||
      userPoints?.points_earned - userPoints?.points_redeemed < reward.cost
    ) {
      alert("Not enough points to redeem this reward.");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_points")
        .update({
          points_redeemed: userPoints.points_redeemed + reward.cost,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await supabase.from("point_transactions").insert({
        user_id: user.id,
        points: -reward.cost,
        type: "redeemed",
        description: `Redeemed ${reward.name}`,
      });

      alert(`Successfully redeemed ${reward.name}!`);
      router.push(reward.link);
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
        <div className="z-50">
          <HeaderDashboard />
        </div>
        <div className="flex">
          <h1 className="text-2xl md:text-4xl font-extrabold">
            Reading Rewards
          </h1>

          {userPoints && (
            <div
              className="bg-base-200 text-primary rounded-xl p-2 h-full flex items-center my-auto overflow-hidden ml-auto"
              style={{ boxShadow: "0 0px 10px 0px #6366f1" }}
            >
              <Link
                href="/dashboard/reading-rewards"
                className="whitespace-nowrap overflow-hidden text-ellipsis mr-1"
              >
                {userPoints?.points_earned - userPoints?.points_redeemed}
              </Link>
              <div className="flex-shrink-0">
                <Image src={"/coin.png"} height={25} width={25} alt="coin" />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div key={reward.id} className="card bg-base-300 shadow-xl -z-10">
              <div className="card-body">
                <div>
                  <h2 className="card-title inline-block">{reward.name}</h2>{" "}
                  <div className="float-right">
                    <p className="text-2xl">
                      {reward.type == "coupon" ? "🏷️" : null}
                    </p>
                  </div>
                </div>
                <p>{reward.merchant}</p>
                {/* <p>{reward.description}</p> */}
                <div className="card-actions justify-end mt-5">
                  <button
                    className="btn btn-primary"
                    onClick={() => redeemReward(reward)}
                    disabled={
                      !userPoints ||
                      userPoints.points_earned - userPoints.points_redeemed <
                        reward.cost
                    }
                  >
                    Redeem for {reward.cost} points
                  </button>
                </div>
              </div>
            </div>
          ))}
          {/* <div>Rewards coming soon! Stay tuned!</div> */}
        </div>
      </section>
    </main>
  );
}
