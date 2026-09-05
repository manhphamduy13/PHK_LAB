import { useState } from 'react';
import { Plus, Search, Filter, HelpCircle, Edit3, Trash2 } from 'lucide-react';

export default function QuestionBank() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Ngân hàng Câu hỏi</h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">Quản lý câu hỏi rời cho Quiz</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all border-b-4 border-blue-700 active:border-b-0 active:translate-y-1">
          <Plus className="w-5 h-5" /> Thêm câu hỏi
        </button>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <div className="p-4 border-b-2 border-slate-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm câu hỏi..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-100">
            <Filter className="w-5 h-5" /> Lọc chủ đề
          </button>
        </div>

        <div className="p-6">
           <div className="border-2 border-slate-100 rounded-2xl p-4 hover:border-blue-200 transition-colors group">
              <div className="flex items-start gap-4">
                 <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                    <HelpCircle className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                    <p className="font-bold text-slate-900">Công thức tính vận tốc trung bình là gì?</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">Vật Lý 10</span>
                       <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">Động học</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
