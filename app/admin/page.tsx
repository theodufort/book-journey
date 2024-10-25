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
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchActivityData();
    fetchUserStats();
  }, []);

  async function fetchActivityData() {
    const { data: connections, error } = await supabase
      .from('user_connection_activity')
      .select('active_at, user_id')
      .order('active_at', { ascending: true });

    if (error) {
      console.error("Error fetching activity data:", error);
      return;
    }

    // Group connections by date
    const dailyActivity = connections.reduce((acc: any, connection: any) => {
      const date = new Date(connection.active_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = new Set();
      }
      acc[date].add(connection.user_id);
      return acc;
    }, {});

    // Calculate metrics for each date
    const chartData = Object.entries(dailyActivity).map(([date, users]: [string, any]) => {
      const totalUsers = users.size;
      
      // Calculate daily active users
      const dailyActiveUsers = users.size;

      // Calculate weekly active users (users who logged in within the last 7 days)
      const weeklyActiveUsers = new Set();
      const currentDate = new Date(date);
      const weekAgo = new Date(currentDate);
      weekAgo.setDate(weekAgo.getDate() - 7);

      Object.entries(dailyActivity).forEach(([activityDate, activityUsers]: [string, any]) => {
        if (new Date(activityDate) >= weekAgo && new Date(activityDate) <= currentDate) {
          activityUsers.forEach((userId: string) => weeklyActiveUsers.add(userId));
        }
      });

      return {
        date,
        totalUsers,
        dailyActiveUsers,
        weeklyActiveUsers: weeklyActiveUsers.size,
      };
    });

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
      </div>
    </div>
  );
}
