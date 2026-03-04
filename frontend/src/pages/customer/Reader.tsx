import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { useParams } from 'react-router-dom';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { libraryApi } from '../../api/library.api';
import { authStore } from '../../store/auth.store';
import { ActionModal } from '../../components/feedback/ActionModal';
import { getFriendlyErrorMessage } from '../../lib/feedback';

type ReaderTheme = 'paper' | 'sepia' | 'night';

type ReaderState = {
  lastPage: number;
  bookmarks: number[];
  zoom: number;
  theme: ReaderTheme;
};

type EpubTocItem = {
  label: string;
  href: string;
};

type EpubNote = {
  id: string;
  cfi: string;
  note: string;
};

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const SWIPE_THRESHOLD = 70;
const IOS_MAX_DPR = 1.5;
const ANDROID_MAX_DPR = 1.8;
const EPUB_MIN_FONT = 80;
const EPUB_MAX_FONT = 180;

const flattenToc = (items: any[] = [], depth = 0): EpubTocItem[] => {
  const out: EpubTocItem[] = [];
  for (const item of items) {
    if (!item) continue;
    const label = `${'  '.repeat(depth)}${item.label ?? 'Untitled'}`;
    const href = item.href ?? '';
    if (href) {
      out.push({ label, href });
    }
    if (Array.isArray(item.subitems) && item.subitems.length > 0) {
      out.push(...flattenToc(item.subitems, depth + 1));
    }
  }
  return out;
};

GlobalWorkerOptions.workerSrc = pdfWorker;

