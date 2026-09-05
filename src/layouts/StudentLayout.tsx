import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useStudentStore } from '../store/studentStore';
import { BookOpen, Map, Trophy, User, Bot, LogOut, Hexagon, Target, Layers, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect } from 'react';

export function StudentLayout() {
  const { user, logout } = useAuthStore();
  const { xp, streak, level, progress, fetchProfile } = useStudentStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { icon: Map, label: 'Lộ trình', path: '/student' },
    { icon: BookOpen, label: 'Khóa học', path: '/student/courses' },
    { icon: Target, label: 'Tự luyện', path: '/student/exercises' },
    { icon: FileText, label: 'BTVN', path: '/student/assignments' },
    { icon: Layers, label: 'Flashcards', path: '/student/flashcards' },
    { icon: Target, label: 'Ôn Thi', path: '/student/exam-prep' },
    { icon: Trophy, label: 'Thành tích', path: '/student/achievements' },
    { icon: Bot, label: 'AI Gia sư', path: '/student/ai-tutor' },
    { icon: User, label: 'Hồ sơ', path: '/student/profile' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-slate-200 px-4 md:px-8 h-20 flex items-center justify-between">
        <Link to="/student" className="flex items-center gap-2 text-slate-900 font-black text-xl tracking-tight">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-xl">
            PHK
          </div>
          STEM LAB
        </Link>
        
        {/* Top Nav (Desktop) */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2",
                location.pathname === item.path 
                  ? "bg-blue-50 text-blue-500" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
            <span className="text-lg">🔥</span>
            <span className="font-bold text-sm">{streak} Ngày</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
             <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-black text-sm border-2 border-blue-200">
                 {level}
             </div>
             <div className="w-24">
                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                     <span>XP</span>
                     <span>{xp}</span>
                 </div>
                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                 </div>
             </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-100 h-16 flex items-center justify-around px-2 z-50 pb-safe">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1",
              location.pathname === item.path ? "text-blue-600" : "text-slate-400"
            )}
          >
            <item.icon className={cn("w-6 h-6", location.pathname === item.path && "fill-current")} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
