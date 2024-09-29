"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useState } from "react";
import { authors } from "./dummyData";
import { Author } from "./types";

function EmergingAuthors() {
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>(authors);
  const [filters, setFilters] = useState({
    genre: "",
    language: "",
    selfPublished: null as boolean | null,
  });

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const filtered = authors.filter((author) => {
      return (
        (newFilters.genre === "" || author.genre === newFilters.genre) &&
        (newFilters.language === "" ||
          author.language === newFilters.language) &&
        (newFilters.selfPublished === null ||
          author.selfPublished === newFilters.selfPublished)
      );
    });

    setFilteredAuthors(filtered);
  };

  return (
    <div>
      <Header />
      <section className="max-w-7xl mx-auto px-8 py-5">
        <h2 className="text-center font-extrabold text-4xl md:text-5xl tracking-tight mb-8">
          Find Emerging Authors
        </h2>

        <div className="mb-8 flex flex-wrap gap-4">
          <select
            className="p-2 border rounded"
            onChange={(e) => handleFilterChange("genre", e.target.value)}
            value={filters.genre}
          >
            <option value="">All Genres</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Mystery">Mystery</option>
            <option value="Sci-Fi">Sci-Fi</option>
          </select>

          <select
            className="p-2 border rounded"
            onChange={(e) => handleFilterChange("language", e.target.value)}
            value={filters.language}
          >
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>

          <select
            className="p-2 border rounded"
            onChange={(e) =>
              handleFilterChange("selfPublished", e.target.value === "true")
            }
            value={
              filters.selfPublished === null
                ? ""
                : filters.selfPublished.toString()
            }
          >
            <option value="">All Publishing Types</option>
            <option value="true">Self-Published</option>
            <option value="false">Traditional Publishing</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthors.map((author) => (
            <div key={author.id} className="border p-4 rounded shadow">
              <h3 className="font-bold text-xl mb-2">{author.name}</h3>
              <p className="mb-1">Genre: {author.genre}</p>
              <p className="mb-1">Language: {author.language}</p>
              <p className="mb-1">
                Publishing:{" "}
                {author.selfPublished ? "Self-Published" : "Traditional"}
              </p>
              <p className="mt-2">{author.bio}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default EmergingAuthors;
