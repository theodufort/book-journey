import { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ActivityItem {
  id: number;
  action: string;
  timestamp: string;
}

interface RecentActivitySectionProps {
  userId: string;
}

const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({ userId }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching activities:', error);
      } else {
        setActivities(data || []);
      }
    };

    fetchActivities();
  }, [userId, supabase]);

  return (
    <div className="bg-base-200 p-6 rounded-box shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
      {activities.length > 0 ? (
        <ul className="space-y-2">
          {activities.map((activity) => (
            <li key={activity.id} className="flex justify-between items-center">
              <span>{activity.action}</span>
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
