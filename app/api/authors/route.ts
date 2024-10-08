import { NextResponse } from "next/server";

const API_KEY = process.env.ISBN_DB_API_KEY;
const BASE_URL = "https://api2.isbndb.com/authors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Name parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${BASE_URL}/${encodeURIComponent(name)}`, {
      headers: {
        Authorization: API_KEY as string,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from ISBNDB");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching author:", error);
    return NextResponse.json(
      { error: "Failed to fetch author" },
      { status: 500 }
    );
  }
}
