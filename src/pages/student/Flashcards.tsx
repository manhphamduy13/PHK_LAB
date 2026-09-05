import { useState } from 'react';
import { RotateCcw, Check, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CARDS = [
  { id: 1, front: 'Gia tốc (a)', back: 'Đại lượng vectơ đặc trưng cho sự thay đổi nhanh hay chậm của vận tốc. Công thức: a = Δv / Δt' },
  { id: 2, front: 'Định luật I Newton', back: 'Nếu một vật không chịu tác dụng của lực nào hoặc chịu tác dụng của các lực có hợp lực bằng 0, thì vật đang đứng yên sẽ tiếp tục đứng yên, đang chuyển động sẽ tiếp tục chuyển động thẳng đều.' },
  { id: 3, front: 'Trọng lực (P)', back: 'Lực hút của Trái Đất tác dụng lên vật. Công thức: P = mg' }
];

export default function Flashcards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ know: 0, review: 0 });

  const card = CARDS[currentIndex];
  const isComplete = currentIndex >= CARDS.length;

  const handleNext = (status: 'know' | 'review') => {
    setStats(prev => ({ ...prev, [status]: prev[status] + 1 }));
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 150);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setStats({ know: 0, review: 0 });
    setIsFlipped(false);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <Link to="/student" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors mb-6">
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-900">Ôn tập Flashcards</h1>
        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-sm">Vật Lý 10 - Chương 1 & 2</p>
      </div>

      {!isComplete ? (
        <div className="space-y-8">
          <div className="flex justify-between text-sm font-bold text-slate-400 px-4">
            <span>Tiến độ: {currentIndex + 1} / {CARDS.length}</span>
            <span>Đã thuộc: <span className="text-emerald-500">{stats.know}</span></span>
          </div>

          {/* Card Container */}
          <div 
            className="relative h-80 w-full perspective-1000 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`w-full h-full transition-all duration-500 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-3xl border-2 border-b-8 border-slate-200 p-8 flex items-center justify-center text-center group-hover:border-blue-300">
                <h2 className="text-3xl font-black text-slate-900">{card.front}</h2>
                <div className="absolute bottom-6 text-slate-400 text-sm font-bold flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Chạm để lật
                </div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden bg-blue-500 text-white rounded-3xl border-b-8 border-blue-700 p-8 flex items-center justify-center text-center rotate-y-180">
                <p className="text-xl font-medium leading-relaxed">{card.back}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex gap-4 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext('review'); }}
              className="flex-1 py-4 bg-orange-100 text-orange-700 font-black rounded-2xl border-2 border-b-4 border-orange-200 hover:bg-orange-200 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-lg"
            >
              <X className="w-6 h-6" /> Ôn lại
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext('know'); }}
              className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl border-2 border-b-4 border-emerald-700 hover:bg-emerald-400 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-lg"
            >
              <Check className="w-6 h-6" /> Đã thuộc
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-b-4 border-slate-200 animate-in zoom-in-95">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
            <Check className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Hoàn thành bộ thẻ!</h2>
          <p className="text-slate-500 font-medium mb-8">Bạn đã nhớ được {stats.know} trên tổng số {CARDS.length} thuật ngữ.</p>
          <button 
            onClick={handleReset}
            className="px-8 py-4 bg-blue-500 text-white font-black rounded-2xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            Học lại từ đầu
          </button>
        </div>
      )}
    </div>
  );
}
