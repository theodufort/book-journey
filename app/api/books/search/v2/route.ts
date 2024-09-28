import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import axios from "axios";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    // Check if the search results exist in the cache
    const { data: cachedResults, error: cacheError } = await supabase
      .from("books")
      .select("data")
      .eq("isbn_13", `search:v2:${query}`)
      .single();

    if (cacheError && cacheError.code !== "PGRST116") {
      console.error("Error checking cache:", cacheError);
    }

    if (cachedResults) {
      return NextResponse.json(cachedResults.data);
    }

    // If not in cache, fetch from Open Library API
    const response = await axios.get(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=40&language=eng`
    );

    if (response.status !== 200) {
      throw new Error(
        `Open Library API responded with status ${response.status}`
      );
    }

    const data = response.data;
    if (!data.docs || data.docs.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Transform the Open Library results to match the structure of our previous API
    const transformedItems = data.docs.map((book: any) => ({
      id: book.key,
      volumeInfo: {
        title: book.title,
        authors: book.author_name,
        publishedDate: book.first_publish_year?.toString(),
        description: book.description,
        industryIdentifiers: [
          { type: "ISBN_13", identifier: book.isbn ? book.isbn[0] : null },
        ],
        imageLinks: {
          thumbnail: book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : null,
        },
      },
    }));

    const result = {
      items: transformedItems,
      totalItems: data.numFound,
    };

    // Cache the search results
    const { error: insertError } = await supabase
      .from("books")
      .insert({ isbn_13: `search:v2:${query}`, data: result });

    if (insertError) {
      console.error("Error caching search results:", insertError);
    }

    // Return the transformed data
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "An error occurred while searching for books" },
      { status: 500 }
    );
  }
}
