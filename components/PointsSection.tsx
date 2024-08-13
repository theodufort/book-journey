// components/PointsSection.tsx
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

const PointsSection = () => {
  const [points, setPoints] = useState<number | null>(null);
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    const fetchPoints = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_points")
        .select("points_earned,points_redeemed")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching points:", error);
      } else {
        setPoints(data?.points_earned - data?.points_redeemed || 0);
      }
    };

    fetchPoints();
  }, [user, supabase]);

  return (
    <div className="bg-base-200 p-6 rounded-box shadow-lg">
      <h2 className="text-2xl font-bold mb-4">My Points</h2>
      {points === null ? (
        <div className="flex items-center space-x-2">
          <span className="loading loading-spinner loading-md"></span>
          <p>Loading points...</p>
        </div>
      ) : points === 0 ? (
        <div>
          <p className="text-4xl font-bold text-primary">0</p>
          <p className="mt-2 text-sm text-gray-500">
            Start earning points by completing activities!
          </p>
        </div>
      ) : (
        <p className="text-4xl font-bold text-primary">{points}</p>
      )}
    </div>
  );
};

export default PointsSection;
