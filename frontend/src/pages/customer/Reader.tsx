import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { libraryApi } from '../../api/library.api';

export const Reader = () => {
  const { bookId = '' } = useParams();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const generate = async () => {
    setError('');
    try {
      const data = await libraryApi.download(bookId);
      setUrl(data.signed_url);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Secure Reader Access</h1>
      <p className="text-sm text-slate-600">Generate a short-lived signed link. Ownership is verified server-side.</p>
      <button onClick={generate} className="rounded bg-brand-700 px-4 py-2 text-white">
        Generate Download Link
      </button>
      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="block text-sm">
          Open secure file link
        </a>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
};
