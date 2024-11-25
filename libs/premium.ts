import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routeros } from "react-syntax-highlighter/dist/esm/styles/hljs";

export const checkPremium = async (userId: string) => {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const {
    data: { has_access },
    error,
  } = await supabase
    .from("profiles")
    .select("has_access")
    .eq("id", userId)
    .single();
  console.log(has_access);
  if (has_access) {
    return true;
  } else router.push("/dashboard/premium");
};
