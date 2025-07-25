import { Book } from "@/interfaces/BookSearch";
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
    .eq("isbn_13", `${id}`)
    .single();

  if (cacheError && cacheError.code !== "PGRST116") {
    console.error("Error checking cache:", cacheError);
  }

  if (cachedBook) {
    return NextResponse.json(cachedBook.data);
  }

  // If not in cache, fetch from ISBNDB API
  try {
    const response = await axios.get(`https://api2.isbndb.com/book/${id}`, {
      headers: {
        Authorization: process.env.ISBN_DB_API_KEY as string,
      },
    });

    if (response.status !== 200) {
      throw new Error(`ISBNDB API responded with status ${response.status}`);
    }

    const bookData: Book = response.data.book;
    // Transform the ISBNDB data to match v1 and v2 format
    const transformedBookData = {
      id: bookData.isbn13,
      volumeInfo: {
        title: bookData.title,
        subtitle:
          bookData.title_long !== bookData.title
            ? bookData.title_long.replace(bookData.title, "").trim()
            : null,
        authors: bookData.authors,
        publishedDate: bookData.date_published,
        description: bookData.synopsis,
        industryIdentifiers: [
          { type: "ISBN_13", identifier: bookData.isbn13 },
          { type: "ISBN_10", identifier: bookData.isbn },
        ],
        pageCount: bookData.pages,
        reviews: bookData.reviews,
        categories:
          bookData.subjects == null
            ? []
            : bookData.subjects.filter(
                (x) =>
                  x.toLowerCase() != "categories" ||
                  x.toLowerCase() != "subjects" ||
                  x.toLowerCase() != "study aids"
              ),
        language: bookData.language,
        imageLinks: {
          thumbnail: bookData.image,
          small: bookData.image,
          medium: bookData.image,
          large: bookData.image,
        },
        publisher: bookData.publisher,
        publishPlace: bookData.publisher || "Unknown",
        physicalFormat: bookData.binding,
        dimensions_structured: {
          height: bookData.dimensions_structured?.height,
          width: bookData.dimensions_structured?.width,
          thickness: bookData.dimensions_structured?.thickness,
          unit: bookData.dimensions_structured?.unit,
        },
        edition: bookData.edition,
        msrp: bookData.msrp,
      },
    };

    // Cache the transformed book data
    const { error: insertError } = await supabase
      .from("books")
      .insert({ isbn_13: `${id}`, data: transformedBookData });

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
