import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth.api';

export const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-semibold text-brand-700">
          InkVault
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/books">Books</Link>
          {user && <Link to="/library">Library</Link>}
          {user && <Link to="/orders">Orders</Link>}
          {user?.role === 'superadmin' && <Link to="/admin">Admin</Link>}
          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <button className="rounded bg-brand-700 px-3 py-1 text-white" onClick={() => void authApi.logout()}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
