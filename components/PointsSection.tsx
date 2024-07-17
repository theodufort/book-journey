// components/PointsSection.tsx

import { useState, useEffect } from "react";
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
        .from("user_points")
        .select("points")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching points:", error);
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
