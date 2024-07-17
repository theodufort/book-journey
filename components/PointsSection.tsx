// components/PointsSection.tsx
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const PointsSection = () => {
  const supabase = createClientComponentClient();
  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
    if (user) {
      fetchPoints();
      fetchTransactions();
    }
  }, [supabase]);

  async function fetchPoints() {
    const { data, error } = await supabase
      .from("user_points")
      .select("points_earned, points_redeemed")
      .eq("user_id", user.id)
      .maybeSingle();
    console.log(data);
    console.log(error);
    if (error) {
      console.error("Error fetching points:", error);
    } else if (!data) {
      setPoints(0);
    } else {
      setPoints(data.points_earned - data.points_redeemed);
    }
  }

  async function fetchTransactions() {
    const { data, error } = await supabase
      .from("point_transactions")
      .select("points, type, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      setTransactions(data);
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
import { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface PointsSectionProps {
  userId: string;
}

const PointsSection: React.FC<PointsSectionProps> = ({ userId }) => {
  const [points, setPoints] = useState<number | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchPoints = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching points:', error);
      } else {
        setPoints(data?.points || 0);
      }
    };

    fetchPoints();
  }, [userId, supabase]);

  return (
    <div className="bg-base-200 p-6 rounded-box shadow-lg">
      <h2 className="text-2xl font-bold mb-4">My Points</h2>
      {points !== null ? (
        <p className="text-4xl font-bold text-primary">{points}</p>
      ) : (
        <p>Loading points...</p>
      )}
    </div>
  );
};

export default PointsSection;
