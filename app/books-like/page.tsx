import Link from "next/link";

export default function BooksLikeDirectory() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Books Like</h1>
      <p>Enter a book ID to find similar books:</p>
      <form className="flex gap-2" action={`/books-like/`} method="get">
        <input
          type="text"
          name="id"
          placeholder="Enter book ID"
          className="input input-bordered flex-grow"
          required
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>
    </div>
  );
}
