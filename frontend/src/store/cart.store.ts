import { create } from 'zustand';

type CartState = {
  bookIds: string[];
  add: (bookId: string) => void;
  remove: (bookId: string) => void;
  clear: () => void;
};

export const cartStore = create<CartState>((set) => ({
  bookIds: [],
  add: (bookId) =>
    set((state) => ({
      bookIds: state.bookIds.includes(bookId) ? state.bookIds : [...state.bookIds, bookId]
    })),
  remove: (bookId) => set((state) => ({ bookIds: state.bookIds.filter((id) => id !== bookId) })),
  clear: () => set({ bookIds: [] })
}));

