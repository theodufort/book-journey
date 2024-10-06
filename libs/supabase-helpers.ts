import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Initialize the Supabase client
const supabase = createClientComponentClient<Database>();
// Function to check if a book exists
export async function checkBookExists(isbn13: string) {
  try {
    const { data, error }: any = await supabase.rpc("check_book_exists", {
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
