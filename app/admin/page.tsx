"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Admin() {
  const [userGrowthData, setUserGrowthData] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchUserGrowthData();
    fetchUserStats();
  }, []);

  async function fetchUserGrowthData() {
    const { data, error } = await supabase
      .from("profiles")
      .select("created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching user growth data:", error);
      return;
    }

    const userCounts = data.reduce((acc: any, user: any) => {
      const date = new Date(user.created_at).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(userCounts);
    const dataPoints = Object.values(userCounts);

    setUserGrowthData({
      labels,
      datasets: [
        {
          label: "User Growth",
          data: dataPoints,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    });
  }

  async function fetchUserStats() {
    const { data: usersWithBooks, error: error1 } = await supabase
      .from("reading_list")
      .select("user_id", { count: "exact", head: true })
      .not("book_id", "is", null);

    const { count: totalUsers, error: error2 } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    if (error1 || error2) {
      console.error("Error fetching user stats:", error1 || error2);
      return;
    }

    const usersWithoutBooks = totalUsers! - usersWithBooks!.length;

    setUserStats({
      totalUsers,
      usersWithBooks: usersWithBooks!.length,
      usersWithoutBooks,
    });
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {userGrowthData && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">User Growth</h2>
          <Line data={userGrowthData} />
        </div>
      )}

      {userStats && (
        <div>
          <h2 className="text-xl font-semibold mb-2">User Statistics</h2>
          <ul>
            <li>Total Users: {userStats.totalUsers}</li>
            <li>Users with Books: {userStats.usersWithBooks}</li>
            <li>Users without Books: {userStats.usersWithoutBooks}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
