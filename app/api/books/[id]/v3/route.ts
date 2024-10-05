import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Check if the book exists in the cache
  const { data: cachedBook, error: cacheError } = await supabase
    .from("books")
    .select("data")
    .eq("isbn_13", `v3:${id}`)
    .single();

  if (cacheError && cacheError.code !== "PGRST116") {
    console.error("Error checking cache:", cacheError);
  }

  if (cachedBook) {
    return NextResponse.json(cachedBook.data);
  }

  // If not in cache, fetch from ISBNDB API
  try {
    const response = await axios.get(
      `https://api2.isbndb.com/book/${id}`,
      {
        headers: {
          'Authorization': process.env.ISBN_DB_API_KEY as string
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`ISBNDB API responded with status ${response.status}`);
    }

    const bookData = response.data.book;

    // Cache the book data
    const { error: insertError } = await supabase
      .from("books")
      .insert({ isbn_13: `v3:${id}`, data: { book: bookData } });

    if (insertError) {
      console.error("Error caching book data:", insertError);
    }

    return NextResponse.json({ book: bookData });
  } catch (error) {
    console.error("Error fetching book details:", error);
    return NextResponse.json(
      { error: "Failed to fetch book details" },
      { status: 500 }
    );
  }
}
