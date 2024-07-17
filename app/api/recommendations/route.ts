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

    let recommendations;

    if (!readingHistory || readingHistory.length === 0) {
      console.log('No reading history found, fetching random books');
      const { data: randomBooks, error: randomBooksError } = await supabase
        .from('books')
        .select('*')
        .order('RANDOM()')
        .limit(10);

      if (randomBooksError) {
        console.error('Error fetching random books:', randomBooksError);
        return NextResponse.json({ error: 'Error fetching recommendations' }, { status: 500 });
      }

      recommendations = randomBooks;
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

      // Fetch recommendations based on favorite genre
      const { data: genreRecommendations, error: recommendationsError } = await supabase
        .from('books')
        .select('*')
        .eq('genre', favoriteGenre)
        .limit(10);

      if (recommendationsError) {
        console.error('Error fetching genre recommendations:', recommendationsError);
        return NextResponse.json({ error: 'Error fetching recommendations' }, { status: 500 });
      }

      recommendations = genreRecommendations;
    }

    console.log('Recommendations fetched:', recommendations?.length);
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
