import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/routes/AppRoutes';
import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { SplashScreen } from './components/layout/SplashScreen';
import { useSplashStore } from './store/splash.store';
import { ScrollToTop } from './components/layout/ScrollToTop';

export default function App() {
  const { showSplash, setShowSplash } = useSplashStore();

  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}

