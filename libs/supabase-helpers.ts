import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client

// Function to check if a book exists
export async function checkBookExists(isbn13: string) {
  const supabase = createClientComponentClient<Database>();
  try {
    const { data, error } = await supabase.rpc("check_book_exists", {
      p_isbn_13: isbn13,
    });

    if (error) throw error;

    if (data && data.length > 0) {
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error checking book:", error.message);
    return null;
  }
}
