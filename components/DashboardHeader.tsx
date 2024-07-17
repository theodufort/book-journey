// components/HeaderDashboard.tsx

import Link from "next/link";
import ButtonAccount from "@/components/ButtonAccount";

const HeaderDashboard = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="inline-block">
        <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box">
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link href="/dashboard/reading-list">Reading List</Link>
          </li>
          <li>
            <Link href="/dashboard/recommendations">
              Reading Recommendations
            </Link>
          </li>
          <li>
            <Link href="/dashboard/reading-rewards">Reading Rewards</Link>
          </li>
          <li>
            <Link href="/dashboard/profile">Profile</Link>
          </li>
        </ul>
      </div>
      <div>
        <ButtonAccount />
      </div>
    </div>
  );
};

export default HeaderDashboard;
