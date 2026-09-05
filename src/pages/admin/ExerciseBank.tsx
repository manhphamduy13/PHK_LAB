import { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Filter } from 'lucide-react';

const MOCK_EXERCISES = [
  { id: '1', title: 'Bài tập Vận tốc trung bình', type: 'TRẮC NGHIỆM', difficulty: 'MEDIUM', subject: 'Vật Lý', grade: 'Lớp 10', usedIn: 5 },
  { id: '2', title: 'Định luật I Newton', type: 'TRẮC NGHIỆM', difficulty: 'EASY', subject: 'Vật Lý', grade: 'Lớp 10', usedIn: 2 },
  { id: '3', title: 'Phương trình trạng thái khí lý tưởng', type: 'TỰ LUẬN', difficulty: 'HARD', subject: 'Hóa Học', grade: 'Lớp 10', usedIn: 1 },
];

export default function ExerciseBank() {
  const [exercises] = useState(MOCK_EXERCISES);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Ngân hàng Bài tập</h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">Quản lý bài tập độc lập</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all border-b-4 border-blue-700 active:border-b-0 active:translate-y-1">
          <Plus className="w-5 h-5" /> Tạo bài tập
        </button>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <div className="p-4 border-b-2 border-slate-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài tập..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-100">
            <Filter className="w-5 h-5" /> Lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-100">
                <th className="p-4 font-black text-slate-600 uppercase tracking-wider text-sm">Câu hỏi / Tiêu đề</th>
                <th className="p-4 font-black text-slate-600 uppercase tracking-wider text-sm">Loại</th>
                <th className="p-4 font-black text-slate-600 uppercase tracking-wider text-sm">Độ khó</th>
                <th className="p-4 font-black text-slate-600 uppercase tracking-wider text-sm">Môn / Lớp</th>
                <th className="p-4 font-black text-slate-600 uppercase tracking-wider text-sm text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {exercises.map(ex => (
                <tr key={ex.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{ex.title}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Đã dùng trong {ex.usedIn} bài giảng</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded uppercase tracking-wider">
                      {ex.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wider ${
                      ex.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-700' :
                      ex.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {ex.difficulty}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">{ex.subject}</span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">{ex.grade}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
