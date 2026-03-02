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
  const [nativePdfUrl, setNativePdfUrl] = useState('');
  const [useNativeRenderer, setUseNativeRenderer] = useState(false);
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

  const progress = useMemo(() => {
    if (!pageCount) {
      return 0;
    }
    return Math.round((currentPage / pageCount) * 100);
  }, [currentPage, pageCount]);

  const canInteractiveReader = useMemo(
    () => !useNativeRenderer && ((bookFormat === 'pdf' && !!pdfDoc) || (bookFormat === 'epub' && isEpubReady)),
    [bookFormat, isEpubReady, pdfDoc, useNativeRenderer]
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
    if (bookFormat !== 'pdf' || useNativeRenderer || !pdfDoc || !canvasRef.current || !viewerWidth) {
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
        if (isIOS && nativePdfUrl && !useNativeRenderer) {
          setUseNativeRenderer(true);
          setIsReadingMode(false);
          setShowHud(true);
          setModal({
            isOpen: true,
            type: 'error',
            title: 'iOS Compatibility Mode',
            message: 'Switched to iOS native PDF mode because canvas rendering failed on this device.'
          });
          return;
        }
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Render Error',
          message: 'Page rendering failed. Please try reloading the book.'
        });
      }
    } finally {
      setIsRendering(false);
    }
  }, [bookFormat, currentPage, isAndroid, isIOS, nativePdfUrl, pdfDoc, useNativeRenderer, viewerWidth, zoom]);

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
      const blobUrl = URL.createObjectURL(blob);

      if (nativePdfUrl) {
        URL.revokeObjectURL(nativePdfUrl);
      }
      setNativePdfUrl(blobUrl);

      if (book.format === 'epub') {
        setUseNativeRenderer(false);
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
            rendition.annotations?.highlight(note.cfi, {}, () => {}, note.id, 'epub-note');
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

      // iOS Safari/WebView is significantly more reliable with native PDF rendering.
      if (isIOS) {
        setUseNativeRenderer(true);
        setPdfDoc(null);
        setPageCount(0);
        setCurrentPage(1);
        setIsReadingMode(false);
        setShowHud(true);
        setProgressReady(true);
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Book Opened',
          message: 'Opened in iOS compatibility mode for stable rendering.'
        });
        return;
      }

      setUseNativeRenderer(false);

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
          // iOS Safari/WebView can fail with worker mode on some devices
          loadedPdf = await getDocument({ ...loadOptions, disableWorker: true } as any).promise;
        } catch {
          if (!isIOS) {
            throw new Error('PDF load failed');
          }

          // Final fallback for iOS only: native PDF viewer
          setNativePdfUrl(blobUrl);
          setUseNativeRenderer(true);
          setPdfDoc(null);
          setPageCount(0);
          setCurrentPage(1);
          setIsReadingMode(false);
          setShowHud(true);
          setModal({
            isOpen: true,
            type: 'success',
            title: 'Book Opened',
            message: 'Using iOS compatibility fallback. Tap-based reader mode is unavailable for this file.'
          });
          return;
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

      if (bookFormat === 'pdf' && pdfDoc && !useNativeRenderer) {
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
  }, [bookFormat, bookId, bookmarks, currentPage, epubBookmarksCfi, epubLocation, pageCount, pdfDoc, progressReady, theme, useNativeRenderer, zoom]);

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

  useEffect(() => {
    return () => {
      if (nativePdfUrl) {
        URL.revokeObjectURL(nativePdfUrl);
      }
    };
  }, [nativePdfUrl]);

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
    epubRenditionRef.current.annotations?.highlight(note.cfi, {}, () => {}, note.id, 'epub-note');
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
        setIsPseudoFullscreen((prev) => !prev);
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
    if (useNativeRenderer) {
      return;
    }
    if (suppressClickTapRef.current) {
      suppressClickTapRef.current = false;
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    handleReadingModeTap(e.clientX - rect.left, rect.width);
  };

  const toggleReadingMode = () => {
    if (useNativeRenderer) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Reading Mode Unavailable',
        message: 'Tap zones are not available in iOS native PDF mode.'
      });
      return;
    }

    setIsReadingMode((prev) => {
      const next = !prev;
      setShowHud(true);
      return next;
    });
  };

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className={`space-y-3 rounded-xl bg-white p-3 shadow-sm md:space-y-4 md:p-6 ${
        isPseudoFullscreen ? 'fixed inset-0 z-[100] overflow-auto rounded-none p-2 md:p-4' : ''
      }`}
      tabIndex={0}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onKeyDown={blockShortcut}
    >
      {(!isReadingMode || showHud) && (
        <>
          <h1 className="text-xl font-bold md:text-2xl">Secure Reader</h1>
          <p className="text-xs text-slate-600 md:text-sm">
            True reading mode enabled: tap left for previous page, tap right for next page, tap center to toggle controls.
          </p>
        </>
      )}

      {(!isReadingMode || showHud) && (
        <div className="sticky top-2 z-20 rounded-lg border border-slate-200 bg-white/95 p-2 backdrop-blur">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {pageCount ? currentPage : '-'} / {pageCount || '-'}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded bg-slate-200">
            <div className="h-full bg-brand-700 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <button onClick={openBook} className="col-span-3 rounded bg-brand-700 px-4 py-2.5 text-sm text-white sm:col-span-1" disabled={isLoading}>
              {isLoading ? 'Loading Book...' : canInteractiveReader ? 'Reload Book' : 'Open Book'}
            </button>

            <button
              className="rounded border px-3 py-2.5 text-sm"
              disabled={!canInteractiveReader || currentPage <= 1}
              onClick={goPrev}
            >
              Prev
            </button>
            <button
              className="rounded border px-3 py-2.5 text-sm"
              disabled={!canInteractiveReader || (pageCount > 0 && currentPage >= pageCount)}
              onClick={goNext}
            >
              Next
            </button>
            <button className="rounded border px-3 py-2.5 text-sm" disabled={!canInteractiveReader} onClick={toggleBookmark}>
              {isBookmarked ? 'Unbookmark' : 'Bookmark'}
            </button>

            <button className="rounded border px-3 py-2.5 text-sm" disabled={!canInteractiveReader || bookFormat === 'epub'} onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}>
              A-
            </button>
            <button className="rounded border px-3 py-2.5 text-sm" disabled={!canInteractiveReader || bookFormat === 'epub'} onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}>
              A+
            </button>
            {bookFormat === 'epub' && (
              <>
                <button className="rounded border px-3 py-2.5 text-sm" disabled={!canInteractiveReader} onClick={() => setEpubFontSize((v) => Math.max(EPUB_MIN_FONT, v - 10))}>
                  Font-
                </button>
                <button className="rounded border px-3 py-2.5 text-sm" disabled={!canInteractiveReader} onClick={() => setEpubFontSize((v) => Math.min(EPUB_MAX_FONT, v + 10))}>
                  Font+
                </button>
                <button className="rounded border px-3 py-2.5 text-sm" disabled={!canInteractiveReader} onClick={() => setIsTocOpen((v) => !v)}>
                  TOC
                </button>
                <button className="rounded border px-3 py-2.5 text-sm" disabled={!canInteractiveReader} onClick={addEpubNote}>
                  Add Note
                </button>
              </>
            )}

            <select
              className="rounded border px-3 py-2.5 text-sm"
              disabled={!canInteractiveReader}
              value={theme}
              onChange={(e) => setTheme(e.target.value as ReaderTheme)}
            >
              <option value="paper">Paper</option>
              <option value="sepia">Sepia</option>
              <option value="night">Night</option>
            </select>

            <button className="rounded border px-3 py-2.5 text-sm" onClick={toggleReadingMode}>
              {isReadingMode ? 'Exit Reading Mode' : 'Reading Mode'}
            </button>

            <button className="rounded border px-3 py-2.5 text-sm" onClick={() => void toggleFullscreen()}>
              {isFullscreen || isPseudoFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </div>
      )}

      {(!isReadingMode || showHud) && bookmarks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-slate-50 p-3">
          <span className="text-xs font-medium text-slate-600 md:text-sm">Bookmarks:</span>
          {bookmarks.map((page) => (
            <button key={page} className="rounded bg-white px-2 py-1 text-xs ring-1 ring-slate-200" onClick={() => goToPage(page)}>
              P{page}
            </button>
          ))}
        </div>
      )}

      {(!isReadingMode || showHud) && bookFormat === 'epub' && isTocOpen && (
        <div className="space-y-2 rounded border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold">Table of Contents</p>
          <div className="max-h-52 overflow-auto space-y-1">
            {epubToc.map((item, idx) => (
              <button
                key={`${item.href}-${idx}`}
                className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-slate-100"
                onClick={() => goToEpubHref(item.href)}
              >
                {item.label}
              </button>
            ))}
            {epubToc.length === 0 && <p className="text-xs text-slate-500">No TOC available.</p>}
          </div>
        </div>
      )}

      {(!isReadingMode || showHud) && bookFormat === 'epub' && epubNotes.length > 0 && (
        <div className="space-y-2 rounded border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold">Notes</p>
          <div className="max-h-52 space-y-2 overflow-auto">
            {epubNotes.map((note) => (
              <div key={note.id} className="rounded border border-slate-200 p-2 text-xs">
                <p className="mb-2 text-slate-700">{note.note}</p>
                <div className="flex gap-2">
                  <button className="rounded border px-2 py-1" onClick={() => goToEpubHref(note.cfi)}>
                    Go To
                  </button>
                  <button className="rounded border px-2 py-1" onClick={() => removeEpubNote(note)}>
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
        className={`relative min-h-[65vh] overflow-auto rounded-lg border border-slate-200 p-2 md:min-h-[70vh] md:p-4 ${themeClasses}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={onViewerClick}
      >
        {!pdfDoc && !nativePdfUrl && <p className="text-sm">Open your purchased book to start reading.</p>}

        {pdfDoc && (
          <div className="relative mx-auto w-fit">
            <canvas ref={canvasRef} className="mx-auto rounded shadow-xl" />

            <div className="pointer-events-none absolute inset-0 select-none opacity-20">
              <div className="grid h-full w-full grid-cols-2 gap-8 p-4 text-[10px] font-semibold text-slate-700 md:gap-16 md:p-8 md:text-xs">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span key={index} className="rotate-[-24deg] whitespace-nowrap">
                    {watermark}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {bookFormat === 'epub' && !useNativeRenderer && (
          <div className="relative mx-auto h-[78vh] w-full max-w-4xl overflow-hidden rounded border border-slate-300 bg-white">
            <div ref={epubContainerRef} className="h-full w-full" />
            <div className="pointer-events-none absolute inset-0 select-none opacity-15">
              <div className="grid h-full w-full grid-cols-2 gap-8 p-4 text-[10px] font-semibold text-slate-700 md:gap-16 md:p-8 md:text-xs">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span key={index} className="rotate-[-24deg] whitespace-nowrap">
                    {watermark}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {nativePdfUrl && (
          <div className="space-y-2">
            <p className="text-xs text-slate-600">iOS compatibility mode is active. Reader controls are limited on this device.</p>
            <button
              type="button"
              className="rounded border px-3 py-2 text-xs"
              onClick={() => window.open(nativePdfUrl, '_blank', 'noopener,noreferrer')}
            >
              Open In New Tab
            </button>
            <iframe title="iOS PDF Reader" src={nativePdfUrl} className="h-[78vh] w-full rounded border border-slate-300 bg-white" />
          </div>
        )}

        {isReadingMode && canInteractiveReader && (
          <div className="pointer-events-none absolute inset-0 z-[5] flex text-[10px] uppercase tracking-wide text-white/70 md:text-xs">
            <div className="flex w-[35%] items-end justify-start p-2">Tap for Prev</div>
            <div className="flex w-[30%] items-end justify-center p-2">Tap for Menu</div>
            <div className="flex w-[35%] items-end justify-end p-2">Tap for Next</div>
          </div>
        )}

        {(isRendering || isLoading) && (
          <div className="absolute right-3 top-3 rounded bg-slate-900/80 px-2 py-1 text-xs text-white">Rendering...</div>
        )}

        {isObscured && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/85 p-6 text-center text-sm font-medium text-white">
            Screen hidden for secure mode. Return to the tab/window to continue reading.
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












