import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
interface ActivityItem {
  id: number;
  activity_type: string;
  timestamp: string;
}

const RecentActivitySection = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
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
    const fetchActivities = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching activities:", error);
      } else {
        setActivities(data || []);
      }
    };

    fetchActivities();
  }, [user, supabase]);

  return (
    <div className="bg-base-200 p-6 rounded-box shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
      {activities.length > 0 ? (
        <ul className="space-y-2">
          {activities.map((activity) => (
            <li key={activity.id} className="flex justify-between items-center">
              <span>{activity.activity_type}</span>
              <span className="text-sm text-gray-500">
                {new Date(activity.timestamp).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent activity</p>
      )}
    </div>
  );
};

export default RecentActivitySection;
