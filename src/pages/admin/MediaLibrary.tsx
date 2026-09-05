import { useState } from 'react';
import { Upload, Search, FileImage, FileVideo, FileText, Trash2, Download } from 'lucide-react';

const MOCK_MEDIA = [
  { id: '1', name: 'con_lac_lo_so.mp4', type: 'video', size: '12.5 MB', date: '2024-10-15' },
  { id: '2', name: 'dinh_luat_newton.pdf', type: 'document', size: '2.1 MB', date: '2024-10-14' },
  { id: '3', name: 'bi_doa_roi.jpg', type: 'image', size: '1.2 MB', date: '2024-10-12' },
];

export default function MediaLibrary() {
  const [media] = useState(MOCK_MEDIA);

  const getIcon = (type: string) => {
    switch(type) {
      case 'video': return <FileVideo className="w-8 h-8 text-red-500" />;
      case 'image': return <FileImage className="w-8 h-8 text-emerald-500" />;
      default: return <FileText className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Thư viện Học liệu</h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">Quản lý hình ảnh, video, tài liệu PDF</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all border-b-4 border-blue-700 active:border-b-0 active:translate-y-1">
          <Upload className="w-5 h-5" /> Tải lên
        </button>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <div className="p-4 border-b-2 border-slate-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm file..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
          {media.map(file => (
            <div key={file.id} className="group bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 hover:border-blue-300 transition-colors relative">
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-1.5 bg-white text-slate-400 hover:text-blue-500 rounded-lg shadow-sm"><Download className="w-4 h-4" /></button>
                 <button className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg shadow-sm"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="h-32 flex items-center justify-center bg-white rounded-xl mb-4 border-2 border-slate-100">
                {getIcon(file.type)}
              </div>
              <p className="font-bold text-slate-900 truncate" title={file.name}>{file.name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-bold text-slate-400 uppercase">{file.size}</span>
                <span className="text-xs font-bold text-slate-400">{file.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
