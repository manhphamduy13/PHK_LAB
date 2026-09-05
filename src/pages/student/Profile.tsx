import { useStudentStore } from '../../store/studentStore';
import { useAuthStore } from '../../store/authStore';
import { Settings, LogOut, BookOpen, Clock, Target, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const { xp, level, streak, lessonsCompleted } = useStudentStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border-2 border-b-4 border-slate-200 text-center relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
        
        <div className="w-32 h-32 mx-auto bg-blue-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-5xl font-black mb-4 relative z-10">
          {user?.name?.charAt(0)}
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-1">{user?.name}</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-6">Học sinh lớp 10</p>
        
        <div className="flex justify-center gap-6 border-t-2 border-slate-100 pt-6">
          <div className="text-center">
            <div className="text-2xl font-black text-blue-600 mb-1">{level}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-amber-500 mb-1">{xp}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">XP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-500 mb-1">{streak}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Streak</div>
          </div>
        </div>
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border-2 border-b-4 border-slate-200">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{lessonsCompleted}</div>
          <div className="text-sm font-bold text-slate-500">Bài học hoàn thành</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-b-4 border-slate-200">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">45h</div>
          <div className="text-sm font-bold text-slate-500">Thời gian học</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-b-4 border-slate-200">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Target className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">85%</div>
          <div className="text-sm font-bold text-slate-500">Tỷ lệ chính xác</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-b-4 border-slate-200">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <Award className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">3</div>
          <div className="text-sm font-bold text-slate-500">Huy hiệu đạt được</div>
        </div>
      </div>

      {/* Action */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 font-black rounded-2xl border-2 border-b-4 border-red-200 hover:bg-red-100 active:border-b-2 active:translate-y-[2px] transition-all"
      >
        <LogOut className="w-5 h-5" />
        Đăng xuất
      </button>
    </div>
  );
}