export const Reader = () => {
  const { bookId = '' } = useParams();
  const [bookFormat, setBookFormat] = useState<'pdf' | 'epub' | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [isEpubReady, setIsEpubReady] = useState(false);
  const [epubLocation, setEpubLocation] = useState('');
  const [epubBookmarksCfi, setEpubBookmarksCfi] = useState<string[]>([]);
  const [epubToc, setEpubToc] = useState<EpubTocItem[]>([]);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [epubFontSize, setEpubFontSize] = useState(100);
  const [epubNotes, setEpubNotes] = useState<EpubNote[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [theme, setTheme] = useState<ReaderTheme>('paper');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isObscured, setIsObscured] = useState(false);
  const [viewerWidth, setViewerWidth] = useState(0);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [showHud, setShowHud] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const [progressReady, setProgressReady] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const containerRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const epubContainerRef = useRef<HTMLDivElement | null>(null);
  const epubBookRef = useRef<any>(null);
  const epubRenditionRef = useRef<any>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const suppressClickTapRef = useRef(false);
  const renderTaskRef = useRef<{ cancel: () => void; promise: Promise<unknown> } | null>(null);
  const progressSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const user = authStore((state) => state.user);
  const storageKey = useMemo(() => `reader:${user?.id ?? 'guest'}:${bookId}`, [bookId, user?.id]);
  const epubNotesKey = useMemo(() => `${storageKey}:epub_notes`, [storageKey]);
  const epubFontKey = useMemo(() => `${storageKey}:epub_font_size`, [storageKey]);
  const { isIOS, isAndroid } = useMemo(() => {
    if (typeof navigator === 'undefined') {
      return { isIOS: false, isAndroid: false };
    }

    const ua = navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) || (ua.includes('macintosh') && 'ontouchend' in document);
    const android = ua.includes('android');
    return { isIOS: iOS, isAndroid: android };
  }, []);

  const watermark = useMemo(() => {
    const stamp = new Date().toLocaleString();
    return `${user?.email ?? 'customer'} | ${stamp}`;
  }, [user?.email]);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (pageCount > 0) {
      setProgress(Math.floor((currentPage / pageCount) * 100));
    }
  }, [currentPage, pageCount]);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const canInteractiveReader = useMemo(
    () => (bookFormat === 'pdf' && !!pdfDoc) || (bookFormat === 'epub' && isEpubReady),
    [bookFormat, isEpubReady, pdfDoc]
  );

  useEffect(() => {
    if (bookFormat !== 'epub') {
      return;
    }

    const rendition = epubRenditionRef.current;
    if (!rendition) {
      return;
    }

    rendition.themes.fontSize(`${epubFontSize}%`);
    localStorage.setItem(epubFontKey, String(epubFontSize));
  }, [bookFormat, epubFontKey, epubFontSize]);

  useEffect(() => {
    if (bookFormat !== 'epub') {
      return;
    }
    localStorage.setItem(epubNotesKey, JSON.stringify(epubNotes));
  }, [bookFormat, epubNotes, epubNotesKey]);

  useEffect(() => {
    const onVisibility = () => setIsObscured(document.hidden);
    const onBlur = () => setIsObscured(true);
    const onFocus = () => setIsObscured(document.hidden);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ?? (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement;
      setIsFullscreen(Boolean(fullscreenElement));
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange as EventListener);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (!viewerRef.current) {
        return;
      }

      const width = Math.max(280, Math.floor(viewerRef.current.clientWidth - 16));
      setViewerWidth(width);
    };

    updateWidth();
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateWidth());
      if (viewerRef.current) {
        resizeObserver.observe(viewerRef.current);
      }
    }

    window.addEventListener('resize', updateWidth);
    window.addEventListener('orientationchange', updateWidth);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateWidth);
      window.removeEventListener('orientationchange', updateWidth);
    };
  }, []);

  const themeClasses = useMemo(() => {
    if (theme === 'night') {
      return 'bg-slate-900 text-slate-100';
    }
    if (theme === 'sepia') {
      return 'bg-amber-50 text-amber-900';
    }
    return 'bg-slate-100 text-slate-900';
  }, [theme]);

  const renderPage = useCallback(async () => {
    if (bookFormat !== 'pdf' || !pdfDoc || !canvasRef.current || !viewerWidth) {
      return;
    }

    setIsRendering(true);

    try {
      const page = await pdfDoc.getPage(currentPage);
      const baseViewport = page.getViewport({ scale: 1 });
      const fitScale = viewerWidth / baseViewport.width;
      const scale = Math.max(0.4, fitScale * zoom);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        return;
      }

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const maxRatio = isIOS ? IOS_MAX_DPR : isAndroid ? ANDROID_MAX_DPR : 2;
      const ratio = Math.min(window.devicePixelRatio || 1, maxRatio);
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const renderTask = page.render({ canvasContext: context, viewport, canvas });
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      if (renderTaskRef.current === renderTask) {
        renderTaskRef.current = null;
      }
    } catch (error) {
      const isCancelled = typeof error === 'object' && error !== null && 'name' in error && (error as { name?: string }).name === 'RenderingCancelledException';
      if (!isCancelled) {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Render Error',
          message: 'Page rendering failed. Please try reloading the book. It may be corrupt or encrypted.'
        });
      }
    } finally {
      setIsRendering(false);
    }
  }, [bookFormat, currentPage, isAndroid, isIOS, pdfDoc, viewerWidth, zoom]);

  useEffect(() => {
    void renderPage();
  }, [renderPage]);

  const openBook = async () => {
    if (isLoading) {
      return;
    }

    setProgressReady(false);
    setIsEpubReady(false);
    setIsLoading(true);
    try {
      const [{ book }, { progress }] = await Promise.all([
        libraryApi.meta(bookId),
        libraryApi.getProgress(bookId).catch(() => ({ progress: null as null }))
      ]);
      setBookFormat(book.format);

      const blob = await libraryApi.streamPdf(bookId);

      if (book.format === 'epub') {
        setPdfDoc(null);

        if (epubRenditionRef.current) {
          epubRenditionRef.current.destroy?.();
          epubRenditionRef.current = null;
        }
        if (epubBookRef.current) {
          epubBookRef.current.destroy?.();
          epubBookRef.current = null;
        }

        const epubModule = await import('epubjs');
        const ePub = (epubModule as any).default ?? (epubModule as any);
        const arrayBuffer = await blob.arrayBuffer();
        const epubBook = ePub(arrayBuffer);
        const rendition = epubBook.renderTo(epubContainerRef.current, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          spread: 'none'
        });

        const safeZoom = Math.max(MIN_ZOOM, Math.min(progress?.zoom ?? 1, MAX_ZOOM));
        setZoom(safeZoom);
        setTheme((progress?.theme as ReaderTheme | undefined) ?? 'paper');
        setBookmarks((progress?.bookmarks ?? []).filter((page) => Number.isInteger(page) && page >= 1));
        setEpubBookmarksCfi(progress?.bookmarks_cfi ?? []);
        setEpubLocation(progress?.last_location ?? '');
        const savedFontRaw = localStorage.getItem(epubFontKey);
        const savedFont = savedFontRaw ? Number(savedFontRaw) : 100;
        setEpubFontSize(Number.isFinite(savedFont) ? Math.max(EPUB_MIN_FONT, Math.min(savedFont, EPUB_MAX_FONT)) : 100);
        const savedNotesRaw = localStorage.getItem(epubNotesKey);
        const savedNotes = savedNotesRaw ? (JSON.parse(savedNotesRaw) as EpubNote[]) : [];
        setEpubNotes(Array.isArray(savedNotes) ? savedNotes.filter((n) => n?.cfi && n?.note) : []);
        setEpubToc(flattenToc(epubBook.navigation?.toc ?? []));
        setIsTocOpen(false);

        rendition.on('relocated', (location: any) => {
          const idx = (location?.start?.index ?? 0) + 1;
          const cfi = location?.start?.cfi ?? '';
          setCurrentPage(Math.max(1, idx));
          setEpubLocation(cfi);
        });

        rendition.on('rendered', () => {
          for (const note of savedNotes) {
            rendition.annotations?.highlight(note.cfi, {}, () => { }, note.id, 'epub-note');
          }
        });

        const totalSpine = Math.max(1, epubBook.spine?.spineItems?.length ?? 1);
        setPageCount(totalSpine);
        epubBookRef.current = epubBook;
        epubRenditionRef.current = rendition;

        const initialTarget = progress?.last_location || undefined;
        await rendition.display(initialTarget);

        setIsReadingMode(true);
        setShowHud(false);
        setIsEpubReady(true);
        setProgressReady(true);
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Book Opened',
          message: 'EPUB reader is ready with resume and bookmark support.'
        });
        return;
      }

      if (epubRenditionRef.current) {
        epubRenditionRef.current.destroy?.();
        epubRenditionRef.current = null;
      }
      if (epubBookRef.current) {
        epubBookRef.current.destroy?.();
        epubBookRef.current = null;
      }
      setIsEpubReady(false);
      setEpubToc([]);
      setEpubNotes([]);
      setIsTocOpen(false);

      const arrayBuffer = await blob.arrayBuffer();
      const loadOptions = {
        data: arrayBuffer,
        disableWorker: isIOS,
        isEvalSupported: false,
        useSystemFonts: true
      };

      let loadedPdf: PDFDocumentProxy;
      try {
        loadedPdf = await getDocument(loadOptions as any).promise;
      } catch {
        try {
          // iOS Safari/WebView can fail with worker mode on some devices, try without
          loadedPdf = await getDocument({ ...loadOptions, disableWorker: true } as any).promise;
        } catch {
          throw new Error('PDF engine load failed. The file may be corrupt or encrypted.');
        }
      }

      setPdfDoc(loadedPdf);
      setPageCount(loadedPdf.numPages);

      const remoteProgressResult = await libraryApi.getProgress(bookId).catch(() => ({ progress: null as null }));
      const remoteProgress = remoteProgressResult.progress;

      const rawState = localStorage.getItem(storageKey);
      const fallbackState: ReaderState = {
        lastPage: 1,
        bookmarks: [],
        zoom: 1,
        theme: 'paper'
      };
      const localState = rawState ? ({ ...fallbackState, ...JSON.parse(rawState) } as ReaderState) : fallbackState;
      const remoteState = progress
        ? ({
          lastPage: progress.last_page,
          bookmarks: progress.bookmarks ?? [],
          zoom: progress.zoom,
          theme: progress.theme
        } as ReaderState)
        : null;
      const savedState = remoteState ? { ...fallbackState, ...remoteState } : localState;

      const safePage = Math.max(1, Math.min(savedState.lastPage, loadedPdf.numPages));
      setCurrentPage(safePage);
      setBookmarks((savedState.bookmarks ?? []).filter((page) => page >= 1 && page <= loadedPdf.numPages));
      setZoom(Math.max(MIN_ZOOM, Math.min(savedState.zoom, MAX_ZOOM)));
      setTheme(savedState.theme);
      setProgressReady(true);

      setModal({
        isOpen: true,
        type: 'success',
        title: 'Book Opened',
        message: 'Mobile reader mode is active with bookmarks, swipe, tap navigation, and fullscreen.'
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

  useEffect(() => {
    if (!pdfDoc) {
      return;
    }

    const state: ReaderState = {
      lastPage: currentPage,
      bookmarks,
      zoom,
      theme
    };

    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [bookmarks, currentPage, pdfDoc, storageKey, theme, zoom]);

  useEffect(() => {
    if (!progressReady) {
      return;
    }

    if (progressSaveTimerRef.current) {
      clearTimeout(progressSaveTimerRef.current);
    }

    progressSaveTimerRef.current = setTimeout(() => {
      if (bookFormat === 'epub' && epubRenditionRef.current) {
        void libraryApi.saveProgress(bookId, {
          last_page: currentPage || 1,
          total_pages: pageCount || 1,
          bookmarks,
          last_location: epubLocation || undefined,
          bookmarks_cfi: epubBookmarksCfi,
          zoom,
          theme,
          renderer: 'native'
        });
        return;
      }

      if (bookFormat === 'pdf' && pdfDoc) {
        void libraryApi.saveProgress(bookId, {
          last_page: currentPage,
          total_pages: pageCount || 1,
          bookmarks,
          zoom,
          theme,
          renderer: 'canvas'
        });
      }
    }, 800);

    return () => {
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current);
      }
    };
  }, [bookFormat, bookId, bookmarks, currentPage, epubBookmarksCfi, epubLocation, pageCount, pdfDoc, progressReady, theme, zoom]);

  useEffect(() => {
    return () => {
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current);
      }

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      if (pdfDoc) {
        void pdfDoc.destroy();
      }

      if (epubRenditionRef.current) {
        epubRenditionRef.current.destroy?.();
        epubRenditionRef.current = null;
      }
      if (epubBookRef.current) {
        epubBookRef.current.destroy?.();
        epubBookRef.current = null;
      }
    };
  }, [pdfDoc]);

  const handlePageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= (pageCount || 1)) {
      goToPage(page);
    } else {
      setPageInput(currentPage.toString()); // Reset to current page if invalid
    }
  };

  const goToPage = (page: number) => {
    if (bookFormat === 'epub') {
      const rendition = epubRenditionRef.current;
      const book = epubBookRef.current;
      if (!rendition || !book) return;
      const index = Math.max(0, Math.min(page - 1, (book.spine?.spineItems?.length ?? 1) - 1));
      const target = book.spine?.spineItems?.[index];
      if (target?.href) {
        void rendition.display(target.href);
      }
      return;
    }

    if (pdfDoc) {
      const nextPage = Math.max(1, Math.min(page, pdfDoc.numPages));
      setCurrentPage(nextPage);
    }
  };

  const goToEpubHref = (href: string) => {
    if (!href || bookFormat !== 'epub' || !epubRenditionRef.current) {
      return;
    }
    void epubRenditionRef.current.display(href);
    setIsTocOpen(false);
  };

  const goPrev = () => {
    if (bookFormat === 'epub' && epubRenditionRef.current) {
      void epubRenditionRef.current.prev();
      return;
    }
    goToPage(currentPage - 1);
  };

  const goNext = () => {
    if (bookFormat === 'epub' && epubRenditionRef.current) {
      void epubRenditionRef.current.next();
      return;
    }
    goToPage(currentPage + 1);
  };

  const addEpubNote = () => {
    if (bookFormat !== 'epub' || !epubLocation || !epubRenditionRef.current) {
      return;
    }
    const text = window.prompt('Add note for this location:');
    if (!text || !text.trim()) {
      return;
    }
    const note: EpubNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      cfi: epubLocation,
      note: text.trim()
    };
    setEpubNotes((prev) => [note, ...prev]);
    epubRenditionRef.current.annotations?.highlight(note.cfi, {}, () => { }, note.id, 'epub-note');
  };

  const removeEpubNote = (note: EpubNote) => {
    setEpubNotes((prev) => prev.filter((item) => item.id !== note.id));
    epubRenditionRef.current?.annotations?.remove(note.cfi, 'epub-note');
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const docWithWebkit = document as Document & {
      webkitExitFullscreen?: () => Promise<void>;
    };
    const elWithWebkit = container as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };

    try {
      // iOS Safari commonly blocks true fullscreen; use immersive fallback.
      if (isIOS) {
        setIsPseudoFullscreen((prev) => {
          if (!prev) {
            setIsReadingMode(true);
            setShowHud(false);
          }
          return !prev;
        });
        return;
      }

      if (document.fullscreenElement || (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (docWithWebkit.webkitExitFullscreen) {
          await docWithWebkit.webkitExitFullscreen();
        }
        return;
      }

      setIsReadingMode(true);
      setShowHud(false);

      if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if (elWithWebkit.webkitRequestFullscreen) {
        await elWithWebkit.webkitRequestFullscreen();
      }
    } catch {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Fullscreen Unavailable',
        message: 'Your browser blocked fullscreen mode on this device.'
      });
    }
  };

  const handleReadingModeTap = (x: number, width: number) => {
    if (!isReadingMode || !canInteractiveReader || width <= 0) {
      return;
    }

    const ratio = x / width;

    if (ratio < 0.35) {
      goPrev();
      return;
    }

    if (ratio > 0.65) {
      goNext();
      return;
    }

    setShowHud((prev) => !prev);
  };

  const toggleBookmark = () => {
    if (bookFormat === 'epub') {
      const cfi = epubLocation;
      if (!cfi) {
        return;
      }
      setEpubBookmarksCfi((prev) => {
        if (prev.includes(cfi)) {
          return prev.filter((entry) => entry !== cfi);
        }
        return [...prev, cfi];
      });
      setBookmarks((prev) => {
        if (prev.includes(currentPage)) {
          return prev.filter((entry) => entry !== currentPage);
        }
        return [...prev, currentPage].sort((a, b) => a - b);
      });
      return;
    }

    setBookmarks((prev) => {
      if (prev.includes(currentPage)) {
        return prev.filter((entry) => entry !== currentPage);
      }
      return [...prev, currentPage].sort((a, b) => a - b);
    });
  };

  const isBookmarked = bookFormat === 'epub' ? epubBookmarksCfi.includes(epubLocation) : bookmarks.includes(currentPage);

  const blockShortcut = (e: ReactKeyboardEvent<HTMLElement>) => {
    const key = e.key.toLowerCase();

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
      return;
    }

    if (e.key === 'b') {
      e.preventDefault();
      toggleBookmark();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      void toggleFullscreen();
      return;
    }

    if (e.key === 'PrintScreen' || ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u', 'o'].includes(key))) {
      e.preventDefault();
      setIsObscured(true);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Action Blocked',
        message: 'Saving, printing, and source shortcuts are disabled in secure reader mode.'
      });
    }
  };

  const onTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (!canInteractiveReader) {
      return;
    }

    const startX = touchStartXRef.current;
    const endX = e.changedTouches[0]?.clientX;

    touchStartXRef.current = null;

    if (startX === null || endX === undefined) {
      return;
    }

    const deltaX = endX - startX;

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      suppressClickTapRef.current = true;

      if (deltaX < 0) {
        goNext();
        return;
      }

      goPrev();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    handleReadingModeTap(endX - rect.left, rect.width);
  };

  const onViewerClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (suppressClickTapRef.current) {
      suppressClickTapRef.current = false;
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    handleReadingModeTap(e.clientX - rect.left, rect.width);
  };

  const toggleReadingMode = () => {
    setIsReadingMode((prev) => {
      const next = !prev;
      setShowHud(true);
      return next;
    });
  };

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className={`relative mx-auto flex w-full max-w-6xl flex-col rounded-2xl bg-white shadow-sm md:p-4 ${isPseudoFullscreen ? 'fixed inset-0 z-[100] h-screen overflow-hidden rounded-none p-0' : 'min-h-[85vh] border border-[#d1e4ff]'
        }`}
      tabIndex={0}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onKeyDown={blockShortcut}
    >
      {(!isReadingMode || showHud) && (
        <div className="flex flex-col gap-4 p-4 md:p-6 border-b border-[#d1e4ff] bg-slate-50/50 rounded-t-2xl">
          <div>
            <h1 className="font-heading text-2xl font-bold text-[#1e3a8a] md:text-3xl">Secure Reader</h1>
            <p className="mt-1 text-xs text-slate-500 md:text-sm">
              Reading mode enabled: tap left for previous, right for next, center for menu.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-[#d1e4ff] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-[#1e3a8a]">
              <form onSubmit={handlePageSubmit} className="flex items-center gap-1.5 focus-within:text-[#2563eb]">
                <span>Page</span>
                <input
                  type="number"
                  min={1}
                  max={pageCount || 1}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={() => setPageInput(currentPage.toString())}
                  className="w-12 h-6 rounded border border-[#d1e4ff] px-1 text-center font-bold text-[#1e3a8a] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors"
                />
                <span>of {pageCount || '-'}</span>
              </form>
              <span>{progress}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
              <div className="absolute left-0 top-0 h-full bg-[#1e3a8a] transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <button
                onClick={openBook}
                className="col-span-2 sm:col-span-1 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[#163080] transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : canInteractiveReader ? 'Reload Book' : 'Open Book'}
              </button>

              <div className="flex rounded-lg border border-[#d1e4ff] bg-slate-50 p-1">
                <button
                  className="rounded-md px-3 py-1.5 text-sm font-semibold text-[#1e3a8a] hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
                  disabled={!canInteractiveReader || currentPage <= 1}
                  onClick={goPrev}
                >
                  Prev
                </button>
                <div className="w-[1px] bg-[#d1e4ff] my-1 mx-1" />
                <button
                  className="rounded-md px-3 py-1.5 text-sm font-semibold text-[#1e3a8a] hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
                  disabled={!canInteractiveReader || (pageCount > 0 && currentPage >= pageCount)}
                  onClick={goNext}
                >
                  Next
                </button>
              </div>

              <button
                className={`rounded-lg border border-[#d1e4ff] px-4 py-2 text-sm font-semibold transition-colors ${isBookmarked ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-[#1e3a8a] hover:bg-slate-50'
                  }`}
                disabled={!canInteractiveReader}
                onClick={toggleBookmark}
              >
                {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
              </button>

              <div className="flex rounded-lg border border-[#d1e4ff] bg-slate-50 p-1">
                <button className="rounded-md px-3 py-1.5 text-sm font-semibold text-[#1e3a8a] hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all" disabled={!canInteractiveReader || bookFormat === 'epub'} onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}>
                  A-
                </button>
                <div className="w-[1px] bg-[#d1e4ff] my-1 mx-1" />
                <button className="rounded-md px-3 py-1.5 text-sm font-semibold text-[#1e3a8a] hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all" disabled={!canInteractiveReader || bookFormat === 'epub'} onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}>
                  A+
                </button>
              </div>

              {bookFormat === 'epub' && (
                <>
                  <div className="flex rounded-lg border border-[#d1e4ff] bg-slate-50 p-1">
                    <button className="rounded-md px-3 py-1.5 text-sm font-semibold text-[#1e3a8a] hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all" disabled={!canInteractiveReader} onClick={() => setEpubFontSize((v) => Math.max(EPUB_MIN_FONT, v - 10))}>
                      T-
                    </button>
                    <div className="w-[1px] bg-[#d1e4ff] my-1 mx-1" />
                    <button className="rounded-md px-3 py-1.5 text-sm font-semibold text-[#1e3a8a] hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all" disabled={!canInteractiveReader} onClick={() => setEpubFontSize((v) => Math.min(EPUB_MAX_FONT, v + 10))}>
                      T+
                    </button>
                  </div>
                  <button className="rounded-lg border border-[#d1e4ff] bg-white px-4 py-2 text-sm font-semibold text-[#1e3a8a] hover:bg-slate-50 disabled:opacity-50 transition-all" disabled={!canInteractiveReader} onClick={() => setIsTocOpen((v) => !v)}>
                    TOC
                  </button>
                  <button className="rounded-lg border border-[#d1e4ff] bg-white px-4 py-2 text-sm font-semibold text-[#1e3a8a] hover:bg-slate-50 disabled:opacity-50 transition-all" disabled={!canInteractiveReader} onClick={addEpubNote}>
                    Add Note
                  </button>
                </>
              )}

              <select
                className="rounded-lg border border-[#d1e4ff] bg-white px-3 py-2 text-sm font-semibold text-[#1e3a8a] focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:opacity-50"
                disabled={!canInteractiveReader}
                value={theme}
                onChange={(e) => setTheme(e.target.value as ReaderTheme)}
              >
                <option value="paper">Paper Theme</option>
                <option value="sepia">Sepia Theme</option>
                <option value="night">Night Theme</option>
              </select>

              <button className="rounded-lg border border-[#d1e4ff] bg-white px-4 py-2 text-sm font-semibold text-[#1e3a8a] hover:bg-slate-50 transition-all" onClick={toggleReadingMode}>
                {isReadingMode ? 'Exit Reading Mode' : 'Reading Mode'}
              </button>

              <button className="rounded-lg border border-[#d1e4ff] bg-white px-4 py-2 text-sm font-semibold text-[#1e3a8a] hover:bg-slate-50 transition-all" onClick={() => void toggleFullscreen()}>
                {isFullscreen || isPseudoFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {(!isReadingMode || showHud) && bookmarks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#d1e4ff] bg-slate-50/50 p-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest md:text-sm">Bookmarks:</span>
          {bookmarks.map((page) => (
            <button key={page} className="rounded-md bg-white border border-[#d1e4ff] px-3 py-1 text-xs font-semibold text-[#1e3a8a] shadow-sm hover:bg-slate-50 transition-colors" onClick={() => goToPage(page)}>
              Page {page}
            </button>
          ))}
        </div>
      )}

      {(!isReadingMode || showHud) && bookFormat === 'epub' && isTocOpen && (
        <div className="border-b border-[#d1e4ff] bg-white p-4">
          <p className="text-sm font-bold text-[#1e3a8a] mb-2 uppercase tracking-wide">Table of Contents</p>
          <div className="max-h-52 overflow-auto space-y-1 rounded-lg border border-slate-100 p-2">
            {epubToc.map((item, idx) => (
              <button
                key={`${item.href}-${idx}`}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] transition-colors"
                onClick={() => goToEpubHref(item.href)}
              >
                {item.label}
              </button>
            ))}
            {epubToc.length === 0 && <p className="text-xs text-slate-500 italic px-2">No TOC available.</p>}
          </div>
        </div>
      )}

      {(!isReadingMode || showHud) && bookFormat === 'epub' && epubNotes.length > 0 && (
        <div className="border-b border-[#d1e4ff] bg-white p-4">
          <p className="text-sm font-bold text-[#1e3a8a] mb-2 uppercase tracking-wide">My Notes</p>
          <div className="max-h-52 space-y-3 overflow-auto pr-2">
            {epubNotes.map((note) => (
              <div key={note.id} className="rounded-xl border border-[#d1e4ff] bg-slate-50/50 p-4 shadow-sm">
                <p className="mb-3 text-sm text-slate-700 leading-relaxed font-medium">{note.note}</p>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-white border border-[#d1e4ff] px-3 py-1.5 text-xs font-bold text-[#1e3a8a] shadow-sm hover:bg-slate-50 transition-colors" onClick={() => goToEpubHref(note.cfi)}>
                    Jump to Note
                  </button>
                  <button className="rounded-lg bg-white border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 shadow-sm hover:bg-red-50 transition-colors" onClick={() => removeEpubNote(note)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        ref={viewerRef}
        className={`relative flex-1 w-full overflow-auto p-4 md:p-8 transition-colors duration-300 ${theme === 'night' ? 'bg-slate-900 text-slate-100' :
          theme === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636]' :
            'bg-slate-100 text-slate-900'
          }`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={onViewerClick}
      >
        {!pdfDoc && bookFormat !== 'epub' && (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-60 mt-12">
            <svg className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253" />
            </svg>
            <p className="text-lg font-medium">Open your purchased book to start reading.</p>
          </div>
        )}

        {pdfDoc && (
          <div className="relative mx-auto w-fit">
            <canvas ref={canvasRef} className="mx-auto rounded shadow-2xl transition-transform duration-200" />

            <div className="pointer-events-none absolute inset-0 select-none opacity-[0.03]">
              <div className="grid h-full w-full grid-cols-2 gap-8 p-4 text-[10px] font-black md:gap-16 md:p-8 md:text-sm">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span key={index} className="rotate-[-24deg] whitespace-nowrap overflow-hidden">
                    {watermark}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {bookFormat === 'epub' && (
          <div className="relative mx-auto h-[80vh] w-full max-w-4xl overflow-hidden rounded-xl shadow-lg bg-white ring-1 ring-slate-900/5">
            <div ref={epubContainerRef} className="h-full w-full" />
            <div className="pointer-events-none absolute inset-0 select-none opacity-[0.03]">
              <div className="grid h-full w-full grid-cols-2 gap-8 p-4 text-[10px] font-black md:gap-16 md:p-8 md:text-sm">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span key={index} className="rotate-[-24deg] whitespace-nowrap overflow-hidden">
                    {watermark}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {isReadingMode && canInteractiveReader && (
          <div className="pointer-events-none absolute inset-0 z-[5] flex text-[10px] uppercase tracking-wider font-bold text-slate-400 opacity-60 md:text-xs">
            <div className="flex w-[35%] items-end justify-start p-4">Tap / Swipe for Prev</div>
            <div className="flex w-[30%] items-end justify-center p-4">Tap for Menu</div>
            <div className="flex w-[35%] items-end justify-end p-4">Tap / Swipe for Next</div>
          </div>
        )}

        {(isRendering || isLoading) && (
          <div className="absolute right-4 top-4 rounded-lg bg-[#1e3a8a] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur animate-pulse">
            Processing...
          </div>
        )}

        {isObscured && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90 p-6 text-center shadow-inner backdrop-blur-sm">
            <div className="max-w-md space-y-4">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm font-medium leading-relaxed text-slate-200">
                Screen hidden for secure mode. Return to the tab/window to continue reading.
              </p>
            </div>
          </div>
        )}
      </div>

      <ActionModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={() => {
          setModal((prev) => ({ ...prev, isOpen: false }));
          if (isObscured && document.hasFocus() && !document.hidden) {
            setIsObscured(false);
          }
        }}
      />
    </section>
  );
};












