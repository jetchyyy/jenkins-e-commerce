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

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const SWIPE_THRESHOLD = 70;
const IOS_MAX_DPR = 1.5;
const ANDROID_MAX_DPR = 1.8;

GlobalWorkerOptions.workerSrc = pdfWorker;

export const Reader = () => {
  const { bookId = '' } = useParams();
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
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
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const containerRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const suppressClickTapRef = useRef(false);
  const renderTaskRef = useRef<{ cancel: () => void; promise: Promise<unknown> } | null>(null);
  const user = authStore((state) => state.user);
  const storageKey = useMemo(() => `reader:${user?.id ?? 'guest'}:${bookId}`, [bookId, user?.id]);
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
    const resizeObserver = new ResizeObserver(() => updateWidth());
    if (viewerRef.current) {
      resizeObserver.observe(viewerRef.current);
    }

    window.addEventListener('resize', updateWidth);
    window.addEventListener('orientationchange', updateWidth);

    return () => {
      resizeObserver.disconnect();
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
    if (!pdfDoc || !canvasRef.current || !viewerWidth) {
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
          message: 'Page rendering failed. Please try reloading the book.'
        });
      }
    } finally {
      setIsRendering(false);
    }
  }, [currentPage, isAndroid, isIOS, pdfDoc, viewerWidth, zoom]);

  useEffect(() => {
    void renderPage();
  }, [renderPage]);

  const openBook = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const blob = await libraryApi.streamPdf(bookId);
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
        // iOS Safari/WebView can fail with worker mode on some devices
        loadedPdf = await getDocument({ ...loadOptions, disableWorker: true } as any).promise;
      }

      setPdfDoc(loadedPdf);
      setPageCount(loadedPdf.numPages);

      const rawState = localStorage.getItem(storageKey);
      const fallbackState: ReaderState = {
        lastPage: 1,
        bookmarks: [],
        zoom: 1,
        theme: 'paper'
      };
      const savedState = rawState ? ({ ...fallbackState, ...JSON.parse(rawState) } as ReaderState) : fallbackState;

      const safePage = Math.max(1, Math.min(savedState.lastPage, loadedPdf.numPages));
      setCurrentPage(safePage);
      setBookmarks((savedState.bookmarks ?? []).filter((page) => page >= 1 && page <= loadedPdf.numPages));
      setZoom(Math.max(MIN_ZOOM, Math.min(savedState.zoom, MAX_ZOOM)));
      setTheme(savedState.theme);

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
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      if (pdfDoc) {
        void pdfDoc.destroy();
      }
    };
  }, [pdfDoc]);

  const goToPage = (page: number) => {
    if (!pdfDoc) {
      return;
    }

    const nextPage = Math.max(1, Math.min(page, pdfDoc.numPages));
    setCurrentPage(nextPage);
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
    if (!isReadingMode || !pdfDoc || width <= 0) {
      return;
    }

    const ratio = x / width;

    if (ratio < 0.35) {
      goToPage(currentPage - 1);
      return;
    }

    if (ratio > 0.65) {
      goToPage(currentPage + 1);
      return;
    }

    setShowHud((prev) => !prev);
  };

  const toggleBookmark = () => {
    setBookmarks((prev) => {
      if (prev.includes(currentPage)) {
        return prev.filter((entry) => entry !== currentPage);
      }
      return [...prev, currentPage].sort((a, b) => a - b);
    });
  };

  const isBookmarked = bookmarks.includes(currentPage);

  const blockShortcut = (e: ReactKeyboardEvent<HTMLElement>) => {
    const key = e.key.toLowerCase();

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToPage(currentPage + 1);
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPage(currentPage - 1);
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
    if (!pdfDoc) {
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
        goToPage(currentPage + 1);
        return;
      }

      goToPage(currentPage - 1);
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
      className="space-y-3 rounded-xl bg-white p-3 shadow-sm md:space-y-4 md:p-6"
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
              {isLoading ? 'Loading PDF...' : pdfDoc ? 'Reload Book' : 'Open Book'}
            </button>

            <button
              className="rounded border px-3 py-2.5 text-sm"
              disabled={!pdfDoc || currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Prev
            </button>
            <button
              className="rounded border px-3 py-2.5 text-sm"
              disabled={!pdfDoc || (pageCount > 0 && currentPage >= pageCount)}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </button>
            <button className="rounded border px-3 py-2.5 text-sm" disabled={!pdfDoc} onClick={toggleBookmark}>
              {isBookmarked ? 'Unbookmark' : 'Bookmark'}
            </button>

            <button className="rounded border px-3 py-2.5 text-sm" disabled={!pdfDoc} onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}>
              A-
            </button>
            <button className="rounded border px-3 py-2.5 text-sm" disabled={!pdfDoc} onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}>
              A+
            </button>

            <select
              className="rounded border px-3 py-2.5 text-sm"
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
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
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

      <div
        ref={viewerRef}
        className={`relative min-h-[65vh] overflow-auto rounded-lg border border-slate-200 p-2 md:min-h-[70vh] md:p-4 ${themeClasses}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={onViewerClick}
      >
        {!pdfDoc && <p className="text-sm">Open your purchased book to start reading.</p>}

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

        {isReadingMode && pdfDoc && (
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







