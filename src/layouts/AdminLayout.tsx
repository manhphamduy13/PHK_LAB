import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  Target,
  LogOut,
  FlaskConical,
  FolderOpen,
  HelpCircle,
  List,
  User,
  Sparkles
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: BookOpen, label: 'Khóa học', path: '/admin/courses' },
    { icon: Target, label: 'Bài tập', path: '/admin/exercises' },
    { icon: HelpCircle, label: 'Câu hỏi', path: '/admin/questions' },
    { icon: FolderOpen, label: 'Học liệu', path: '/admin/media' },
    { icon: FlaskConical, label: 'Thí nghiệm', path: '/admin/experiments' },
    { icon: Sparkles, label: 'AI Pipeline', path: '/admin/ai-content' },
    { icon: Users, label: 'Người dùng', path: '/admin/users' },
    { icon: List, label: 'Nhật ký', path: '/admin/audit-log' },
    { icon: User, label: 'Hồ sơ', path: '/admin/profile' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r-2 border-slate-200 flex flex-col">
        <div className="p-6 mb-4">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-xl">
              PHK
            </div>
            <h1 className="font-black text-xl tracking-tight text-slate-900">
              STEM LAB
            </h1>
          </Link>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
            Learn. Explore. Experiment.
          </p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors",
                isActive ? "bg-blue-50 text-blue-500" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white overflow-hidden flex items-center justify-center text-white font-bold">
              {user?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {user?.role === 'SUPER_ADMIN' ? 'Administrator' : 'Teacher'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b-2 border-slate-200 flex items-center justify-between px-8">
          <div className="relative w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input type="text" placeholder="Tìm kiếm học sinh, khóa học..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
              <span className="text-lg">🛡️</span>
              <span className="font-bold text-sm">Workspace</span>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
