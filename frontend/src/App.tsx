import { useState, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/routes/AppRoutes';
import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { SplashScreen } from './components/layout/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);

  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          {showSplash && <SplashScreen onDone={hideSplash} />}
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}

