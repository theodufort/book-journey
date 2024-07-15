import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
export const supabase = createClientComponentClient();
export async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  console.log(user);
  return user;
}
