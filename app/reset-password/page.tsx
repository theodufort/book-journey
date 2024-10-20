"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully!");
      router.push("/signin");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8 md:p-24 min-h-screen flex flex-col justify-center bg-[#7383fb]">
      <div className="max-w-md mx-auto p-8 rounded-box shadow-lg bg-base-100">
        <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            required
            type="password"
            value={newPassword}
            placeholder="New Password"
            className="input input-bordered w-full"
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            required
            type="password"
            value={confirmPassword}
            placeholder="Confirm New Password"
            className="input input-bordered w-full"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            className="btn btn-primary btn-block"
            disabled={isLoading}
            type="submit"
          >
            {isLoading && (
              <span className="loading loading-spinner loading-xs"></span>
            )}
            Reset Password
          </button>
        </form>
      </div>
    </main>
  );
}
