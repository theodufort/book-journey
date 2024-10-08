"use client";

import { useState } from "react";
import Modal from "../../components/Modal";

export default function Authors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/authors/search?query=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch authors");
      }
      const data = await response.json();
      if (data.author) {
        // Single author details returned
        setAuthors([data.author]);
      } else if (data.authors) {
        // List of authors returned
        setAuthors(data.authors);
      } else {
        setAuthors([]);
      }
    } catch (err) {
      setError("An error occurred while fetching authors");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-8 py-5">
      <h2 className="text-center font-extrabold text-4xl md:text-5xl tracking-tight mb-8">
        Authors
      </h2>

      <div className="flex items-center mb-8 gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search authors..."
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="btn btn-primary text-white py-2 rounded-r-mdfocus:outline-none focus:ring-2 text-lg"
        >
          🔍
        </button>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="btn btn-secondary text-lg"
        >
          ⚙️
        </button>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((author, index) => (
            <div key={index} className="border p-4 rounded-md">
              <h3 className="font-bold">{author.name || author.author}</h3>
              {author.books && (
                <p>Books: {author.books.join(", ")}</p>
              )}
              {author.born && (
                <p>Born: {author.born}</p>
              )}
              {author.died && (
                <p>Died: {author.died}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isModalOpen={isFilterModalOpen}
        setIsModalOpen={setIsFilterModalOpen}
      >
        <h3 className="text-lg font-semibold mb-4">Filter Authors</h3>
        {/* Add filter options here */}
        <div className="space-y-4">
          {/* Example filter options */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Genre
            </label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option>All Genres</option>
              <option>Fiction</option>
              <option>Non-Fiction</option>
              {/* Add more genres */}
            </select>
          </div>
          {/* Add more filter options as needed */}
        </div>
        <div className="mt-6">
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
        </div>
      </Modal>
    </section>
  );
}
