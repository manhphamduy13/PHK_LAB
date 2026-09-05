import { useState, useEffect } from 'react';
import { Users, Plus, Target, BarChart2, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function ClassManagement() {
  const [classes, setClasses] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch('/api/classes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setClasses(data);
        if (data.length > 0) {
            setSelectedClass(data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadClasses();
  }, [token]);

  useEffect(() => {
    if (!selectedClass) return;
    async function loadHeatmap() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/class/${selectedClass}/heatmap`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setHeatmap(data.heatmap || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHeatmap();
  }, [selectedClass, token]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Quản lý lớp học</h1>
          <p className="text-slate-500 font-bold mt-2">Theo dõi và giao bài tập</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl border-b-4 border-blue-700 hover:translate-y-px hover:border-b-2 transition-all font-bold">
          <Plus className="w-5 h-5" />
          Tạo lớp mới
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {classes.map(c => (
           <button 
             key={c.id} 
             onClick={() => setSelectedClass(c.id)}
             className={`px-6 py-4 rounded-2xl font-black border-2 flex items-center gap-3 transition-colors ${
                 selectedClass === c.id 
                 ? 'bg-blue-50 text-blue-600 border-blue-200' 
                 : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
             }`}
           >
             <Users className="w-5 h-5" />
             {c.name}
           </button>
        ))}
      </div>

      {selectedClass && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border-2 border-b-4 border-slate-200 p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <BarChart2 className="w-6 h-6 text-orange-500" />
                Concept Heatmap
              </h2>
              
              {loading ? (
                 <div className="h-64 flex items-center justify-center font-bold text-slate-400 animate-pulse">
                   Đang phân tích dữ liệu...
                 </div>
              ) : heatmap.length === 0 ? (
                 <div className="h-64 flex flex-col items-center justify-center font-bold text-slate-400 text-center">
                   <Target className="w-12 h-12 mb-4 text-slate-300" />
                   Chưa có dữ liệu học tập<br/>từ học sinh lớp này.
                 </div>
              ) : (
                 <div className="space-y-4">
                   {heatmap.map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-2 border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">{h.conceptId}</p>
                          <p className="text-xs font-bold text-slate-500 uppercase mt-1">{h.studentCount} Học sinh</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-lg font-black text-sm ${
                              h.averageMastery < 50 ? 'bg-rose-100 text-rose-700' : 
                              h.averageMastery < 80 ? 'bg-amber-100 text-amber-700' : 
                              'bg-emerald-100 text-emerald-700'
                          }`}>
                             {h.averageMastery}% Mastery
                          </span>
                        </div>
                      </div>
                   ))}
                 </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border-2 border-b-4 border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                  Bài tập đã giao
                </h2>
                <button className="text-sm font-bold text-blue-500 hover:text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  + Giao bài mới
                </button>
              </div>
              <div className="h-64 flex flex-col items-center justify-center font-bold text-slate-400 text-center">
                   Chưa có bài tập nào được giao.
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
