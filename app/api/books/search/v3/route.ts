import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
const supabase = createRouteHandlerClient<Database>({ cookies });
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
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

  try {
    // Construct the search string
    let url: string;
    let cacheKey: string;

    if (subjects) {
      const subjectArray = subjects.split(",").map((subject) => subject.trim());
      const subjectsQuery = subjectArray.join(", ");
      url = `https://api2.isbndb.com/books/${encodeURIComponent(
        subjectsQuery
      )}?column=subjects&page=${page}&pageSize=${pageSize}&language=${language}`;
      cacheKey = `search:v3:subjects:${subjectsQuery}:${page}:${pageSize}:${language}`;
    } else if (query) {
      url = `https://api2.isbndb.com/books/${encodeURIComponent(
        query
      )}?page=${page}&pageSize=${pageSize}&language=${language}`;
      cacheKey = `search:v3:query:${query}:${page}:${pageSize}:${language}`;
    } else {
      return NextResponse.json(
        { error: "Either subjects or query must be provided" },
        { status: 400 }
      );
    }

    // Check if the search results exist in the cache
    // const { data: cachedResults, error: cacheError } = await supabase
    //   .from("books")
    //   .select("data")
    //   .eq("isbn_13", cacheKey)
    //   .single();

    // if (cacheError && cacheError.code !== "PGRST116") {
    //   console.error("Error checking cache:", cacheError);
    // }

    // if (cachedResults) {
    //   return NextResponse.json(cachedResults.data);
    // }
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
    transformedBooks.forEach(async (x: any) => {
      // Cache the transformed book data
      const { error: insertError } = await supabase
        .from("books")
        .insert({ isbn_13: `${x.id}`, data: x });
    });

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
