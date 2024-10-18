"use client";
import AdminHeader from "@/components/AdminHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

export default function IndieAuthors() {
  const [authors, setAuthors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editedAuthor, setEditedAuthor] = useState({
    name: "",
    email: "",
    is_approved: false,
    presentation: "",
    birth_date: "",
    first_book_published_year: "",
    personal_favorite_genres: [],
    main_writing_genres: [],
    type_of_books: [],
    picture_link: "",
    website: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isApprovedFilter, setIsApprovedFilter] = useState<boolean | null>(null);
  const supabase = createClientComponentClient();
  const pageSize = 10;

  useEffect(() => {
    fetchAuthors();
  }, [currentPage, searchTerm, isApprovedFilter]);

  async function fetchAuthors() {
    let query = supabase
      .from("indie_authors")
      .select("*, profiles(email)", {
        count: "exact",
      })
      .order("name", { ascending: true });

    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%`,
        { foreignTable: "profiles" }
      );
    }

    if (isApprovedFilter !== null) {
      query = query.eq("is_approved", isApprovedFilter);
    }

    const { data, error, count } = await query.range(
      (currentPage - 1) * pageSize,
      currentPage * pageSize - 1
    );

    if (error) {
      console.error("Error fetching authors:", error);
    } else {
      const authorsWithEmail = data.map((author) => ({
        ...author,
        email: author.profiles?.email || "N/A",
      }));

      setAuthors(authorsWithEmail);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    }
  }

  function handleAuthorClick(author: any) {
    setSelectedAuthor(author);
    setIsModalOpen(true);
  }

  function handleEditAuthor() {
    setEditedAuthor({
      name: selectedAuthor?.name || "",
      email: selectedAuthor?.email || "",
      is_approved: selectedAuthor?.is_approved || false,
      presentation: selectedAuthor?.presentation || "",
      birth_date: selectedAuthor?.birth_date || "",
      first_book_published_year: selectedAuthor?.first_book_published_year || "",
      personal_favorite_genres: selectedAuthor?.personal_favorite_genres || [],
      main_writing_genres: selectedAuthor?.main_writing_genres || [],
      type_of_books: selectedAuthor?.type_of_books || [],
      picture_link: selectedAuthor?.picture_link || "",
      website: selectedAuthor?.website || "",
    });
    setIsEditModalOpen(true);
  }

  async function updateAuthor() {
    if (!selectedAuthor || !selectedAuthor.author_id) {
      console.error("No author selected for update");
      return;
    }

    const { error: authorError } = await supabase
      .from("indie_authors")
      .update({
        name: editedAuthor.name,
        is_approved: editedAuthor.is_approved,
        presentation: editedAuthor.presentation,
        birth_date: editedAuthor.birth_date,
        first_book_published_year: editedAuthor.first_book_published_year,
        personal_favorite_genres: editedAuthor.personal_favorite_genres,
        main_writing_genres: editedAuthor.main_writing_genres,
        type_of_books: editedAuthor.type_of_books,
        picture_link: editedAuthor.picture_link,
        website: editedAuthor.website,
      })
      .eq("author_id", selectedAuthor.author_id);

    if (authorError) {
      console.error("Error updating author:", authorError);
      return;
    }

    if (editedAuthor.email) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ email: editedAuthor.email })
        .eq("id", selectedAuthor.author_id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        return;
      }
    }

    setSelectedAuthor({ ...selectedAuthor, ...editedAuthor });
    setIsEditModalOpen(false);
    fetchAuthors();
  }

  return (
    <div>
      <AdminHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Indie Authors</h1>
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <input
              className="input input-bordered w-full max-w-xs"
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border rounded p-2"
            value={isApprovedFilter === null ? "" : isApprovedFilter.toString()}
            onChange={(e) =>
              setIsApprovedFilter(
                e.target.value === "" ? null : e.target.value === "true"
              )
            }
          >
            <option value="">All</option>
            <option value="true">Approved</option>
            <option value="false">Not Approved</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={() => {
              setCurrentPage(1);
              fetchAuthors();
            }}
          >
            Search
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-md">Name</TableHead>
              <TableHead className="text-md">Email</TableHead>
              <TableHead className="text-md">Approved</TableHead>
              <TableHead className="text-md">Website</TableHead>
              <TableHead className="text-md">Social Media</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authors.map((author) => (
              <TableRow
                key={author.author_id}
                onClick={() => handleAuthorClick(author)}
                className="cursor-pointer"
              >
                <TableCell className="text-md">{author.name}</TableCell>
                <TableCell className="text-md">{author.email}</TableCell>
                <TableCell className="text-md">
                  {author.is_approved ? "Yes" : "No"}
                </TableCell>
                <TableCell className="text-md">{author.website || "N/A"}</TableCell>
                <TableCell className="text-md">
                  {author.twitter || author.facebook || author.instagram ? "Yes" : "No"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between mt-4">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      <dialog id="author_modal" className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => setIsModalOpen(false)}>✕</button>
          </form>
          <h3 className="font-bold text-lg">{selectedAuthor?.name}</h3>
          <div className="py-4 space-y-2">
            <p><strong>Email:</strong> {selectedAuthor?.email}</p>
            <p><strong>Approved:</strong> {selectedAuthor?.is_approved ? "Yes" : "No"}</p>
            <p><strong>Presentation:</strong> {selectedAuthor?.presentation || "N/A"}</p>
            <p><strong>Birth Date:</strong> {selectedAuthor?.birth_date || "N/A"}</p>
            <p><strong>First Book Published Year:</strong> {selectedAuthor?.first_book_published_year || "N/A"}</p>
            <p><strong>Personal Favorite Genres:</strong> {selectedAuthor?.personal_favorite_genres?.join(", ") || "N/A"}</p>
            <p><strong>Main Writing Genres:</strong> {selectedAuthor?.main_writing_genres?.join(", ") || "N/A"}</p>
            <p><strong>Type of Books:</strong> {selectedAuthor?.type_of_books?.join(", ") || "N/A"}</p>
            <p><strong>Picture Link:</strong> {selectedAuthor?.picture_link || "N/A"}</p>
            <p><strong>Website:</strong> {selectedAuthor?.website || "N/A"}</p>
          </div>
          <div className="modal-action">
            <button className="btn" onClick={handleEditAuthor}>Edit</button>
            <button className="btn" onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      </dialog>

      <dialog id="edit_modal" className={`modal ${isEditModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => setIsEditModalOpen(false)}>✕</button>
          </form>
          <h3 className="font-bold text-lg">Edit Author</h3>
          <div className="py-4 space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="name">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                id="name"
                className="input input-bordered"
                value={editedAuthor.name}
                onChange={(e) => setEditedAuthor((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                id="email"
                className="input input-bordered"
                value={editedAuthor.email}
                onChange={(e) => setEditedAuthor((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Approved</span>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={editedAuthor.is_approved}
                  onChange={(e) => setEditedAuthor((prev) => ({ ...prev, is_approved: e.target.checked }))}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label" htmlFor="presentation">
                <span className="label-text">Presentation</span>
              </label>
              <textarea
                id="presentation"
                className="textarea textarea-bordered"
                value={editedAuthor.presentation}
                onChange={(e) => setEditedAuthor((prev) => ({ ...prev, presentation: e.target.value }))}
              ></textarea>
            </div>
            <div className="form-control">
              <label className="label" htmlFor="birth_date">
                <span className="label-text">Birth Date</span>
              </label>
              <input
                type="date"
                id="birth_date"
                className="input input-bordered"
                value={editedAuthor.birth_date}
                onChange={(e) => setEditedAuthor((prev) => ({ ...prev, birth_date: e.target.value }))}
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="first_book_published_year">
                <span className="label-text">First Book Published Year</span>
              </label>
              <input
                type="number"
                id="first_book_published_year"
                className="input input-bordered"
                value={editedAuthor.first_book_published_year}
                onChange={(e) => setEditedAuthor((prev) => ({ ...prev, first_book_published_year: e.target.value }))}
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="personal_favorite_genres">
                <span className="label-text">Personal Favorite Genres</span>
              </label>
              <input
                type="text"
                id="personal_favorite_genres"
                className="input input-bordered"
                value={editedAuthor.personal_favorite_genres.join(", ")}
                onChange={(e) => setEditedAuthor((prev) => ({ ...prev, personal_favorite_genres: e.target.value.split(", ") }))}
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="main_writing_genres">
                <span className="label-text">Main Writing Genres</span>
              </label>
              <input
                type="text"
                id="main_writing_genres"
                className="input input-bordered"
                value={editedAuthor.main_writing_genres.join(", ")}
                onChange={(e) => setEditedAuthor((prev) => ({ ...prev, main_writing_genres: e.target.value.split(", ") }))}
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="type_of_books">
                <span className="label-text">Type of Books</span>
              </label>
              <input
                type="text"
                id="type_of_books"
                className="input input-bordered"
                value={editedAuthor.type_of_books.join(", ")}
                onChange={(e) => setEditedAuthor((prev) => ({ ...prev, type_of_books: e.target.value.split(", ") }))}
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="picture_link">
                <span className="label-text">Picture Link</span>
              </label>
              <input
                type="url"
                id="picture_link"
                className="input input-bordered"
                value={editedAuthor.picture_link}
                onChange={(e) => setEditedAuthor((prev) => ({ ...prev, picture_link: e.target.value }))}
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="website">
                <span className="label-text">Website</span>
              </label>
              <input
                type="url"
                id="website"
                className="input input-bordered"
                value={editedAuthor.website}
                onChange={(e) => setEditedAuthor((prev) => ({ ...prev, website: e.target.value }))}
              />
            </div>
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={updateAuthor}>Save</button>
            <button className="btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
