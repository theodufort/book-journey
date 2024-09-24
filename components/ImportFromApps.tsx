// components/ImportFromApps.tsx

import { Database } from "@/types/supabase";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";

const ImportFromApps: React.FC = () => {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [failedRecords, setFailedRecords] = useState<any[]>([]);
  const [importType, setImportType] = useState<"goodreads" | "storygraph">(
    "goodreads"
  );

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
    formData.append("importType", importType);

    try {
      const response = await fetch("/api/import/unified", {
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
    <div className="py-4 inline-block">
      <h2 className="text-2xl md:text-3xl font-extrabold py-2">Import Data</h2>
      {importType == "storygraph" ? (
        <div>
          <div className="py-2">
            <h4 className="text-lg md:text-xl font-extrabold">
              How to access my data?
            </h4>
            <ul className="list-decimal list-inside">
              <li>Log In to your Storygraph account.</li>
              <li>
                Go to the{" "}
                <a
                  href="https://app.thestorygraph.com/user-export"
                  target="_blank"
                >
                  export page
                </a>
              </li>
              <li>Click "Generate Export" button.</li>
              <li>Wait for the file to be ready and click on Download.</li>
            </ul>
          </div>
          <div className="py-2">
            <h4 className="text-lg md:text-xl font-extrabold">
              What will be imported?
            </h4>
            <ul className="list-disc list-inside">
              <li>All books from your profile.</li>
              <li>All bookshelves with their associated books in them.</li>
              <li>The text review and rating for each book. (if any)</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <div className="py-2">
            <h4 className="text-lg md:text-xl font-extrabold">
              How to access my data?
            </h4>
            <ul className="list-decimal list-inside">
              <li>Log In to your Goodreads account.</li>
              <li>
                Go to the{" "}
                <a
                  href="https://www.goodreads.com/review/import"
                  target="_blank"
                >
                  export page
                </a>
              </li>
              <li>Click "Export Library" at the top of the page.</li>
              <li>Wait for the file to be ready and click on the link.</li>
            </ul>
          </div>
          <div className="py-2">
            <h4 className="text-lg md:text-xl font-extrabold">
              What will be imported?
            </h4>
            <ul className="list-disc list-inside">
              <li>All books from your profile.</li>
              <li>All bookshelves with their associated books in them.</li>
              <li>The text review and rating for each book. (if any)</li>
            </ul>
          </div>
        </div>
      )}
      <select
        className="select select-bordered w-full max-w-xs mb-2 inline-block"
        value={importType}
        onChange={(e) =>
          setImportType(e.target.value as "goodreads" | "storygraph")
        }
      >
        <option value="goodreads">Goodreads</option>
        <option value="storygraph">StoryGraph</option>
      </select>
      <input
        className="file-input w-full max-w-xs flex"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />
      <button
        className="btn btn-primary mt-2"
        onClick={handleImport}
        disabled={!file || importing}
      >
        {importing
          ? "Importing..."
          : `Import ${
              importType === "goodreads" ? "Goodreads" : "StoryGraph"
            } Data`}
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
                    {record.Title} by {record.Authors || record.Author} (ISBN:{" "}
                    {record["ISBN/UID"] || record.ISBN13})
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

export default ImportFromApps;
