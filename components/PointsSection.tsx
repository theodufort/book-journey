// components/PointsSection.tsx
import { useEffect, useState } from "react";
import { User, createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    db: { schema: "next_auth" },
  }
);
const PointsSection = (userId: string) => {
  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchPoints();
    fetchTransactions();
  }, []);

  async function fetchPoints() {
    if (userId) {
      const { data, error } = await supabase
        .from("user_points")
        .select("points_earned, points_redeemed")
        .eq("user_id", userId)
        .maybeSingle();
      console.log(data);
      console.log(error);
      if (error) {
        console.error("Error fetching points:", error);
      } else {
        setPoints(data.points_earned - data.points_redeemed);
      }
    }
  }

  async function fetchTransactions() {
    if (userId) {
      const { data, error } = await supabase
        .from("point_transactions")
        .select("points, type, description, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      console.log(userId);
      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        setTransactions(data);
      }
    }
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold">My Points</h2>
      <p>You have {points} points.</p>

      <h3 className="text-lg md:text-xl font-bold mt-8">Recent Activity</h3>
      <ul className="space-y-4">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="flex justify-between">
            <div>
              <p className="font-medium">
                {transaction.type === "earned" ? "Earned" : "Redeemed"}{" "}
                {transaction.points} points
              </p>
              <p className="text-sm text-gray-500">{transaction.description}</p>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(transaction.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PointsSection;
