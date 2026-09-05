import { Shield, BookOpen, Clock, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function AdminProfile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div className="px-8 pb-8">
           <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-sm flex items-center justify-center text-3xl font-black text-blue-600 overflow-hidden">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" className="w-full h-full bg-blue-50" />
              </div>
              <div className="flex gap-3">
                 <button className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-200">
                    <Settings className="w-4 h-4" /> Cài đặt
                 </button>
                 <button onClick={() => { logout(); navigate('/login'); }} className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl flex items-center gap-2 hover:bg-red-200">
                    <LogOut className="w-4 h-4" /> Đăng xuất
                 </button>
              </div>
           </div>

           <div>
             <h1 className="text-3xl font-black text-slate-900">{user?.name || 'Phạm Hữu Khê'}</h1>
             <p className="text-slate-500 font-bold text-lg mt-1 flex items-center gap-2">
               Giáo viên Vật Lý <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Trường THCS Phú Tân
             </p>
             <div className="flex items-center gap-2 mt-4">
               <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black rounded-lg uppercase flex items-center gap-1 w-max">
                 <Shield className="w-4 h-4" /> Administrator
               </span>
               <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-lg uppercase flex items-center gap-1 w-max">
                 <BookOpen className="w-4 h-4" /> Teacher
               </span>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-6 rounded-3xl border-2 border-slate-200">
           <h3 className="font-black text-slate-900 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
             <Clock className="w-5 h-5 text-slate-400" /> Hoạt động gần đây
           </h3>
           <div className="space-y-4">
             <p className="text-slate-600 font-medium">Đã cập nhật bài giảng "Chuyển động thẳng" - <span className="text-xs text-slate-400 font-bold">1 giờ trước</span></p>
             <p className="text-slate-600 font-medium">Đã duyệt bài tập của Học sinh A - <span className="text-xs text-slate-400 font-bold">2 giờ trước</span></p>
           </div>
         </div>
         
         <div className="bg-white p-6 rounded-3xl border-2 border-slate-200">
           <h3 className="font-black text-slate-900 mb-4 uppercase tracking-wider text-sm">Thống kê cá nhân</h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
               <span className="font-bold text-slate-600">Bài giảng đã tạo</span>
               <span className="font-black text-blue-600 text-xl">45</span>
             </div>
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
               <span className="font-bold text-slate-600">Bài tập đã duyệt</span>
               <span className="font-black text-emerald-600 text-xl">128</span>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
}
