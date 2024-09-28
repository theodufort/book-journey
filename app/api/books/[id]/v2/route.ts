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
    .eq("isbn_13", `v2:${id}`)
    .single();

  if (cacheError && cacheError.code !== "PGRST116") {
    console.error("Error checking cache:", cacheError);
  }

  if (cachedBook) {
    return NextResponse.json(cachedBook.data);
  }

  // If not in cache, fetch from Open Library API
  try {
    const response = await axios.get(`https://openlibrary.org/isbn/${id}.json`);

    if (response.status !== 200) {
      throw new Error(
        `Open Library API responded with status ${response.status}`
      );
    }

    const bookData = response.data;
    console.log(bookData);
    // Transform the Open Library data to match our previous API structure
    const transformedBookData = {
      id: bookData.key,
      volumeInfo: {
        title: bookData.title,
        authors: bookData.authors
          ? bookData.authors.map((author: any) => author.name)
          : [],
        publishedDate: bookData.publish_date,
        description: bookData.description
          ? typeof bookData.description === "string"
            ? bookData.description
            : bookData.description.value
          : "",
        industryIdentifiers: [{ type: "ISBN_13", identifier: id }],
        imageLinks: {
          thumbnail: bookData.covers
            ? `https://covers.openlibrary.org/b/id/${bookData.covers[0]}-M.jpg`
            : null,
        },
        pageCount: bookData.number_of_pages,
        categories: bookData.subjects,
        language: bookData.language
          ? bookData.language.key.split("/").pop()
          : null,
      },
    };

    // Cache the book data
    const { error: insertError } = await supabase
      .from("books")
      .insert({ isbn_13: `v2:${id}`, data: transformedBookData });

    if (insertError) {
      console.error("Error caching book data:", insertError);
    }

    return NextResponse.json(transformedBookData);
  } catch (error) {
    console.error("Error fetching book details:", error);
    return NextResponse.json(
      { error: "Failed to fetch book details" },
      { status: 500 }
    );
  }
}
