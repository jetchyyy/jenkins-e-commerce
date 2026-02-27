import { Route, Routes } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { PageShell } from '../../components/layout/PageShell';
import { AdminShell } from '../../components/layout/AdminShell';
import { Home } from '../../pages/public/Home';
import { BookList } from '../../pages/public/BookList';
import { BookDetails } from '../../pages/public/BookDetails';
import { Login } from '../../pages/public/Login';
import { Register } from '../../pages/public/Register';
import { Author } from '../../pages/public/Author';
import { CartPage } from '../../pages/public/CartPage';
import { ProtectedRoute } from './ProtectedRoute';
import { Library } from '../../pages/customer/Library';
import { Reader } from '../../pages/customer/Reader';
import { Orders } from '../../pages/customer/Orders';
import { AdminLogin } from '../../pages/admin/AdminLogin';
import { AdminDashboard } from '../../pages/admin/AdminDashboard';
import { AdminBooks } from '../../pages/admin/AdminBooks';
import { AdminBookForm } from '../../pages/admin/AdminBookForm';
import { AdminOrders } from '../../pages/admin/AdminOrders';
import { AdminLatestDrops } from '../../pages/admin/AdminLatestDrops';
import { AdminAnalytics } from '../../pages/admin/AdminAnalytics';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Admin login — standalone page at /admin, no shell ── */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* ── Admin section — AdminShell (own sidebar + layout) ── */}
      <Route element={<AdminShell />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/books" element={<AdminBooks />} />
        <Route path="/admin/books/new" element={<AdminBookForm />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/latest-drops" element={<AdminLatestDrops />} />
      </Route>

      {/* ── Public section — PageShell (public Navbar + Footer) ── */}
      <Route element={<PublicShellOutlet />}>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<BookList />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/author" element={<Author />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/library" element={<Library />} />
          <Route path="/reader/:bookId" element={<Reader />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
      </Route>
    </Routes>
  );
};

// Thin wrapper so PageShell can be used as a layout route
const PublicShellOutlet = () => (
  <PageShell>
    <Outlet />
  </PageShell>
);

