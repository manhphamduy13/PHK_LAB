import { Search, Filter, History } from 'lucide-react';

const LOGS = [
  { id: 1, user: 'Phạm Hữu Khê', action: 'CREATE', resource: 'Bài giảng "Chuyển động thẳng"', time: '10 phút trước', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 2, user: 'Phạm Hữu Khê', action: 'UPDATE', resource: 'Bài tập "Định luật Newton"', time: '1 giờ trước', badge: 'bg-blue-100 text-blue-700' },
  { id: 3, user: 'System', action: 'DELETE', resource: 'Tài liệu "draft_v1.pdf"', time: '2 giờ trước', badge: 'bg-red-100 text-red-700' },
];

export default function AuditLog() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Nhật ký Hệ thống</h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">Audit Logs</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <div className="p-4 border-b-2 border-slate-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm log..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-100">
            <Filter className="w-5 h-5" /> Lọc
          </button>
        </div>

        <div className="p-6 space-y-4">
          {LOGS.map(log => (
            <div key={log.id} className="flex items-start gap-4 p-4 border-2 border-slate-100 rounded-2xl hover:border-blue-200 transition-colors">
               <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                 <History className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <p className="font-medium text-slate-800">
                   <span className="font-black text-slate-900">{log.user}</span> đã <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${log.badge}`}>{log.action}</span> {log.resource}
                 </p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">{log.time}</p>
               </div>
               <button className="text-blue-500 font-bold text-sm hover:underline">Chi tiết</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
