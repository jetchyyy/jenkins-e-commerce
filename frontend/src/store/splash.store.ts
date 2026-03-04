import { create } from 'zustand';

interface SplashState {
    showSplash: boolean;
    setShowSplash: (show: boolean) => void;
}

export const useSplashStore = create<SplashState>((set) => ({
    showSplash: true, // Default to true on initial load
    setShowSplash: (show) => set({ showSplash: show }),
}));
