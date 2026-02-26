import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await authApi.login(email, password);
      navigate('/books');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Login</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email" className="w-full rounded border px-3 py-2" />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        required
        placeholder="Password"
        className="w-full rounded border px-3 py-2"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="w-full rounded bg-brand-700 py-2 text-white">Sign in</button>
    </form>
  );
};
