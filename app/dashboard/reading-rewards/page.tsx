"use client";
import { useEffect, useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import HeaderDashboard from "@/components/DashboardHeader";
import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { UserPoints, Reward } from "@/interfaces/Dashboard";
import { Database } from "@/types/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ReadingRewards() {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filterMerchant, setFilterMerchant] = useState<string>('');
  const [filterCost, setFilterCost] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
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
        name: "Coupon: 10% off $25",
        type: "coupon",
        merchant: "BOOKSAMILLION",
        description:
          "Get a coupon to buy any book on a trusted book selling website!",
        cost: 100,
        link: "https://www.kqzyfj.com/click-101259626-13986197",
        category: "discount",
      },
      {
        name: "Coupon: 15% off $35",
        type: "coupon",
        merchant: "BOOKSAMILLION",
        description:
          "Get a coupon to buy any book on a trusted book selling website!",
        cost: 200,
        link: "https://www.jdoqocy.com/click-101259626-13986208",
        category: "discount",
      },
      {
        name: "Coupon: 20% off $100",
        type: "coupon",
        merchant: "BOOKSAMILLION",
        description:
          "Get a coupon to buy any book on a trusted book selling website!",
        cost: 300,
        link: "https://www.jdoqocy.com/click-101259626-13986212",
        category: "discount",
      },
      {
        name: "Coupon: 10% off $25",
        type: "coupon",
        merchant: "2NDANDCHARLES",
        description:
          "Get a coupon to buy any book on a trusted book selling website!",
        cost: 100,
        link: "https://www.tkqlhce.com/click-101259626-15658770",
        category: "discount",
      },
      {
        name: "Coupon: 15% off $35",
        type: "coupon",
        merchant: "2NDANDCHARLES",
        description:
          "Get a coupon to buy any book on a trusted book selling website!",
        cost: 200,
        link: "https://www.dpbolvw.net/click-101259626-15658774",
        category: "discount",
      },
      {
        name: "Coupon: 20% off $100",
        type: "coupon",
        merchant: "2NDANDCHARLES",
        description:
          "Get a coupon to buy any book on a trusted book selling website!",
        cost: 300,
        link: "https://www.anrdoezrs.net/click-101259626-15658777",
        category: "discount",
      },
      {
        name: "Get 3 audio books for FREE",
        type: "coupon",
        merchant: "AUDIOBOOKS.COM",
        description:
          "Get 3 free audio books on a trusted audio book subscription website!",
        cost: 300,
        link: "https://www.kqzyfj.com/click-101259626-11785732",
        category: "free",
      },
    ]);
  }

  const filteredRewards = useMemo(() => {
    return rewards.filter((reward) => {
      return (
        (!filterMerchant || reward.merchant === filterMerchant) &&
        (!filterCost || (
          (filterCost === '0-100' && reward.cost <= 100) ||
          (filterCost === '101-200' && reward.cost > 100 && reward.cost <= 200) ||
          (filterCost === '201-300' && reward.cost > 200 && reward.cost <= 300) ||
          (filterCost === '301+' && reward.cost > 300)
        )) &&
        (!filterCategory || reward.category === filterCategory)
      );
    });
  }, [rewards, filterMerchant, filterCost, filterCategory]);

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
    <main className="min-h-screen p-4 pb-24">
      <section className="max-w-6xl mx-auto space-y-4">
        <div className="z-50">
          <HeaderDashboard />
        </div>
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold">
            Reading Rewards
          </h1>
          {userPoints && (
            <div
              className="bg-base-200 text-primary rounded-xl p-2 flex items-center overflow-hidden"
              style={{ boxShadow: "0 0px 10px 0px #6366f1" }}
            >
              <Link
                href="/dashboard/reading-rewards"
                className="whitespace-nowrap overflow-hidden text-ellipsis mr-1"
              >
                {userPoints?.points_earned - userPoints?.points_redeemed}
              </Link>
              <div className="flex-shrink-0">
                <Image src={"/coin.png"} height={20} width={20} alt="coin" />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <select
            className="select select-bordered w-full max-w-xs"
            onChange={(e) => setFilterMerchant(e.target.value)}
            value={filterMerchant}
          >
            <option value="">All Merchants</option>
            {Array.from(new Set(rewards.map((r) => r.merchant))).map((merchant) => (
              <option key={merchant} value={merchant}>
                {merchant}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered w-full max-w-xs"
            onChange={(e) => setFilterCost(e.target.value)}
            value={filterCost}
          >
            <option value="">All Costs</option>
            <option value="0-100">0 - 100 points</option>
            <option value="101-200">101 - 200 points</option>
            <option value="201-300">201 - 300 points</option>
            <option value="301+">301+ points</option>
          </select>
          <select
            className="select select-bordered w-full max-w-xs"
            onChange={(e) => setFilterCategory(e.target.value)}
            value={filterCategory}
          >
            <option value="">All Categories</option>
            {Array.from(new Set(rewards.map((r) => r.category))).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRewards.map((reward) => (
            <div key={uuidv4()} className="card bg-base-300 shadow-xl">
              <div className="card-body p-4">
                <h2 className="card-title text-sm">{reward.name}</h2>
                <p className="text-xs">{reward.merchant}</p>
                <div className="card-actions justify-between items-center mt-2">
                  <span className="text-xs font-bold">{reward.cost} points</span>
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={() => redeemReward(reward)}
                    disabled={
                      !userPoints ||
                      userPoints.points_earned - userPoints.points_redeemed <
                        reward.cost
                    }
                  >
                    Redeem
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
