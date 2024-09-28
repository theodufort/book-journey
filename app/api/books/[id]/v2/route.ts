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
    // Step 1: Call /isbn/[isbn]
    const isbnResponse = await axios.get(`https://openlibrary.org/isbn/${id}.json`);

    if (isbnResponse.status !== 200) {
      throw new Error(`Open Library API responded with status ${isbnResponse.status}`);
    }

    const isbnData = isbnResponse.data;

    // Step 2: Get the corresponding /books/[key]
    const bookKey = isbnData.key;
    const bookResponse = await axios.get(`https://openlibrary.org${bookKey}.json`);

    if (bookResponse.status !== 200) {
      throw new Error(`Open Library API responded with status ${bookResponse.status}`);
    }

    const bookData = bookResponse.data;

    // Step 3: If a works key exists, ping /works/[workkey]
    let worksData = null;
    if (bookData.works && bookData.works.length > 0) {
      const worksKey = bookData.works[0].key;
      const worksResponse = await axios.get(`https://openlibrary.org${worksKey}.json`);

      if (worksResponse.status === 200) {
        worksData = worksResponse.data;
      } else {
        console.error(`Error fetching works data: ${worksResponse.status}`);
      }
    }

    // Combine data from all sources
    const combinedData = {
      ...isbnData,
      ...bookData,
      works: worksData,
    };

    // Transform the Open Library data to match our previous API structure
    const transformedBookData = {
      id: combinedData.key,
      volumeInfo: {
        title: combinedData.title,
        subtitle: combinedData.subtitle || null,
        authors: combinedData.authors ? combinedData.authors.map((author: any) => author.name) : ["Unknown Author"],
        publishedDate: combinedData.publish_date,
        description: combinedData.description
          ? typeof combinedData.description === "string"
            ? combinedData.description
            : combinedData.description.value || ""
          : "",
        industryIdentifiers: [
          { type: "ISBN_13", identifier: id },
          ...(combinedData.isbn_10 ? [{ type: "ISBN_10", identifier: combinedData.isbn_10[0] }] : []),
        ],
        imageLinks: {
          thumbnail: combinedData.covers
            ? `https://covers.openlibrary.org/b/id/${combinedData.covers[0]}-M.jpg`
            : null,
        },
        pageCount: combinedData.number_of_pages || 0,
        categories: combinedData.subjects || [],
        language: combinedData.language ? combinedData.language.key.split('/').pop().slice(0, 3).toLowerCase() : "und",
        publisher: combinedData.publishers ? combinedData.publishers[0] : "Unknown Publisher",
        publishPlace: combinedData.publish_places ? combinedData.publish_places[0] : null,
        physicalFormat: combinedData.physical_format || null,
        pagination: combinedData.pagination || null,
        identifiers: {
          goodreads: combinedData.identifiers?.goodreads || [],
          lccn: combinedData.lccn || [],
          oclc: combinedData.oclc_numbers || [],
        },
        works: worksData ? {
          key: worksData.key,
          title: worksData.title,
          description: worksData.description || null,
          subjects: worksData.subjects || [],
          subjectPlaces: worksData.subject_places || [],
          subjectTimes: worksData.subject_times || [],
        } : null,
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
