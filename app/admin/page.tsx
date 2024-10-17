"use client";

import AdminHeader from "@/components/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Admin() {
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
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

    const chartData = Object.entries(userCounts).map(([date, count]) => ({
      date,
      users: count,
    }));

    setUserGrowthData(chartData);
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
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
