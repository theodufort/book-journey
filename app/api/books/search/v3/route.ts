import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("pageSize") || "20";
  const language = searchParams.get("language") || "en";

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
      .eq("isbn_13", `search:v3:${query}:${page}:${pageSize}:${language}`)
      .single();

    if (cacheError && cacheError.code !== "PGRST116") {
      console.error("Error checking cache:", cacheError);
    }

    if (cachedResults) {
      return NextResponse.json(cachedResults.data);
    }

    // If not in cache, fetch from ISBNDB API
    const response = await axios.get(
      `https://api2.isbndb.com/books/${encodeURIComponent(query)}?page=${page}&pageSize=${pageSize}&language=${language}`,
      {
        headers: {
          'Authorization': process.env.ISBN_DB_API_KEY as string
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(
        `ISBNDB API responded with status ${response.status}`
      );
    }

    const data = response.data;
    if (!data.books || data.books.length === 0) {
      return NextResponse.json({ total: 0, books: [] });
    }

    // Transform the ISBNDB results to match our format
    const transformedBooks = data.books.map((book: any) => ({
      title: book.title,
      image: book.image,
      title_long: book.title_long,
      date_published: book.date_published,
      publisher: book.publisher,
      synopsis: book.synopsis,
      subjects: book.subjects || [],
      authors: book.authors,
      isbn13: book.isbn13,
      binding: book.binding,
      isbn: book.isbn13,
      isbn10: book.isbn10,
      language: book.language,
      pages: book.pages,
    }));

    const result = {
      total: data.total,
      books: transformedBooks,
    };

    // Cache the search results
    const { error: insertError } = await supabase
      .from("books")
      .insert({ isbn_13: `search:v3:${query}:${page}:${pageSize}:${language}`, data: result });

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
