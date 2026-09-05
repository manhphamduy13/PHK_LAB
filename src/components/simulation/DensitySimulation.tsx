import React, { useEffect, useRef, useState } from 'react';
import { SimulationSpecification, SimulationState } from '../../types/simulation';
import { PhysicsEngine } from '../../services/simulation/PhysicsEngine';
import { DataTable } from './DataTable';
import { GraphViewer } from './GraphViewer';
import { GuidingQuestionPanel } from './GuidingQuestionPanel';
import { Play, RotateCcw, AlertTriangle, Activity } from 'lucide-react';

interface Props {
  spec: SimulationSpecification;
}

export function DensitySimulation({ spec }: Props) {
  const engineRef = useRef<PhysicsEngine | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);

  useEffect(() => {
    engineRef.current = new PhysicsEngine(spec);
    setState(engineRef.current.getState());
  }, [spec]);

  if (!state || !engineRef.current) return <div>Đang khởi tạo...</div>;

  const handleParamChange = (id: string, value: number) => {
    if (engineRef.current) setState(engineRef.current.updateParameter(id, value));
  };
  const handleMeasure = () => {
    if (engineRef.current) setState(engineRef.current.takeMeasurement());
  };
  const handleReset = () => {
    if (engineRef.current) setState(engineRef.current.reset());
  };
  const handleClearData = () => {
    if (engineRef.current) {
      engineRef.current['state'].measurements = [];
      setState({ ...state, measurements: [] });
    }
  };

  const mParam = spec.parameters.find((p) => p.id === 'm')!;
  const vParam = spec.parameters.find((p) => p.id === 'V')!;
  const dParam = spec.parameters.find((p) => p.id === 'D')!;

  // Chiều cao cột nước dâng trong ống nghiệm minh hoạ theo thể tích V (giới hạn hiển thị)
  const waterFillPct = Math.min(90, 25 + (state.parameters['V'] / vParam.max) * 65);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {state.status === 'ERROR' && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-red-800">Lỗi / Giới hạn</h4>
            <ul className="list-disc list-inside text-sm text-red-700 mt-1">
              {state.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual: cân + bình chia độ */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 relative overflow-hidden flex items-center justify-center gap-12 min-h-[400px] shadow-inner">
          <div className="absolute top-4 left-4 text-slate-400 font-bold tracking-widest text-sm opacity-50 uppercase">
            Bàn thí nghiệm
          </div>

          {/* Cân điện tử */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-20 bg-slate-700 rounded-t-xl border-2 border-slate-500 flex items-center justify-center relative">
              <div className="w-8 h-8 bg-slate-800 rounded-md border border-slate-600" />
            </div>
            <div className="w-32 bg-slate-800 border-2 border-slate-600 rounded-b-xl px-3 py-2 text-center">
              <span className="font-mono text-emerald-400 font-black text-lg">
                {state.parameters['m']?.toFixed(0)} g
              </span>
            </div>
            <span className="text-slate-400 text-xs font-bold mt-2 uppercase">Cân điện tử</span>
          </div>

          {/* Bình chia độ */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-48 border-4 border-slate-500 rounded-b-2xl relative overflow-hidden bg-slate-800/50">
              <div
                className="absolute bottom-0 left-0 right-0 bg-blue-500/70 transition-all duration-500"
                style={{ height: `${waterFillPct}%` }}
              />
              {/* vạch chia */}
              {[20, 40, 60, 80].map((y) => (
                <div key={y} className="absolute left-0 right-0 h-px bg-slate-400/40" style={{ bottom: `${y}%` }} />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 bg-amber-600 rounded-sm border border-amber-800" />
              </div>
            </div>
            <span className="text-slate-400 text-xs font-bold mt-2 uppercase text-center">
              Bình chia độ<br />V = {state.parameters['V']?.toFixed(0)} cm³
            </span>
          </div>
        </div>

        {/* Điều khiển */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-black text-lg text-slate-900 mb-6">Bảng Điều Khiển</h3>
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-slate-700">{mParam.label}</label>
                <span className="font-mono font-bold text-emerald-600">
                  {state.parameters['m']?.toFixed(0)} {mParam.unit}
                </span>
              </div>
              <input
                type="range"
                min={mParam.min}
                max={mParam.max}
                step={mParam.step}
                value={state.parameters['m'] || 0}
                onChange={(e) => handleParamChange('m', parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-slate-700">{vParam.label}</label>
                <span className="font-mono font-bold text-blue-600">
                  {state.parameters['V']?.toFixed(0)} {vParam.unit}
                </span>
              </div>
              <input
                type="range"
                min={vParam.min}
                max={vParam.max}
                step={vParam.step}
                value={state.parameters['V'] || 0}
                onChange={(e) => handleParamChange('V', parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="mt-8 bg-amber-50 border-2 border-amber-100 rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="text-amber-800 font-bold mb-1">{dParam.label}</span>
              <span className="text-4xl font-black text-amber-600 font-mono">
                {state.parameters['D']?.toFixed(2)} {dParam.unit}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t-2 border-slate-100">
            <button
              onClick={handleMeasure}
              disabled={state.status === 'ERROR'}
              className="col-span-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Activity className="w-5 h-5" />
              Ghi Dữ Liệu (Đo)
            </button>
            <button
              onClick={handleReset}
              className="col-span-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Đặt Lại
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable state={state} parameters={spec.parameters} onClear={handleClearData} />
        {spec.charts?.[0] ? (
          <GraphViewer state={state} chart={spec.charts[0]} parameters={spec.parameters} />
        ) : (
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-medium">
            Không có đồ thị
          </div>
        )}
      </div>

      <GuidingQuestionPanel questions={spec.questions} state={state} />
    </div>
  );
}
