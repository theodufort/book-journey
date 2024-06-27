// hooks/useBookDetails.ts

import { useState, useEffect } from "react";
import apiClient from "@/libs/api";
import axios from "axios";

interface BookDetails {
  id: string;
  title: string;
  authors: string[];
  description: string;
  categories: string[];
  imageLinks: {
    thumbnail: string;
    smallThumbnail: string;
  };
  pageCount: number;
  publishedDate: string;
  averageRating: number;
}

export function useBookDetails(bookId: string) {
  const [book, setBook] = useState<BookDetails | null>(null);
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
