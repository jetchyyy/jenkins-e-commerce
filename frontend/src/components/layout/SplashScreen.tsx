import { useEffect, useState } from 'react';

/* ══════════════════════════════════════════════════════
   SplashScreen — Religious Minimalist
   Clean white canvas with a cross, verse, and name.
   ══════════════════════════════════════════════════════ */
export const SplashScreen = ({ onDone }: { onDone: () => void }) => {
    const [visible, setVisible] = useState(true);
    const [contentVisible, setContentVisible] = useState(false);

    useEffect(() => {
        // Stagger content in
        const showContent = setTimeout(() => setContentVisible(true), 200);
        // Begin fade-out
        const fadeOut = setTimeout(() => setVisible(false), 2800);
        // Unmount
        const done = setTimeout(() => onDone(), 3500);

        return () => {
            clearTimeout(showContent);
            clearTimeout(fadeOut);
            clearTimeout(done);
        };
    }, [onDone]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#faf9f7] transition-opacity duration-700 ease-in-out ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            {/* Thin decorative top & bottom rules */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-px bg-[#c8b99a]/60" />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-px bg-[#c8b99a]/60" />

            {/* Content block */}
            <div
                className={`flex flex-col items-center gap-8 transition-all duration-1000 ease-out ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
            >
                {/* Cross — thin, elegant SVG */}
                <div className="flex flex-col items-center">
                    <svg
                        width="40"
                        height="60"
                        viewBox="0 0 40 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#3b2f2f]"
                    >
                        {/* Vertical beam */}
                        <rect x="18" y="0" width="4" height="60" rx="2" fill="currentColor" opacity="0.85" />
                        {/* Horizontal beam */}
                        <rect x="0" y="16" width="40" height="4" rx="2" fill="currentColor" opacity="0.85" />
                    </svg>
                </div>

                {/* Name */}
                <div className="flex flex-col items-center gap-2">
                    <h1
                        className="font-heading text-3xl md:text-4xl font-bold tracking-[0.15em] text-[#2c2416] uppercase"
                    >
                        David Jenkins
                    </h1>
                    {/* Thin divider */}
                    <div className="w-16 h-px bg-[#c8b99a] rounded-full" />
                </div>

                {/* Scripture verse */}
                <p className="text-[#8c7a62] text-xs tracking-[0.15em] uppercase font-medium text-center max-w-[18rem]">
                    "I am the way, the truth, and the life"
                    <br />
                    <span className="opacity-60 text-[10px] tracking-widest">John 14:6</span>
                </p>
            </div>
        </div>
    );
};

