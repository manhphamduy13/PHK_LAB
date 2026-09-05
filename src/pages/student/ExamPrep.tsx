import { useState } from 'react';
import { Target, Calendar, CheckCircle2, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function ExamPrep() {
  const [examDate, setExamDate] = useState('');
  const [subject, setSubject] = useState('Vật Lý 8');
  const [targetScore, setTargetScore] = useState(80);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  const handleGeneratePlan = async () => {
    if (!examDate) return;
    setLoading(true);
    try {
      const res = await fetch('/api/exam-preparation/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ examDate, subject, targetScore })
      });
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Chuẩn Bị Thi</h1>
        <p className="text-xl text-slate-500 font-medium">Lên kế hoạch ôn tập thông minh cùng Khê AI</p>
      </div>

      {!plan ? (
        <div className="bg-white rounded-3xl p-8 border-2 border-b-8 border-slate-200 max-w-2xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Môn Học</label>
              <select 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 font-black text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="Vật Lý 8">Vật Lý 8</option>
                <option value="STEM">STEM</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Ngày Thi</label>
              <input 
                type="date" 
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 font-black text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Mục Tiêu (Điểm: 0-100)</label>
              <input 
                type="number" 
                min="0" max="100"
                value={targetScore}
                onChange={e => setTargetScore(Number(e.target.value))}
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 font-black text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button 
              onClick={handleGeneratePlan}
              disabled={loading || !examDate}
              className="w-full py-4 bg-blue-500 text-white font-black text-lg rounded-2xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <Sparkles className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              {loading ? 'Đang phân tích...' : 'Tạo lộ trình ôn tập'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-3xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2 text-blue-600">
                <Target className="w-6 h-6" />
                <span className="font-bold uppercase tracking-wider text-sm">Readiness</span>
              </div>
              <div className="text-4xl font-black text-blue-900">{plan.plan.readinessScore}/100</div>
            </div>
            
            <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-200">
              <div className="flex items-center gap-3 mb-2 text-emerald-600">
                <Calendar className="w-6 h-6" />
                <span className="font-bold uppercase tracking-wider text-sm">Ngày thi</span>
              </div>
              <div className="text-2xl font-black text-emerald-900">
                {new Date(plan.plan.examDate).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div className="bg-purple-50 rounded-3xl p-6 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-2 text-purple-600">
                <TrendingUp className="w-6 h-6" />
                <span className="font-bold uppercase tracking-wider text-sm">Mục tiêu</span>
              </div>
              <div className="text-4xl font-black text-purple-900">{plan.plan.targetScore}</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-b-8 border-slate-200 p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-500" />
              Lộ trình đề xuất
            </h2>
            
            <div className="prose prose-slate max-w-none mb-8">
               <div dangerouslySetInnerHTML={{ __html: plan.breakdown.schedule.replace(/\n/g, '<br/>') }} />
            </div>

            <h3 className="text-lg font-bold text-slate-700 uppercase tracking-wider mb-4">Các chủ đề trọng tâm</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {plan.breakdown.topics.map((t: string, idx: number) => (
                 <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                   <span className="font-bold text-slate-800">{t}</span>
                 </div>
               ))}
            </div>
          </div>
          
          <button onClick={() => setPlan(null)} className="mx-auto block text-slate-500 font-bold hover:text-slate-900">
            Tạo lộ trình khác
          </button>
        </div>
      )}
    </div>
  );
}
