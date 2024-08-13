// app/api/books/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

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
      .eq("isbn_13", `search:${query}`)
      .single();

    if (cacheError && cacheError.code !== "PGRST116") {
      console.error("Error checking cache:", cacheError);
    }

    if (cachedResults) {
      return NextResponse.json(cachedResults.data);
    }

    // If not in cache, fetch from Google Books API
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&maxResults=40&key=${process.env.GOOGLE_API_KEY}&langRestrict=en`
    );

    if (!response.ok) {
      throw new Error(
        `Google Books API responded with status ${response.status}`
      );
    }

    const data = await response.json();
    console.log(data);
    if (!data.items) {
      return NextResponse.json({ items: [] });
    }

    // Filter books to only include those with ISBN identifiers
    const filteredItems = data.items.filter(
      (item: any) =>
        item.volumeInfo.industryIdentifiers?.some((identifier: any) =>
          identifier.type.includes("ISBN_")
        ) && item.volumeInfo.authors
    );

    const result = {
      items: filteredItems,
      totalItems: filteredItems.length,
    };

    // Cache the search results
    const { error: insertError } = await supabase
      .from("books")
      .insert({ isbn_13: `search:${query}`, data: result });

    if (insertError) {
      console.error("Error caching search results:", insertError);
    }
    //Cache unique books
    filteredItems.forEach(async (b: any) => {
      await supabase.from("books").upsert({
        isbn_13: b.volumeInfo.industryIdentifiers?.find(
          (id: any) => id.type === "ISBN_13"
        )?.identifier,
        data: b,
      });
    });

    // Return the filtered data
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "An error occurred while searching for books" },
      { status: 500 }
    );
  }
}
