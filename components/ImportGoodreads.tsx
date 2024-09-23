import React, { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';

const ImportGoodreads: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const user = useUser();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setImporting(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id);

    try {
      const response = await fetch('/api/import/goodreads', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage('Error importing data. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleImport} disabled={!file || importing}>
        {importing ? 'Importing...' : 'Import Goodreads Data'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ImportGoodreads;
