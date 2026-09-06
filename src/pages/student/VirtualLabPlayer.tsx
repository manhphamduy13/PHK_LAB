import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FlaskConical } from 'lucide-react';
import { getLabById } from '../../data/simulations';
import { SimulationPlayer } from '../../components/simulation/SimulationPlayer';
import { useStudentStore } from '../../store/studentStore';

export default function VirtualLabPlayer() {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { addXP } = useStudentStore();
  const [completed, setCompleted] = useState(false);

  const lab = labId ? getLabById(labId) : undefined;

  if (!lab) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-700">Không tìm thấy thí nghiệm</h2>
        <Link to="/student/labs" className="text-blue-600 font-bold mt-4 inline-block">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const handleComplete = async () => {
    if (!completed) {
      await addXP(30, {
        action: "COMPLETE_SIMULATION",
        sourceType: "SIMULATION",
        sourceId: labId || "simulation",
      });
      setCompleted(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/student/labs')}
          className="w-10 h-10 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{lab.spec.title}</h1>
          <p className="text-slate-500 font-bold text-sm">{lab.spec.description}</p>
        </div>
      </div>

      <SimulationPlayer spec={lab.spec} />

      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          disabled={completed}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-emerald-500 border-2 border-b-4 border-emerald-700 active:border-b-2 active:translate-y-[2px] transition-all hover:bg-emerald-400 disabled:opacity-60 disabled:pointer-events-none"
        >
          <CheckCircle2 className="w-5 h-5" />
          {completed ? 'Đã hoàn thành (+30 XP)' : 'Hoàn thành thí nghiệm'}
        </button>
      </div>
    </div>
  );
}
