import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useBook, useCreateBook, useUpdateBook } from '../../hooks/useBooks';
import { adminApi } from '../../api/admin.api';
import { ActionModal } from '../../components/feedback/ActionModal';
import { getFriendlyErrorMessage } from '../../lib/feedback';

export const AdminBookForm = () => {
  const { id = '' } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { data: existingBookData, isLoading: isLoadingBook } = useBook(id);
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [hasExistingCover, setHasExistingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    price_cents: 0,
    currency: 'USD',
    cover_url: '',
    format: 'pdf',
    is_active: true
  });

  useEffect(() => {
    if (!isEditMode || !existingBookData?.book) {
      return;
    }

    const book = existingBookData.book;
    setForm({
      title: book.title ?? '',
      author: book.author ?? '',
      description: book.description ?? '',
      price_cents: book.price_cents ?? 0,
      currency: book.currency ?? 'USD',
      cover_url: '',
      format: book.format ?? 'pdf',
      is_active: book.is_active !== false
    });
    setHasExistingCover(Boolean(book.cover_url));
  }, [existingBookData?.book, isEditMode]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!coverFile && !hasExistingCover) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Cover Required',
        message: 'Please upload a cover image before saving.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const targetBookId = isEditMode
        ? id
        : ((await createBook.mutateAsync({ ...form, cover_url: '' })) as { book?: { id?: string } })?.book?.id ?? '';

      if (!targetBookId) {
        throw new Error('Book save failed. Missing book ID.');
      }

      if (isEditMode) {
        await updateBook.mutateAsync({
          id: targetBookId,
          payload: form
        });
      }

      if (coverFile) {
        const optimizedCover = await optimizeCoverImage(coverFile);
        await adminApi.uploadBookCover(targetBookId, optimizedCover);
      }

      if (bookFile) {
        const fileBase64 = await toBase64(bookFile);
        await adminApi.uploadBookFile(targetBookId, {
          file_base64: fileBase64,
          file_name: bookFile.name,
          format: form.format as 'pdf' | 'epub'
        });
      }

      setModal({
        isOpen: true,
        type: 'success',
        title: isEditMode ? 'Book Updated' : 'Book Saved',
        message: isEditMode ? 'The book has been updated successfully.' : 'The book has been created successfully.'
      });
    } catch (error) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Save Failed',
        message: getFriendlyErrorMessage(error, 'Unable to save this book right now.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#1e3a8a]">{isEditMode ? 'Edit Book' : 'Add New Book'}</h1>
          <p className="text-sm text-slate-500 mt-1">{isEditMode ? 'Update your digital product details' : 'Enter complete details for your digital product'}</p>
        </div>
        <Link to="/admin/books" className="text-sm font-semibold text-[#1e3a8a] hover:text-[#2563eb] transition-colors">
          &larr; Back to Inventory
        </Link>
      </div>

      <form onSubmit={submit} className="space-y-6 rounded-2xl border border-[#d1e4ff] bg-white p-8 shadow-lg">
        {isEditMode && isLoadingBook && <p className="text-sm text-slate-500">Loading book details...</p>}
        {/* Title */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#1e3a8a] block">Book Title</label>
          <input
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
            placeholder="e.g. For The Powers of Heaven Shall Be Shaken"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Author */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#1e3a8a] block">Author Name</label>
          <input
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
            placeholder="e.g. David Jenkins"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#1e3a8a] block">Description</label>
          <textarea
            required
            rows={5}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all resize-y"
            placeholder="A detailed summary of the book..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Price & Format */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#1e3a8a] block">Price (in cents)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                required
                className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
                type="number"
                min="0"
                placeholder="0"
                value={form.price_cents}
                onChange={(e) => setForm({ ...form, price_cents: Number(e.target.value) })}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Example: For $19.99, enter 1999.</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#1e3a8a] block">File Format</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all appearance-none"
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
            >
              <option value="pdf">PDF Document (.pdf)</option>
              <option value="epub">EPUB File (.epub)</option>
            </select>
          </div>
        </div>

        {/* Cover Upload */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#1e3a8a] block">Cover Image Upload</label>
          <input
            required={!hasExistingCover}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-slate-500 mt-1">Auto-optimized to WebP before upload to reduce storage size.</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#1e3a8a] block">Upload Book File ({form.format.toUpperCase()})</label>
          <input
            type="file"
            accept={form.format === 'pdf' ? '.pdf,application/pdf' : '.epub,application/epub+zip'}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 file:mr-4 file:rounded-full file:border-0 file:bg-[#1e3a8a] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            onChange={(e) => setBookFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-slate-500 mt-1">Optional now, but required for customers to read after purchase.</p>
        </div>

        {/* Submit */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
          <Link to="/admin/books" className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            Cancel
          </Link>
          <button
            className="w-full sm:w-auto rounded-full bg-[#1e3a8a] px-8 py-3 text-sm font-bold tracking-wide text-white hover:bg-[#2563eb] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Book' : 'Save Book'}
          </button>
        </div>
      </form>
      <ActionModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.type === 'success' ? 'Back to Books' : 'Close'}
        onConfirm={() => {
          const wasSuccess = modal.type === 'success';
          setModal((prev) => ({ ...prev, isOpen: false }));
          if (wasSuccess) {
            navigate('/admin/books');
          }
        }}
      />
    </section>
  );
};

const optimizeCoverImage = async (file: File) => {
  const image = await fileToImage(file);
  const MAX_WIDTH = 900;
  const MAX_HEIGHT = 1350;
  const scale = Math.min(1, MAX_WIDTH / image.width, MAX_HEIGHT / image.height);
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Image optimization is not supported in this browser.');
  }

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  const optimizedBlob = await canvasToBlob(canvas, 'image/webp', 0.8);
  const base64 = await blobToBase64(optimizedBlob);

  return {
    file_base64: base64,
    file_name: `${stripExtension(file.name)}.webp`,
    content_type: 'image/webp' as const
  };
};

const stripExtension = (name: string) => name.replace(/\.[^/.]+$/, '');

const fileToImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load selected image'));
    };
    image.src = objectUrl;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to optimize cover image'));
        return;
      }
      resolve(blob);
    }, type, quality);
  });

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Invalid image upload data'));
        return;
      }

      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Invalid image upload data'));
        return;
      }

      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read optimized image'));
    reader.readAsDataURL(blob);
  });

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Invalid file upload data'));
        return;
      }

      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Invalid file upload data'));
        return;
      }

      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
