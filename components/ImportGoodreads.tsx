// components/ImportGoodreads.tsx

import { Database } from "@/types/supabase";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";

const ImportGoodreads: React.FC = () => {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [failedRecords, setFailedRecords] = useState<any[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, [supabase]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setImporting(true);
    setMessage("");
    setFailedRecords([]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);

    try {
      const response = await fetch("/api/import/goodreads", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        if (result.failedRecords && result.failedRecords.length > 0) {
          setFailedRecords(result.failedRecords);
        }
      } else {
        setMessage(result.error || "Error importing data. Please try again.");
      }
    } catch (error) {
      setMessage("Error importing data. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4">
      <input
        className="file-input w-full max-w-xs"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />
      <button
        className="btn btn-primary mt-2"
        onClick={handleImport}
        disabled={!file || importing}
      >
        {importing ? "Importing..." : "Import Goodreads Data"}
      </button>
      {message && (
        <div className="alert alert-info shadow-lg mt-4">
          <div>
            <span>{message}</span>
          </div>
        </div>
      )}
      {failedRecords.length > 0 && (
        <div className="alert alert-warning shadow-lg mt-4">
          <div>
            <span>
              The following rows couldn't be imported:
              <ul className="list-disc pl-5">
                {failedRecords.map((record, index) => (
                  <li key={index}>
                    {record.Title} by {record.Author} (ISBN13: {record.ISBN13})
                  </li>
                ))}
              </ul>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportGoodreads;
