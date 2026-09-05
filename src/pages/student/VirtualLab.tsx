import { Link } from 'react-router-dom';
import { FlaskConical, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { VIRTUAL_LABS } from '../../data/simulations';

export default function VirtualLab() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          KHTN Smart Lab
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Phòng thí nghiệm ảo</h1>
        <p className="text-slate-500 font-bold mt-1">
          Khám phá – Đo lường – Phân tích – Kết luận. Tự tay thực hiện thí nghiệm, thu thập dữ liệu thật và rút ra kết luận của riêng em.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {VIRTUAL_LABS.map((lab) => (
          <Link
            key={lab.spec.id}
            to={`/student/labs/${lab.spec.id}`}
            className="group bg-white border-2 border-b-4 border-slate-200 hover:border-blue-300 rounded-3xl overflow-hidden transition-colors"
          >
            <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
              <FlaskConical className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white font-bold flex items-center gap-1 text-sm">
                  Bắt đầu <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <span className="text-xs font-black text-blue-500 uppercase tracking-wide">
                {lab.spec.subject} • Lớp {lab.spec.grade}
              </span>
              <h3 className="font-black text-slate-900 leading-snug">{lab.spec.title}</h3>
              <p className="text-sm text-slate-500 font-medium line-clamp-2">{lab.spec.description}</p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 pt-1">
                <Clock className="w-3.5 h-3.5" />
                Khoảng {lab.estMinutes} phút
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
