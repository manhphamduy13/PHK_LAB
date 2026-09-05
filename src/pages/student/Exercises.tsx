import { useState } from 'react';
import { Target, CheckCircle2, XCircle, ArrowRight, Star, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStudentStore } from '../../store/studentStore';

const EXERCISE = {
  id: 'ex1',
  title: 'Bài tập: Vận tốc trung bình',
  difficulty: 'Medium',
  points: 100,
  question: 'Một ô tô đi từ A đến B với vận tốc 40km/h và từ B về A với vận tốc 60km/h. Vận tốc trung bình của ô tô trên cả quãng đường là bao nhiêu?',
  options: [
    '50 km/h',
    '48 km/h',
    '52 km/h',
    '45 km/h'
  ],
  correctIndex: 1,
  explanation: 'Gọi quãng đường AB là S. Thời gian đi là t1 = S/40, thời gian về là t2 = S/60. Vận tốc trung bình = 2S / (t1 + t2) = 2S / (S/40 + S/60) = 48 km/h.'
};

export default function Exercises() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addXP } = useStudentStore();
  const [xpEarned, setXpEarned] = useState(0);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
    if (selectedAnswer === EXERCISE.correctIndex) {
      setXpEarned(EXERCISE.points);
      addXP(EXERCISE.points);
    }
  };

  const isCorrect = selectedAnswer === EXERCISE.correctIndex;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <Link to="/student" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors mb-6">
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </Link>

      <div className="bg-white rounded-3xl border-2 border-b-4 border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b-2 border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{EXERCISE.title}</h1>
              <div className="flex gap-2 mt-1">
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                  {EXERCISE.difficulty}
                </span>
                <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                  {EXERCISE.points} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-slate-700 leading-relaxed mb-8">
            {EXERCISE.question}
          </h2>

          <div className="space-y-4">
            {EXERCISE.options.map((option, idx) => {
              let btnClass = "w-full text-left p-4 rounded-2xl border-2 font-bold transition-all ";
              
              if (!isSubmitted) {
                btnClass += selectedAnswer === idx 
                  ? "border-blue-500 bg-blue-50 text-blue-700" 
                  : "border-slate-200 hover:border-blue-300 text-slate-600 hover:bg-slate-50";
              } else {
                if (idx === EXERCISE.correctIndex) {
                  btnClass += "border-emerald-500 bg-emerald-50 text-emerald-700";
                } else if (idx === selectedAnswer) {
                  btnClass += "border-red-500 bg-red-50 text-red-700";
                } else {
                  btnClass += "border-slate-200 text-slate-400 opacity-50";
                }
              }

              return (
                <button 
                  key={idx}
                  disabled={isSubmitted}
                  onClick={() => setSelectedAnswer(idx)}
                  className={btnClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isSubmitted && idx === EXERCISE.correctIndex && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {isSubmitted && idx === selectedAnswer && idx !== EXERCISE.correctIndex && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Result & Explanation */}
          {isSubmitted && (
            <div className={`mt-8 p-6 rounded-2xl border-2 animate-in slide-in-from-bottom-4 ${isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                {isCorrect ? (
                  <>
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    <div className="font-black text-xl text-emerald-700">Chính xác! (+{xpEarned} XP)</div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div className="font-black text-xl text-red-700">Chưa chính xác</div>
                  </>
                )}
              </div>
              <div className="bg-white/60 p-4 rounded-xl">
                <p className="font-bold text-slate-900 mb-1">Giải thích:</p>
                <p className="text-slate-700 font-medium leading-relaxed">{EXERCISE.explanation}</p>
              </div>
            </div>
          )}

          {/* Action */}
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="w-full mt-8 px-6 py-4 bg-blue-500 text-white rounded-2xl font-black text-lg border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kiểm tra
            </button>
          ) : (
            <button className="w-full mt-8 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg border-b-4 border-slate-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
              Câu tiếp theo <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
