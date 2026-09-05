import { useState, useEffect } from 'react';
import { Target, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Assignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/assignments/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setAssignments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Đang tải bài tập...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Bài Tập Của Tôi</h1>
        <p className="text-xl text-slate-500 font-medium">Hoàn thành bài tập để nhận XP và điểm Mastery</p>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-b-8 border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Thật tuyệt vời!</h2>
          <p className="text-slate-500 font-medium">Bạn đã hoàn thành tất cả bài tập được giao.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a: any) => (
             <div key={a.id} className="bg-white p-6 rounded-3xl border-2 border-b-8 border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 font-black">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">{a.title}</h3>
                        <div className="flex items-center gap-4 mt-2">
                           <span className="flex items-center gap-1 text-sm font-bold text-slate-500">
                             <Calendar className="w-4 h-4" />
                             Hạn chót: {new Date(a.dueDate).toLocaleDateString('vi-VN')}
                           </span>
                           <span className={`px-2 py-1 text-xs font-black uppercase rounded-lg border ${
                               a.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                               a.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                               'bg-slate-50 text-slate-600 border-slate-200'
                           }`}>
                             {a.status}
                           </span>
                        </div>
                    </div>
                </div>
                <div>
                   <button className="px-6 py-3 bg-blue-500 text-white font-black rounded-xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all">
                     {a.status === 'COMPLETED' ? 'Xem Kết Quả' : 'Làm Bài'}
                   </button>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
