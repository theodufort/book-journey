import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedAuthor, setEditedAuthor] = useState({ name: "", email: "" });
  const supabase = createClientComponentClient();
  const pageSize = 10;

  useEffect(() => {
    fetchAuthors();
  }, [currentPage]);

  async function fetchAuthors() {
    const { data, error, count } = await supabase
      .from("indie_authors")
      .select("author_id, name", { count: "exact" })
      .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

    if (error) {
      console.error("Error fetching authors:", error);
    } else {
      const authorsWithEmail = await Promise.all(
        data.map(async (author) => {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", author.author_id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return { ...author, email: "N/A" };
          }

          return { ...author, email: profileData.email };
        })
      );

      setAuthors(authorsWithEmail);
      setTotalPages(Math.ceil(count / pageSize));
    }
  }

  function handleAuthorClick(author: any) {
    setSelectedAuthor(author);
    setIsModalOpen(true);
  }

  function handleEditAuthor() {
    setEditedAuthor({ name: selectedAuthor.name, email: selectedAuthor.email });
    setIsEditModalOpen(true);
  }

  async function updateAuthor() {
    const { error: authorError } = await supabase
      .from("indie_authors")
      .update({ name: editedAuthor.name })
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authors.map((author) => (
              <TableRow
                key={author.author_id}
                onClick={() => handleAuthorClick(author)}
                className="cursor-pointer"
              >
                <TableCell>{author.name}</TableCell>
                <TableCell>{author.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between mt-4">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
      <Dialog isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
        <h3 className="font-bold text-lg">{selectedAuthor?.name}</h3>
        <div className="py-4">
          <p>Email: {selectedAuthor?.email}</p>
        </div>
        <div className="modal-action">
          <Button onClick={handleEditAuthor}>Edit</Button>
          <Button onClick={() => setIsModalOpen(false)}>Close</Button>
        </div>
      </Dialog>
      <Dialog isModalOpen={isEditModalOpen} setIsModalOpen={setIsEditModalOpen}>
        <h3 className="font-bold text-lg">Edit Author</h3>
        <div className="py-4">
          <Input
            label="Name"
            value={editedAuthor.name}
            onChange={(e: any) =>
              setEditedAuthor((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <Input
            label="Email"
            value={editedAuthor.email}
            onChange={(e: any) =>
              setEditedAuthor((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>
        <div className="modal-action">
          <Button onClick={updateAuthor}>Save</Button>
          <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
        </div>
      </Dialog>
    </div>
  );
}
