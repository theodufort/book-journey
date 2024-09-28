"use client";
import axios from "axios";
import { useState } from "react";
// OMDb API endpoint with API key
const movieApiEndpoint = "https://omdbapi.com/?apikey=cf4a454b&t="; // Replace with your OMDb API key
const openLibraryApiEndpoint = "https://openlibrary.org/search.json?title=";

async function fetchMovie(bookTitle: string) {
  try {
    const response = await axios.get(
      movieApiEndpoint + encodeURIComponent(bookTitle)
    );
    return [response.data]; // Return the response in an array to maintain uniformity
  } catch (error) {
    console.error("Error fetching movie:", error);
    return null;
  }
}

async function fetchBook(movieTitle: string) {
  try {
    const response = await axios.get(
      openLibraryApiEndpoint + encodeURIComponent(movieTitle)
    );
    return response.data.docs; // Return all book results
  } catch (error) {
    console.error("Error fetching book:", error);
    return null;
  }
}

function FindMovieBookTool() {
  const [activeMethod, setActiveMethod] = useState("moviebook");
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setResults([]);

    if (activeMethod === "moviebook") {
      // Search for a movie based on a book title
      const movieData = await fetchMovie(searchInput);
      setResults(movieData || []);
    } else {
      // Search for a book based on a movie title
      const bookData = await fetchBook(searchInput);
      setResults(bookData || []);
    }

    setLoading(false);
  };

  return (
    <section>
      <div className="max-w-7xl mx-auto px-8 py-5 text-center">
        <h2 className="max-w-3xl mx-auto font-extrabold text-4xl md:text-5xl tracking-tight">
          Find Movies/Books based on Books/Movies
        </h2>
      </div>
      <div role="tablist" className="tabs tabs-boxed">
        <a
          role="tab"
          onClick={() => setActiveMethod("bookmovie")}
          className={`tab ${activeMethod === "bookmovie" ? "tab-active" : ""}`}
        >
          Book Based on Movie
        </a>
        <a
          role="tab"
          onClick={() => setActiveMethod("moviebook")}
          className={`tab ${activeMethod === "moviebook" ? "tab-active" : ""}`}
        >
          Movie Based on Book
        </a>
      </div>
      <div>
        <div className="card bg-base-200 shadow-xl mt-5">
          <div className="card-body">
            <div className="flex m-auto">
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">
                    {activeMethod === "bookmovie" ? "Movie Name" : "Book Name"}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Type here"
                  className="input input-bordered w-full max-w-xs"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </label>
            </div>
            <button
              className="btn btn-primary inline-block max-w-min m-auto"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>

            {/* Display Results in a Table */}
            {results.length > 0 && (
              <div className="overflow-x-auto mt-5">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      {activeMethod === "moviebook" ? (
                        <>
                          <th>Title</th>
                          <th>Year</th>
                          <th>Director</th>
                          <th>Plot</th>
                        </>
                      ) : (
                        <>
                          <th>Title</th>
                          <th>Author(s)</th>
                          <th>First Published</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {activeMethod === "moviebook"
                      ? results.map((movie, index) => {
                          if (index < 9)
                            return (
                              <tr key={index}>
                                <td>{movie.Title}</td>
                                <td>{movie.Year}</td>
                                <td>{movie.Director}</td>
                                <td>{movie.Plot}</td>
                              </tr>
                            );
                        })
                      : results.map((book, index) => {
                          if (index < 9)
                            return (
                              <tr key={index}>
                                <td>{book.title}</td>
                                <td>
                                  {book.author_name
                                    ? book.author_name.join(", ")
                                    : "Unknown"}
                                </td>
                                <td>{book.first_publish_year || "Unknown"}</td>
                              </tr>
                            );
                        })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Show message when no results are found */}
            {results.length === 0 && !loading && (
              <p className="mt-5 text-center">No results found.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FindMovieBookTool;
