import BooksLikeClient from './BooksLikeClient';

export default function BooksLike({ params }: { params: { id: string[] } }) {
  return <BooksLikeClient params={params} />;
}
