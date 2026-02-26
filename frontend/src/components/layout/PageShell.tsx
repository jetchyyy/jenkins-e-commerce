import { ReactNode } from 'react';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export const PageShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
};
