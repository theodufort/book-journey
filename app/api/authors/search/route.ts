import { NextResponse } from 'next/server';

const API_KEY = process.env.ISBNDB_API_KEY;
const BASE_URL = 'https://api2.isbndb.com/authors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${BASE_URL}/${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': API_KEY as string,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from ISBNDB');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
}
