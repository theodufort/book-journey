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
    { email: string; connections: number }[]
  >([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchActivityData();
    fetchUserStats();
  }, []);

  async function fetchActivityData() {
    // Fetch all users with their creation dates
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("created_at")
      .order("created_at", { ascending: true });

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }

    // Fetch activity data for active users
    const { data: connections, error: activityError } = await supabase
      .from("user_connection_activity")
      .select("active_at, user_id, profiles(email)")
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

    // Create a map for daily activity
    const dailyActivity = connections.reduce((acc: any, connection: any) => {
      const date = new Date(connection.active_at).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = new Set();
      }
      acc[date].add(connection.user_id);
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
        (acc: { [key: string]: { email: string; count: number } }, conn) => {
          const email = conn.profiles[0]?.email || "Unknown";
          if (!acc[conn.user_id]) {
            acc[conn.user_id] = { email, count: 0 };
          }
          acc[conn.user_id].count++;
          return acc;
        },
        {}
      );

    const sortedActiveUsers = Object.values(userConnections)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ email, count }) => ({
        email,
        connections: count,
      }));

    setActiveUsers(sortedActiveUsers);
    setActivityData(chartData);
  }

  async function fetchUserStats() {
    const { count: usersWithBooks, error: error1 } = await supabase
      .from("reading_list")
      .select("user_id", { count: "exact", head: true });
    console.log(usersWithBooks);
    const { count: totalUsers, error: error2 } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    console.log(totalUsers);
    if (error1 || error2) {
      console.error("Error fetching user stats:", error1 || error2);
      return;
    }

    const usersWithBooksCount = usersWithBooks || 0;
    const totalUsersCount = totalUsers || 0;
    console.log(totalUsersCount, usersWithBooksCount);
    const usersWithoutBooks = totalUsersCount - usersWithBooksCount;

    setUserStats({
      totalUsers: totalUsersCount,
      usersWithBooks: usersWithBooksCount,
      usersWithoutBooks,
    });
  }

  return (
    <div>
      <AdminHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{userStats?.totalUsers || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>With/Without Books</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {userStats?.usersWithBooks || 0}/
                {userStats?.usersWithoutBooks || 0}
              </p>
            </CardContent>
          </Card>
        </div>
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
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Connections
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.map((user, index) => (
                    <tr key={index} className="bg-white border-b">
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.connections}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
