"use client";

import AdminHeader from "@/components/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Admin() {
  const [activityData, setActivityData] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<
    { userId: string; connections: number }[]
  >([]);
  const [topCategoriesByPurchases, setTopCategoriesByPurchases] = useState<
    { categories: string[]; purchase_count: number }[]
  >([]);
  const [retentionData, setRetentionData] = useState<any[]>([]);
  const [timeUnit, setTimeUnit] = useState<"days" | "weeks">("days");
  const supabase = createClientComponentClient();
  useEffect(() => {
    fetchUserStats();
  }, []);

  useEffect(() => {
    if (userStats) {
      fetchActivityData();
      calculateRetention();
    }
  }, [userStats, timeUnit]);

  async function fetchActivityData() {
    // Fetch all users with their creation dates
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, created_at")
      .order("created_at", { ascending: true });

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }

    // Fetch activity data for active users
    const { data: connections, error: activityError } = await supabase
      .from("user_connection_activity")
      .select(
        `
        active_at,
        user_id
      `
      )
      .order("active_at", { ascending: true });

    if (activityError) {
      console.error("Error fetching activity data:", activityError);
      return;
    }

    // Create a map of dates to track cumulative signups
    const signupsByDate = users.reduce((acc: any, user: any) => {
      const date = new Date(user.created_at).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {});

    // Create a map of user signup dates
    const userSignupDates = users.reduce((acc: any, user: any) => {
      const userId = user.id;
      const signupDate = new Date(user.created_at).toISOString().split("T")[0];
      acc[userId] = signupDate;
      return acc;
    }, {});

    // Create a map for daily activity, only counting activity at least 2 days after signup
    const dailyActivity = connections.reduce((acc: any, connection: any) => {
      const date = new Date(connection.active_at).toISOString().split("T")[0];
      const userSignupDate = new Date(userSignupDates[connection.user_id]);
      const activityDate = new Date(date);
      const daysDifference = Math.floor(
        (activityDate.getTime() - userSignupDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Only count activity if it's at least 2 days after the signup date
      if (daysDifference >= 2) {
        if (!acc[date]) {
          acc[date] = new Set();
        }
        acc[date].add(connection.user_id);
      }
      return acc;
    }, {});

    // Get all unique dates from both signups and activity
    const allDates = [
      ...new Set([
        ...Object.keys(signupsByDate),
        ...Object.keys(dailyActivity),
      ]),
    ].sort();

    // Calculate cumulative metrics for each date
    let cumulativeUsers = 0;
    const chartData = allDates.map((date) => {
      // Add new signups to cumulative total
      cumulativeUsers += signupsByDate[date] || 0;

      // Calculate daily and weekly active users
      const dailyActiveUsers = dailyActivity[date]?.size || 0;

      const weeklyActiveUsers = new Set();
      const currentDate = new Date(date);
      const weekAgo = new Date(currentDate);
      weekAgo.setDate(weekAgo.getDate() - 7);

      Object.entries(dailyActivity).forEach(
        ([activityDate, activityUsers]: [string, any]) => {
          if (
            new Date(activityDate) >= weekAgo &&
            new Date(activityDate) <= currentDate
          ) {
            activityUsers.forEach((userId: string) =>
              weeklyActiveUsers.add(userId)
            );
          }
        }
      );

      return {
        date,
        totalUsers: cumulativeUsers,
        dailyActiveUsers,
        weeklyActiveUsers: weeklyActiveUsers.size,
      };
    });

    // Calculate most active users in the last week
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));

    const userConnections = connections
      .filter((conn) => new Date(conn.active_at) >= weekAgo)
      .reduce(
        (acc: { [key: string]: { userId: string; count: number } }, conn) => {
          if (!acc[conn.user_id]) {
            acc[conn.user_id] = { userId: conn.user_id, count: 0 };
          }
          acc[conn.user_id].count++;
          return acc;
        },
        {}
      );

    const sortedActiveUsers = Object.values(userConnections)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ userId, count }) => ({
        userId,
        connections: count,
      }));

    // Calculate monthly growth rate
    const dataWithGrowthRate = chartData.map((day, index) => {
      let monthlyGrowthRate = 0;
      if (index >= 30) {
        // Only calculate if we have at least 30 days of data
        const currentUsers = day.totalUsers;
        const lastMonthUsers = chartData[index - 30].totalUsers;
        if (lastMonthUsers > 0) {
          monthlyGrowthRate =
            ((currentUsers - lastMonthUsers) / lastMonthUsers) * 100;
        }
      }

      return {
        ...day,
        monthlyGrowthRate: Number(monthlyGrowthRate.toFixed(2)),
      };
    });

    setActiveUsers(sortedActiveUsers);
    // Merge users with books data into activity data
    const finalData = userGrowthData.map((day) => {
      const dateStr = day.date;
      // Find the closest previous date that has data
      const availableDates = Object.keys(userStats?.usersByDate || {}).sort();
      const closestDate = userStats?.usersByDate ? availableDates.reduce((prev, curr) => {
        if (curr <= dateStr && (!prev || curr > prev)) {
          return curr;
        }
        return prev;
      }, null) : null;

      const usersWithBooks = (closestDate && userStats?.usersByDate)
        ? userStats.usersByDate[closestDate]
        : 0;

      return {
        ...day,
        usersWithBooks: usersWithBooks,
      };
    });

    console.log("Final data sample:", finalData.slice(0, 5)); // Debug log
    setActivityData(finalData);
  }

  async function calculateRetention() {
    // Fetch all users with their first activity
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, created_at");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }

    // Fetch all activity data
    const { data: activities, error: activitiesError } = await supabase
      .from("user_connection_activity")
      .select("user_id, active_at")
      .order("active_at", { ascending: true });

    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
      return;
    }

    // Group activities by user
    const userActivities = activities.reduce((acc: any, activity) => {
      if (!acc[activity.user_id]) {
        acc[activity.user_id] = [];
      }
      acc[activity.user_id].push(new Date(activity.active_at));
      return acc;
    }, {});

    // Calculate retention for each period
    const retentionPeriods = timeUnit === "weeks" ? 12 : 30; // 12 weeks or 30 days
    const retentionData = [];
    const msPerPeriod =
      timeUnit === "weeks" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    for (let period = 0; period <= retentionPeriods; period++) {
      let activeUsers = 0;
      users.forEach((user) => {
        const userFirstActivity = new Date(user.created_at);
        const activities = userActivities[user.id] || [];

        // Check if user was active after the period
        const hasActivityAfterPeriod = activities.some((activity: any) => {
          const timeDiff = activity.getTime() - userFirstActivity.getTime();
          const periodDiff = Math.floor(timeDiff / msPerPeriod);
          return periodDiff >= period;
        });

        if (hasActivityAfterPeriod) {
          activeUsers++;
        }
      });

      const retentionRate = (activeUsers / users.length) * 100;
      retentionData.push({
        period,
        retention: Math.round(retentionRate * 100) / 100,
      });
    }

    setRetentionData(retentionData);
  }

  async function fetchUserStats() {
    const { count: totalUsers, error: error1 } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    // Get users with books by date
    const { data, error: error2 } = await supabase.rpc(
      "get_cumulative_books_per_users_by_day"
    );
    console.log(data);
    if (error1 || error2) {
      console.error("Error fetching user stats:", error1 || error2);
      return;
    }

    // Convert the array of daily data into a date-indexed object
    const usersByDate: { [key: string]: number } = {};
    data.forEach((entry: any) => {
      usersByDate[entry.date] = entry.cumulative_users;
    });

    console.log(
      "Current total users with books:",
      data[data.length - 1]?.cumulative_users || 0
    );
    console.log("Users by date:", usersByDate);

    setUserStats({
      totalUsers: totalUsers || 0,
      usersByDate: usersByDate,
    });
  }

  return (
    <div>
      <AdminHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Activity Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalUsers"
                    name="Total Users"
                    stroke="#8884d8"
                  />
                  <Line
                    type="monotone"
                    dataKey="dailyActiveUsers"
                    name="Daily Active Users"
                    stroke="#82ca9d"
                  />
                  <Line
                    type="monotone"
                    dataKey="weeklyActiveUsers"
                    name="Weekly Active Users"
                    stroke="#ffc658"
                  />
                  <Line
                    type="monotone"
                    dataKey="monthlyGrowthRate"
                    name="Monthly Growth Rate %"
                    stroke="#ff0000"
                    yAxisId="right"
                  />
                  <Line
                    type="monotone"
                    dataKey="usersWithBooks"
                    name="Total Users with Books"
                    stroke="#ff7f50"
                    strokeWidth={2}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{
                      value: "Monthly Growth Rate %",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Most Active Users (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      User ID
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Connections
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.map((user, index) => (
                    <tr key={index} className="bg-white border-b">
                      <td className="px-6 py-4">{user.userId}</td>
                      <td className="px-6 py-4">{user.connections}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>User Retention Curve</span>
              <select
                value={timeUnit}
                onChange={(e) =>
                  setTimeUnit(e.target.value as "days" | "weeks")
                }
                className="select select-bordered w-full max-w-xs"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    label={{
                      value:
                        timeUnit === "weeks"
                          ? "Weeks Since First Visit"
                          : "Days Since First Visit",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Retention Rate (%)",
                      angle: -90,
                      position: "insideLeft",
                      offset: 15,
                    }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="retention"
                    name="Retention Rate"
                    stroke="#ff4d4d"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
