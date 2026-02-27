import { KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { libraryApi } from '../../api/library.api';
import { authStore } from '../../store/auth.store';
import { ActionModal } from '../../components/feedback/ActionModal';
import { getFriendlyErrorMessage } from '../../lib/feedback';

export const Reader = () => {
  const { bookId = '' } = useParams();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const user = authStore((state) => state.user);
  const watermark = useMemo(() => {
    const stamp = new Date().toLocaleString();
    return `${user?.email ?? 'customer'} | ${stamp}`;
  }, [user?.email]);

  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  const generate = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      if (url) {
        URL.revokeObjectURL(url);
      }

      const blob = await libraryApi.streamPdf(bookId);
      const blobUrl = URL.createObjectURL(blob);
      setUrl(blobUrl);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Book Opened',
        message: 'Your protected PDF is now loaded in the reader.'
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Reader Error',
        message: getFriendlyErrorMessage(err, 'Unable to open this book right now.')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onReaderKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'p')) {
      e.preventDefault();
    }
  };

  return (
    <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm" onContextMenu={(e) => e.preventDefault()} onKeyDown={onReaderKeyDown}>
      <h1 className="text-2xl font-bold">Secure Reader Access</h1>
      <p className="text-sm text-slate-600">
        Owned books are streamed through authenticated access. Sharing direct file links is blocked.
      </p>
      <button onClick={generate} className="rounded bg-brand-700 px-4 py-2 text-white" disabled={isLoading}>
        {isLoading ? 'Loading PDF...' : 'Open Book'}
      </button>
      {url && (
        <div className="relative min-h-[70vh] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          <iframe title="PDF Reader" src={url} className="h-[70vh] w-full" />
          <div className="pointer-events-none absolute inset-0 select-none opacity-20">
            <div className="grid h-full w-full grid-cols-2 gap-16 p-8 text-xs font-semibold text-slate-700">
              {Array.from({ length: 16 }).map((_, index) => (
                <span key={index} className="rotate-[-24deg] whitespace-nowrap">
                  {watermark}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      <ActionModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={() => setModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </section>
  );
};
