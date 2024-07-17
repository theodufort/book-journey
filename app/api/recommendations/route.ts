import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user's reading history
  const { data: readingHistory, error: historyError } = await supabase
    .from('reading_list')
    .select('books(genre)')
    .eq('user_id', user.id);

  if (historyError) {
    return NextResponse.json({ error: 'Error fetching reading history' }, { status: 500 });
  }

  // Count genres
  const genreCounts = readingHistory.reduce((acc, item) => {
    const genre = item.books.genre;
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  // Find the most read genre
  const favoriteGenre = Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b);

  // Fetch recommendations based on favorite genre
  const { data: recommendations, error: recommendationsError } = await supabase
    .from('books')
    .select('*')
    .eq('genre', favoriteGenre)
    .limit(10);

  if (recommendationsError) {
    return NextResponse.json({ error: 'Error fetching recommendations' }, { status: 500 });
  }

  return NextResponse.json({ recommendations });
}
