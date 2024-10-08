import { NextResponse } from "next/server";

const API_KEY = process.env.ISBN_DB_API_KEY;
const BASE_URL = "https://api2.isbndb.com/authors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const searchResponse = await fetch(`${BASE_URL}/${encodeURIComponent(query)}`, {
      headers: {
        Authorization: API_KEY as string,
      },
    });

    if (!searchResponse.ok) {
      throw new Error("Failed to fetch data from ISBNDB");
    }

    const searchData = await searchResponse.json();
    const authors = searchData.authors || [];

    if (authors.length === 0) {
      return NextResponse.json({ authors: [] });
    }

    for (const author of authors) {
      try {
        const authorResponse = await fetch(`${BASE_URL}/${encodeURIComponent(author.author)}`, {
          headers: {
            Authorization: API_KEY as string,
          },
        });

        if (authorResponse.ok) {
          const authorData = await authorResponse.json();
          return NextResponse.json(authorData);
        }
      } catch (error) {
        console.error(`Error fetching author details for ${author.author}:`, error);
      }
    }

    // If we couldn't get details for any author, return the original search results
    return NextResponse.json(searchData);
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { error: "Failed to fetch authors" },
      { status: 500 }
    );
  }
}
