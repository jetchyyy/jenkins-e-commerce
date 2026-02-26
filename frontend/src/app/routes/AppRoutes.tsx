import { Route, Routes } from 'react-router-dom';
import { Home } from '../../pages/public/Home';
import { BookList } from '../../pages/public/BookList';
import { BookDetails } from '../../pages/public/BookDetails';
import { Login } from '../../pages/public/Login';
import { Register } from '../../pages/public/Register';
import { ProtectedRoute } from './ProtectedRoute';
import { Library } from '../../pages/customer/Library';
import { Reader } from '../../pages/customer/Reader';
import { Orders } from '../../pages/customer/Orders';
import { AdminRoute } from './AdminRoute';
import { AdminDashboard } from '../../pages/admin/AdminDashboard';
import { AdminBooks } from '../../pages/admin/AdminBooks';
import { AdminBookForm } from '../../pages/admin/AdminBookForm';
import { AdminOrders } from '../../pages/admin/AdminOrders';
import { AdminAnalytics } from '../../pages/admin/AdminAnalytics';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/books" element={<BookList />} />
      <Route path="/books/:id" element={<BookDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/library" element={<Library />} />
        <Route path="/reader/:bookId" element={<Reader />} />
        <Route path="/orders" element={<Orders />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/books" element={<AdminBooks />} />
        <Route path="/admin/books/new" element={<AdminBookForm />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
  );
};
