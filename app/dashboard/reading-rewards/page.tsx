"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Reward, UserPoints } from "@/interfaces/Dashboard";
import { Database } from "@/types/supabase";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getUser } from "@/libs/supabase/queries";

export default function ReadingRewards() {
  const t = useTranslations("ReadingRewards");
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filterMerchant, setFilterMerchant] = useState<string>("");
  const [filterCost, setFilterCost] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const router = useRouter();
  useEffect(() => {
    const getUserCall = async () => {
      const user = await getUser(supabase);
      if (user) {
        setUser(user);
      } else {
        console.log("User not authenticated");
      }
    };
    getUserCall();
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
        .select("points_earned,points_redeemed,points_earned_referrals")
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
        name: t("reward_name_coupon") + ": 10% off $25",
        type: "coupon",
        merchant: "BOOKSAMILLION",
        description: t("base_reward_description"),
        cost: 100,
        link: "https://www.kqzyfj.com/click-101259626-13986197",
        category: t("books_category"),
      },
      {
        name: t("reward_name_coupon") + ": 15% off $35",
        type: "coupon",
        merchant: "BOOKSAMILLION",
        description: t("base_reward_description"),
        cost: 200,
        link: "https://www.jdoqocy.com/click-101259626-13986208",
        category: t("books_category"),
      },
      {
        name: t("reward_name_coupon") + ": 20% off $100",
        type: "coupon",
        merchant: "BOOKSAMILLION",
        description: t("base_reward_description"),
        cost: 300,
        link: "https://www.jdoqocy.com/click-101259626-13986212",
        category: t("books_category"),
      },
      {
        name: t("reward_name_coupon") + ": 10% off $25",
        type: "coupon",
        merchant: "2NDANDCHARLES",
        description: t("base_reward_description"),
        cost: 100,
        link: "https://www.tkqlhce.com/click-101259626-15658770",
        category: t("books_category"),
      },
      {
        name: t("reward_name_coupon") + ": 15% off $35",
        type: "coupon",
        merchant: "2NDANDCHARLES",
        description: t("base_reward_description"),
        cost: 200,
        link: "https://www.dpbolvw.net/click-101259626-15658774",
        category: t("books_category"),
      },
      {
        name: t("reward_name_coupon") + ": 20% off $100",
        type: "coupon",
        merchant: "2NDANDCHARLES",
        description: t("base_reward_description"),
        cost: 300,
        link: "https://www.anrdoezrs.net/click-101259626-15658777",
        category: t("books_category"),
      },
      {
        name: t("50%deal1_name"),
        type: "coupon",
        merchant: "BARNESANDNOBLES",
        description: t("50%deal1_desc"),
        cost: 500,
        link: "https://www.anrdoezrs.net/click-101259626-15777883",
        category: t("books_category"),
      },
      {
        name: t("50%deal2_name"),
        type: "coupon",
        merchant: "BARNESANDNOBLES",
        description: t("50%deal2_desc"),
        cost: 500,
        link: "https://www.kqzyfj.com/click-101259626-15777885",
        category: t("books_category"),
      },
      {
        name: t("50%deal3_name"),
        type: "coupon",
        merchant: "BARNESANDNOBLES",
        description: t("50%deal3_desc"),
        cost: 500,
        link: "https://www.kqzyfj.com/click-101259626-15777886",
        category: t("books_category"),
      },
      {
        name: t("50%deal4_name"),
        type: "coupon",
        merchant: "BARNESANDNOBLES",
        description: t("50%deal4_desc"),
        cost: 500,
        link: "https://www.tkqlhce.com/click-101259626-15777884",
        category: t("books_category"),
      },
      {
        name: t("50%deal5_name"),
        type: "coupon",
        merchant: "BARNESANDNOBLES",
        description: t("50%deal5_desc"),
        cost: 500,
        link: "https://www.tkqlhce.com/click-101259626-15777888",
        category: t("audiobooks_category"),
      },
      {
        name: t("3audiobook1_name"),
        type: "coupon",
        merchant: "AUDIOBOOKS.COM",
        description: t("3audiobook1_desc"),
        cost: 300,
        link: "https://www.kqzyfj.com/click-101259626-11785732",
        category: t("audiobooks_category"),
      },
    ]);
  }

  const filteredRewards = useMemo(() => {
    return rewards.filter((reward) => {
      return (
        (!filterMerchant || reward.merchant === filterMerchant) &&
        (!filterCost ||
          (filterCost === "0-100" && reward.cost <= 100) ||
          (filterCost === "101-200" &&
            reward.cost > 100 &&
            reward.cost <= 200) ||
          (filterCost === "201-300" &&
            reward.cost > 200 &&
            reward.cost <= 300) ||
          (filterCost === "301+" && reward.cost > 300)) &&
        (!filterCategory || reward.category === filterCategory)
      );
    });
  }, [rewards, filterMerchant, filterCost, filterCategory]);

  async function redeemReward(reward: Reward) {
    if (
      !userPoints ||
      userPoints?.points_earned +
        userPoints?.points_earned_referrals -
        userPoints?.points_redeemed <
        reward.cost
    ) {
      toast.error(t("not_enough_points_warning"));
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

      router.push(reward.link);
      fetchUserPoints();
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast.error(t("failed_redeem_warning"));
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
        <div className="sticky top-0 z-50 bg-base-100">
          <HeaderDashboard />
        </div>
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold">{t("title")}</h1>
          {userPoints && (
            <div
              className="bg-base-200 text-primary rounded-xl p-2 flex items-center overflow-hidden"
              style={{ boxShadow: "0 0px 10px 0px #cc785c" }}
            >
              <Link
                href="/dashboard/reading-rewards"
                className="whitespace-nowrap overflow-hidden text-ellipsis mr-1 flex items-center"
              >
                <span className="mr-1">
                  {userPoints?.points_earned +
                    userPoints?.points_earned_referrals -
                    userPoints?.points_redeemed}
                </span>
                <Image src={"/coin.png"} height={20} width={20} alt="coin" />
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <select
            className="select select-bordered w-full max-w-xs"
            onChange={(e) => setFilterMerchant(e.target.value)}
            value={filterMerchant}
          >
            <option value="">{t("merchants")}</option>
            {Array.from(new Set(rewards.map((r) => r.merchant))).map(
              (merchant) => (
                <option key={merchant} value={merchant}>
                  {merchant}
                </option>
              )
            )}
          </select>
          <select
            className="select select-bordered w-full max-w-xs"
            onChange={(e) => setFilterCost(e.target.value)}
            value={filterCost}
          >
            <option value="">{t("costs")}</option>
            <option value="0-100">0 - 100 {t("points")}</option>
            <option value="101-200">101 - 200 {t("points")}</option>
            <option value="201-300">201 - 300 {t("points")}</option>
            <option value="301+">301+ {t("points")}</option>
          </select>
          <select
            className="select select-bordered w-full max-w-xs"
            onChange={(e) => setFilterCategory(e.target.value)}
            value={filterCategory}
          >
            <option value="">{t("categories")}</option>
            {Array.from(new Set(rewards.map((r) => r.category))).map(
              (category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              )
            )}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRewards.map((reward) => (
            <div key={uuidv4()} className="card bg-base-300 shadow-xl">
              <div className="card-body p-4">
                <h2 className="card-title text-sm">{reward.name}</h2>
                <p className="text-xs">{reward.merchant}</p>
                <div className="card-actions justify-between items-center mt-2">
                  <span className="text-xs font-bold flex items-center">
                    {reward.cost}
                    <Image
                      src={"/coin.png"}
                      height={16}
                      width={16}
                      alt="coin"
                      className="ml-1"
                    />
                  </span>
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={() => redeemReward(reward)}
                    disabled={
                      !userPoints ||
                      userPoints.points_earned +
                        userPoints?.points_earned_referrals -
                        userPoints.points_redeemed <
                        reward.cost
                    }
                  >
                    {t("redeem")}
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
