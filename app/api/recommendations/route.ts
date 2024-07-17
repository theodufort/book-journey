import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's reading history
    const { data: readingHistory, error: historyError } = await supabase
      .from('reading_list')
      .select('books(genre)')
      .eq('user_id', user.id);

    if (historyError) {
      console.error('Error fetching reading history:', historyError);
      return NextResponse.json({ error: 'Error fetching reading history' }, { status: 500 });
    }

    let searchQuery;

    if (!readingHistory || readingHistory.length === 0) {
      console.log('No reading history found, using general search query');
      searchQuery = 'bestseller';
    } else {
      // Count genres
      const genreCounts = readingHistory.reduce((acc, item) => {
        const genre = item.books?.genre;
        if (genre) {
          acc[genre] = (acc[genre] || 0) + 1;
        }
        return acc;
      }, {});

      // Find the most read genre
      const favoriteGenre = Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b);

      console.log('Favorite genre:', favoriteGenre);
      searchQuery = `${favoriteGenre} books`;
    }

    // Use the books search API to get recommendations
    const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/books/search?q=${encodeURIComponent(searchQuery)}`);
    
    if (!searchResponse.ok) {
      throw new Error('Failed to fetch book recommendations');
    }

    const searchData = await searchResponse.json();

    // Process the search results to get book details
    const recommendations = await Promise.all(
      searchData.items.slice(0, 10).map(async (item) => {
        const isbn = item.volumeInfo.industryIdentifiers?.find(id => id.type.includes('ISBN_'))?.identifier;
        if (!isbn) return null;

        const bookResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/books/${isbn}`);
        if (!bookResponse.ok) return null;

        return bookResponse.json();
      })
    );

    // Filter out any null results
    const filteredRecommendations = recommendations.filter(book => book !== null);

    console.log('Recommendations fetched:', filteredRecommendations.length);
    return NextResponse.json({ recommendations: filteredRecommendations });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
