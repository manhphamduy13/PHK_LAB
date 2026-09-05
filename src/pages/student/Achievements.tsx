import { Trophy, Medal, Star, Flame, Target } from 'lucide-react';
import { useStudentStore } from '../../store/studentStore';

const BADGES = [
  { id: 1, name: 'Khởi đầu rực rỡ', description: 'Hoàn thành bài học đầu tiên', icon: '🌟', color: 'bg-yellow-100 text-yellow-600', earned: true },
  { id: 2, name: 'Chiến binh 7 ngày', description: 'Giữ streak 7 ngày liên tục', icon: '🔥', color: 'bg-orange-100 text-orange-600', earned: true },
  { id: 3, name: 'Nhà khoa học nhí', description: 'Hoàn thành 5 thí nghiệm', icon: '🔬', color: 'bg-emerald-100 text-emerald-600', earned: true },
  { id: 4, name: 'Tuyệt đối chính xác', description: 'Đạt 100% điểm quiz 5 lần', icon: '🎯', color: 'bg-blue-100 text-blue-600', earned: false },
  { id: 5, name: 'Cú đêm chăm chỉ', description: 'Học vào sau 10h tối', icon: '🦉', color: 'bg-purple-100 text-purple-600', earned: false },
  { id: 6, name: 'Bách khoa toàn thư', description: 'Khám phá đủ 3 môn học', icon: '📚', color: 'bg-pink-100 text-pink-600', earned: false },
];

export default function Achievements() {
  const { xp, level, streak } = useStudentStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-amber-500 rounded-3xl p-8 border-b-4 border-amber-700 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-amber-100">
        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 shrink-0">
          <Trophy className="w-16 h-16 text-yellow-200" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tight mb-2">Thành tích của bạn</h1>
          <p className="text-amber-100 font-medium text-lg mb-6">Tiếp tục khám phá để mở khóa thêm nhiều huy hiệu mới nhé!</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="px-4 py-2 bg-white/20 rounded-2xl flex items-center gap-2 backdrop-blur-sm">
              <Star className="w-5 h-5 text-yellow-300 fill-current" />
              <span className="font-black text-xl">{xp} XP</span>
            </div>
            <div className="px-4 py-2 bg-white/20 rounded-2xl flex items-center gap-2 backdrop-blur-sm">
              <Medal className="w-5 h-5 text-blue-300" />
              <span className="font-black text-xl">Level {level}</span>
            </div>
            <div className="px-4 py-2 bg-white/20 rounded-2xl flex items-center gap-2 backdrop-blur-sm">
              <Flame className="w-5 h-5 text-orange-400 fill-current" />
              <span className="font-black text-xl">{streak} Ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900">Huy hiệu huy hoàng</h2>
          <span className="font-bold text-slate-500">Đã mở: 3/6</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BADGES.map((badge) => (
            <div 
              key={badge.id} 
              className={`p-6 rounded-3xl border-2 border-b-4 transition-transform hover:-translate-y-1 ${
                badge.earned 
                  ? 'bg-white border-slate-200' 
                  : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-sm ${badge.color}`}>
                {badge.icon}
              </div>
              <h3 className="font-black text-lg text-slate-900 mb-1">{badge.name}</h3>
              <p className="text-slate-500 font-medium text-sm">{badge.description}</p>
              
              {badge.earned ? (
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  <Target className="w-3 h-3" /> Đã mở khóa
                </div>
              ) : (
                <div className="mt-4 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full bg-slate-300 w-1/3" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
