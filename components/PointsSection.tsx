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
      {points === null ? (
        <div className="flex items-center space-x-2">
          <span className="loading loading-spinner loading-md"></span>
          <p>Loading points...</p>
        </div>
      ) : points === 0 ? (
        <div>
          <p className="text-4xl font-bold text-primary">0</p>
          <p className="mt-2 text-sm text-gray-500">Start earning points by completing activities!</p>
        </div>
      ) : (
        <p className="text-4xl font-bold text-primary">{points}</p>
      )}
    </div>
  );
};

export default PointsSection;
