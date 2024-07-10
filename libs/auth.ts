import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    db: { schema: "next_auth" },
  }
);
export async function getUser() {
  const { data: session } = useSession();
  // const {
  //   data: { user },
  //   error,
  // } = await supabase.auth.getUser();
  console.log(session);
  return session;
}
