import { useEffect, useRef } from 'react';

/**
 * Scroll-reveal hook.
 * Adds the 'visible' class to any .animate-on-scroll elements within the
 * returned ref container when they enter the viewport.
 */
export function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );
        const elements = ref.current?.querySelectorAll('.animate-on-scroll');
        elements?.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
    return ref;
}

