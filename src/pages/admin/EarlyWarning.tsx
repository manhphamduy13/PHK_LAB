import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Clock, ShieldAlert, ArrowRight, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function EarlyWarning() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/early-warning/signals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setSignals(data.signals || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return <div className="p-8 text-center font-bold text-slate-500">Đang tải cảnh báo...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Cảnh Báo Sớm</h1>
          <p className="text-slate-500 font-bold mt-2">Học sinh cần được hỗ trợ (Early Warning System)</p>
        </div>
        <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl border border-rose-200 font-bold">
          <ShieldAlert className="w-5 h-5" />
          <span>{signals.length} Cảnh báo</span>
        </div>
      </div>

      {signals.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-b-4 border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Không có cảnh báo nào!</h2>
          <p className="text-slate-500">Tất cả học sinh đều đang theo kịp tiến độ.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {signals.map((signal, idx) => (
            <div key={idx} className="bg-white rounded-3xl border-2 border-b-4 border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-xl text-slate-400">
                      {signal.studentName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{signal.studentName}</h3>
                      <span className={`inline-block px-2 py-1 mt-1 text-xs font-bold uppercase rounded-lg border ${
                        signal.riskLevel === 'HIGH' ? 'bg-rose-50 text-rose-600 border-rose-200' : 
                        signal.riskLevel === 'MEDIUM' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                        'bg-yellow-50 text-yellow-600 border-yellow-200'
                      }`}>
                        Nguy cơ {signal.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-sm font-bold text-slate-500 uppercase">Dấu hiệu cảnh báo:</p>
                  <ul className="space-y-2">
                    {signal.reasons.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700 font-medium">
                        <TrendingDown className="w-5 h-5 text-rose-400 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-bold text-slate-500 block">Đề xuất:</span>
                  <span className="font-bold text-slate-900">{signal.suggestedAction}</span>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                  Can thiệp <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
