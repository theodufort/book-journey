"use client";
import config from "@/config";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Provider } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const t = useTranslations("Signin");

  // Signup state
  const [firstName, setFirstName] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");

  // Signin state
  const [signinEmail, setSigninEmail] = useState<string>("");
  const [signinPassword, setSigninPassword] = useState<string>("");

  // Reset password state
  const [resetEmail, setResetEmail] = useState<string>("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check password strength and match
    if (signupPassword.length < 6) {
      toast.error("Password should be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (signupPassword !== repeatPassword) {
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            first_name: firstName,
          },
        },
      });

      if (error) {
        if (error.message === "User already registered") {
          toast.error(
            "This email is already registered. Please sign in instead."
          );
        } else if (error.message.includes("weak_password")) {
          toast.error(
            "Password is too weak. Please choose a stronger password."
          );
        } else {
          throw error;
        }
      } else {
        toast.success(
          "Signup successful! You will be redirected!"
          // "Signup successful! Please check your email to verify your account."
        );
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signinEmail,
        password: signinPassword,
      });

      if (error) throw error;
      toast.success("Signin successful!");
      // Redirect or update UI as needed
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(
        "Signin failed. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignin = async (provider: Provider) => {
    setIsLoading(true);

    try {
      const redirectURL =
        window.location.origin +
        `/api/auth/callback${ref ? "?ref=" + ref : ""}`;
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectURL,
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("OAuth signin failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/signin`,
      });

      if (error) throw error;
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reset password email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="p-8 md:p-24 min-h-screen flex flex-col justify-center bg-[#7383fb]"
      data-theme={config.colors.theme}
    >
      <div className="text-center mb-4 text-white">
        <Link href="/" className="btn btn-ghost btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          {t("home")}
        </Link>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center text-white mb-12">
        {t("title")}
      </h1>

      <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 max-w-4xl mx-auto">
        {/* Signup Form */}
        <div className="flex-1 p-8 rounded-box shadow-lg bg-base-100 flex flex-col">
          <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
          <form
            onSubmit={handleSignup}
            className="space-y-4 flex-grow flex flex-col"
          >
            <div className="space-y-4 flex-grow">
              <input
                required
                type="text"
                value={firstName}
                placeholder="First Name"
                className="input input-bordered w-full"
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                required
                type="email"
                value={signupEmail}
                placeholder="Email"
                className="input input-bordered w-full"
                onChange={(e) => setSignupEmail(e.target.value)}
              />
              <input
                required
                type="password"
                value={signupPassword}
                placeholder="Password"
                className="input input-bordered w-full"
                onChange={(e) => setSignupPassword(e.target.value)}
              />
              <input
                required
                type="password"
                value={repeatPassword}
                placeholder="Repeat Password"
                className="input input-bordered w-full"
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary btn-block mt-auto"
              disabled={isLoading}
              type="submit"
            >
              {isLoading && (
                <span className="loading loading-spinner loading-xs"></span>
              )}
              Sign Up
            </button>
          </form>
        </div>

        {/* Signin Form */}
        <div className="flex-1 p-8 rounded-box shadow-lg bg-base-100 flex flex-col">
          <h2 className="text-2xl font-bold mb-6">Sign In</h2>
          <div className="flex-grow flex flex-col">
            <button
              className="btn btn-block mb-4"
              onClick={() => handleOAuthSignin("google")}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 bg-base-300"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
              )}
              {t("google")}
            </button>

            <div className="divider text-xs text-base-content/50 font-medium">
              {t("separator")}
            </div>

            <form onSubmit={handleSignin} className="space-y-4 flex-grow flex flex-col">
              <div className="space-y-4 flex-grow">
                <input
                  required
                  type="email"
                  value={signinEmail}
                  placeholder="Email"
                  className="input input-bordered w-full"
                  onChange={(e) => setSigninEmail(e.target.value)}
                />
                <input
                  required
                  type="password"
                  value={signinPassword}
                  placeholder="Password"
                  className="input input-bordered w-full"
                  onChange={(e) => setSigninPassword(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary btn-block mt-auto"
                disabled={isLoading}
                type="submit"
              >
                {isLoading && (
                  <span className="loading loading-spinner loading-xs"></span>
                )}
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
