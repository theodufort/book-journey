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

    const processedAuthors = authors.map((author: string) => {
      const nameParts = author.split(' ').filter(part => part.toLowerCase() !== 'undefined');
      return {
        name: nameParts.join(' ') || 'Unknown',
        original: author
      };
    });

    return NextResponse.json({ total: searchData.total, authors: processedAuthors });
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { error: "Failed to fetch authors" },
      { status: 500 }
    );
  }
}
