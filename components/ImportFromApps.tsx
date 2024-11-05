// components/ImportFromApps.tsx

import { Database } from "@/types/supabase";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

const ImportFromApps: React.FC = () => {
  const t = useTranslations("ImportData");
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [failedRecords, setFailedRecords] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
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

      const data = await response.json();
      setResult(data);

      if (!response.ok) {
        setMessage(
          data.message ||
            data.error ||
            "Error importing data. Please try again."
        );
        if (data.failedRecords && data.failedRecords.length > 0) {
          setFailedRecords(data.failedRecords);
        }
      } else {
        setMessage(data.message);
        if (data.failedRecords && data.failedRecords.length > 0) {
          setFailedRecords(data.failedRecords);
        }
      }
    } catch (error) {
      setMessage("Error importing data. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="py-4 inline-block">
      <h2 className="text-2xl md:text-3xl font-extrabold py-2">{t("title")}</h2>
      {importType == "storygraph" ? (
        <div>
          <div className="py-2">
            <h4 className="text-lg md:text-xl font-extrabold">{t("how")}</h4>
            <ul className="list-decimal list-inside">
              <li>{t("storygraph_li1")}</li>
              <li>
                {t("storygraph_li2")}
                <a
                  href="https://app.thestorygraph.com/user-export"
                  target="_blank"
                >
                  {" "}
                  Storygraph
                </a>
              </li>
              <li>{t("storygraph_li3")}</li>
              <li>{t("storygraph_li4")}</li>
            </ul>
          </div>
          <div className="py-2">
            <h4 className="text-lg md:text-xl font-extrabold">
              {t("whatimport")}
            </h4>
            <ul className="list-disc list-inside">
              <li>{t("importinfo_li1")}</li>
              <li>{t("importinfo_li2")}</li>
              <li>{t("importinfo_li3")}</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <div className="py-2">
            <h4 className="text-lg md:text-xl font-extrabold">{t("how")}</h4>
            <ul className="list-decimal list-inside">
              <li>{t("goodreads_li1")}</li>
              <li>
                {t("goodreads_li2")}{" "}
                <a
                  href="https://www.goodreads.com/review/import"
                  target="_blank"
                >
                  Goodreads
                </a>
              </li>
              <li>{t("goodreads_li3")}</li>
              <li>{t("goodreads_li4")}</li>
            </ul>
          </div>
          <div className="py-2">
            <h4 className="text-lg md:text-xl font-extrabold">
              {t("whatimport")}
            </h4>
            <ul className="list-disc list-inside">
              <li>{t("importinfo_li1")}</li>
              <li>{t("importinfo_li2")}</li>
              <li>{t("importinfo_li3")}</li>
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
          ? t("import_message")
          : `${t("import_from")} ${
              importType === "goodreads" ? "Goodreads" : "StoryGraph"
            }`}
      </button>
      {message && (
        <div className="alert alert-info shadow-lg mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>{message}</span>
        </div>
      )}
      {(failedRecords.length > 0 || result?.missingIsbnRecords?.length > 0) && (
        <>
          {failedRecords.length > 0 && (
            <div className="alert alert-error shadow-lg mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <span>{t("import_error")}</span>
                <ul className="list-disc pl-5">
                  {failedRecords.map((record, index) => (
                    <li key={index}>
                      {record.title || record.Title} by{" "}
                      {record.author || record.Authors || record.Author}
                      {record["ISBN/UID"] || record.ISBN13
                        ? ` (ISBN: ${record["ISBN/UID"] || record.ISBN13})`
                        : ` (${record.reason || "Unknown error"})`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {result?.missingIsbnRecords?.length > 0 && (
            <div className="alert alert-error shadow-lg mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <span>{t("missing_isbn_error")}</span>
                <ul className="list-disc pl-5">
                  {result.missingIsbnRecords.map((record: any, index: any) => (
                    <li key={index}>
                      {record.title} by {record.author}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImportFromApps;
