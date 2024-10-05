import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const subjects = searchParams.get("subjects");
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("pageSize") || "20";
  const language = searchParams.get("language") || "en";

  if (!query && !subjects) {
    return NextResponse.json(
      { error: "Search query or subjects are required" },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    // Construct the search string
    let searchString = query || "";
    if (subjects) {
      const subjectArray = subjects.split(",");
      searchString +=
        (searchString ? " " : "") +
        subjectArray.map((subject) => `subject:"${subject.trim()}"`).join(" ");
    }

    // Check if the search results exist in the cache
    const cacheKey = `search:v3:${searchString}:${page}:${pageSize}:${language}`;
    const { data: cachedResults, error: cacheError } = await supabase
      .from("books")
      .select("data")
      .eq("isbn_13", cacheKey)
      .single();

    if (cacheError && cacheError.code !== "PGRST116") {
      console.error("Error checking cache:", cacheError);
    }

    if (cachedResults) {
      return NextResponse.json(cachedResults.data);
    }
    const url = `https://api2.isbndb.com/books/${encodeURIComponent(
      searchString
    )}?page=${page}&pageSize=${pageSize}&language=${language}`;
    console.log(url);
    // If not in cache, fetch from ISBNDB API
    const response = await axios.get(url, {
      headers: {
        Authorization: process.env.ISBN_DB_API_KEY as string,
      },
    });

    if (response.status !== 200) {
      throw new Error(`ISBNDB API responded with status ${response.status}`);
    }

    const data = response.data;
    if (!data.books || data.books.length === 0) {
      return NextResponse.json({ total: 0, books: [] });
    }

    // Transform the ISBNDB results to match our format
    const transformedBooks = data.books.map((book: any) => ({
      id: book.isbn13,
      volumeInfo: {
        title: book.title,
        subtitle:
          book.title_long !== book.title
            ? book.title_long.replace(book.title, "").trim()
            : null,
        authors: book.authors,
        publishedDate: book.date_published,
        description: book.synopsis,
        industryIdentifiers: [
          { type: "ISBN_13", identifier: book.isbn13 },
          { type: "ISBN_10", identifier: book.isbn10 },
        ],
        pageCount: book.pages,
        categories: book.subjects,
        language: book.language,
        imageLinks: {
          thumbnail: book.image,
        },
        publisher: book.publisher,
      },
    }));

    const result = {
      items: transformedBooks,
      totalItems: data.total,
    };

    // Cache the search results
    const { error: insertError } = await supabase
      .from("books")
      .insert({ isbn_13: cacheKey, data: result });

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
