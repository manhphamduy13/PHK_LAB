import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function Login() {
  const [email, setEmail] = useState('student@phk.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.user, data.token);

      if (data.user.role === 'STUDENT') {
        navigate('/student');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-4">
            PHK
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Đăng nhập</h1>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Learn. Explore. Experiment.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-b-4 border-slate-200">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-medium text-sm border-2 border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-4">Tài khoản demo:</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                <span className="font-bold">Student:</span> student@phk.edu / password123
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                <span className="font-bold">Teacher:</span> khe.pham@phk.edu / password123
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                <span className="font-bold">Admin:</span> admin@phk.edu / password123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
