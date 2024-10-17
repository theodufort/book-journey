"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import AdminHeader from "@/components/AdminHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/Modal";

export default function IndieAuthors() {
  const [authors, setAuthors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClientComponentClient();
  const pageSize = 10;

  useEffect(() => {
    fetchAuthors();
  }, [currentPage]);

  async function fetchAuthors() {
    const { data, error, count } = await supabase
      .from('indie_authors')
      .select('*', { count: 'exact' })
      .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

    if (error) {
      console.error('Error fetching authors:', error);
    } else {
      setAuthors(data);
      setTotalPages(Math.ceil(count / pageSize));
    }
  }

  function handleAuthorClick(author) {
    setSelectedAuthor(author);
    setIsModalOpen(true);
  }

  return (
    <div>
      <AdminHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Indie Authors</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Is Approved</TableHead>
              <TableHead>Main Writing Genres</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authors.map((author) => (
              <TableRow key={author.author_id} onClick={() => handleAuthorClick(author)} className="cursor-pointer">
                <TableCell>{author.name}</TableCell>
                <TableCell>{author.is_approved ? 'Yes' : 'No'}</TableCell>
                <TableCell>{author.main_writing_genres.join(', ')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between mt-4">
          <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      </div>
      <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
        <h3 className="font-bold text-lg">{selectedAuthor?.name}</h3>
        <div className="py-4">
          <p>Is Approved: {selectedAuthor?.is_approved ? 'Yes' : 'No'}</p>
          <p>Main Writing Genres: {selectedAuthor?.main_writing_genres.join(', ')}</p>
          <p>Personal Favorite Genres: {selectedAuthor?.personal_favorite_genres.join(', ')}</p>
          <p>Type of Books: {selectedAuthor?.type_of_books.join(', ')}</p>
          <p>Birth Date: {selectedAuthor?.birth_date}</p>
          <p>First Book Published Year: {selectedAuthor?.first_book_published_year}</p>
          <p>Website: {selectedAuthor?.website}</p>
          <p>Presentation: {selectedAuthor?.presentation}</p>
        </div>
        <div className="modal-action">
          <button className="btn" onClick={() => setIsModalOpen(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
}
