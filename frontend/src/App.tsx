import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/routes/AppRoutes';
import { PageShell } from './components/layout/PageShell';
import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider } from './app/providers/AuthProvider';

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <PageShell>
            <AppRoutes />
          </PageShell>
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}
