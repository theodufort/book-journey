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
  const [editedAuthor, setEditedAuthor] = useState({ name: "", email: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isApprovedFilter, setIsApprovedFilter] = useState<boolean | null>(
    null
  );
  const supabase = createClientComponentClient();
  const pageSize = 10;

  useEffect(() => {
    fetchAuthors();
  }, [currentPage, searchTerm, isApprovedFilter]);

  async function fetchAuthors() {
    let query = supabase
      .from("indie_authors")
      .select("author_id, name, is_approved, profiles(email)", {
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
      name: selectedAuthor.name,
      email: selectedAuthor.email,
      is_approved: selectedAuthor.is_approved,
    });
    setIsEditModalOpen(true);
  }

  async function updateAuthor() {
    const { error: authorError } = await supabase
      .from("indie_authors")
      .update({
        name: editedAuthor.name,
        is_approved: editedAuthor.is_approved,
      })
      .eq("author_id", selectedAuthor.author_id);

    if (authorError) {
      console.error("Error updating author:", authorError);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ email: editedAuthor.email })
      .eq("id", selectedAuthor.author_id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return;
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
      <dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAuthor?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Email: {selectedAuthor?.email}</p>
          </div>
          <DialogFooter>
            <button onClick={handleEditAuthor}>Edit</button>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </DialogFooter>
        </DialogContent>
      </dialog>
      <dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Author</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="name" className="text-md">
                Name
              </Label>
              <Input
                className="text-md"
                type="text"
                id="name"
                value={editedAuthor.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditedAuthor((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={editedAuthor.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditedAuthor((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_approved"
                checked={editedAuthor.is_approved}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditedAuthor((prev) => ({
                    ...prev,
                    is_approved: e.target.checked,
                  }))
                }
              />
              <Label htmlFor="is_approved">Approved</Label>
            </div>
          </div>
          <DialogFooter>
            <button onClick={updateAuthor}>Save</button>
            <button
              className="btn btn-primary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
