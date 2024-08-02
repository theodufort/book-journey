// hooks/useBookDetails.ts

import { useState, useEffect } from "react";
import axios from "axios";

export function useBookDetails(bookId: string) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookDetails() {
      try {
        const response = await axios.get(`/api/books/${bookId}`);
        if (response.status != 200) {
          throw new Error("Failed to fetch book details");
        }
        const data = await response.data;
        setBook(data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching book details");
        setLoading(false);
      }
    }

    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId]);
  return { book, loading, error };
}
