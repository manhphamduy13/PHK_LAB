import { FlaskConical, Search, Play, Settings } from 'lucide-react';

export default function ExperimentLibrary() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Thư viện Thí nghiệm</h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">Quản lý các mô phỏng và thí nghiệm ảo</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <div className="p-4 border-b-2 border-slate-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm thí nghiệm..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {[1, 2].map((i) => (
            <div key={i} className="border-2 border-slate-200 rounded-2xl overflow-hidden group hover:border-blue-300 transition-colors">
              <div className="h-40 bg-slate-100 flex items-center justify-center relative">
                 <FlaskConical className="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform" />
                 <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-lg">
                      <Play className="w-6 h-6 ml-1" />
                    </button>
                 </div>
              </div>
              <div className="p-4 bg-white flex justify-between items-start">
                 <div>
                    <h3 className="font-bold text-slate-900">Con lắc đơn</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-1">Vật Lý 10 • Dao động cơ</p>
                 </div>
                 <button className="text-slate-400 hover:text-blue-500 transition-colors">
                    <Settings className="w-5 h-5" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
