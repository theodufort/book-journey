import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const checkPremium = async (userId: string): Promise<boolean> => {
  const supabase = createClientComponentClient<Database>();

  const {
    data: { has_access },
    error,
  } = await supabase
    .from("profiles")
    .select("has_access")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error checking premium status:", error);
    return false;
  }

  return has_access || false;
};
