import React, { useEffect, useRef, useState } from 'react';
import { SimulationSpecification, SimulationState } from '../../types/simulation';
import { PhysicsEngine } from '../../services/simulation/PhysicsEngine';
import { DataTable } from './DataTable';
import { GraphViewer } from './GraphViewer';
import { GuidingQuestionPanel } from './GuidingQuestionPanel';
import { RotateCcw, AlertTriangle, Activity } from 'lucide-react';

interface Props {
  spec: SimulationSpecification;
}

export function ArchimedesSimulation({ spec }: Props) {
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
  const fracParam = spec.parameters.find((p) => p.id === 'fraction')!;
  const rhoParam = spec.parameters.find((p) => p.id === 'rho')!;
  const faParam = spec.parameters.find((p) => p.id === 'FA')!;
  const pkParam = spec.parameters.find((p) => p.id === 'Pk')!;

  const submergedPct = state.parameters['fraction']; // 0-100, dùng trực tiếp làm % chiều cao vật ngập nước

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
        {/* Visual: lực kế treo vật, vật nhúng vào bể nước theo % */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] shadow-inner">
          <div className="absolute top-4 left-4 text-slate-400 font-bold tracking-widest text-sm opacity-50 uppercase">
            Lực kế &amp; Bể nước
          </div>

          {/* Lực kế */}
          <div className="flex flex-col items-center mb-2">
            <div className="w-6 h-10 bg-slate-600 rounded-t-md border-2 border-slate-500" />
            <div className="w-16 h-20 bg-white rounded-xl border-4 border-slate-400 flex flex-col items-center justify-center shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Lực kế</span>
              <span className="text-lg font-black text-red-600 font-mono">
                {state.parameters['Pk']?.toFixed(2)}N
              </span>
            </div>
          </div>

          {/* dây treo */}
          <div className="w-px h-8 bg-slate-500" />

          {/* Bể nước + vật nhúng */}
          <div className="relative w-40 h-40 border-4 border-slate-500 rounded-b-2xl overflow-hidden bg-slate-800/40">
            <div className="absolute bottom-0 left-0 right-0 top-[15%] bg-blue-500/50" />
            {/* Vật */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-14 h-14 bg-amber-600 border-2 border-amber-800 rounded-md transition-all duration-300 flex items-center justify-center"
              style={{
                // vật treo từ trên, phần dưới ngập nước theo % submergedPct
                top: `${8 + (100 - submergedPct) * 0.55}%`,
              }}
            >
              <span className="text-[10px] font-bold text-amber-100">Vật</span>
            </div>
          </div>

          <p className="text-slate-400 text-sm mt-4 text-center max-w-md">
            Vật đang chìm {submergedPct.toFixed(0)}% thể tích trong chất lỏng
          </p>
        </div>

        {/* Điều khiển */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-black text-lg text-slate-900 mb-6">Bảng Điều Khiển</h3>
          <div className="space-y-5 flex-1">
            {(
              [
                { p: mParam, id: 'm', text: 'text-emerald-600', accent: 'accent-emerald-600' },
                { p: vParam, id: 'V', text: 'text-blue-600', accent: 'accent-blue-600' },
                { p: fracParam, id: 'fraction', text: 'text-amber-600', accent: 'accent-amber-600' },
                { p: rhoParam, id: 'rho', text: 'text-indigo-600', accent: 'accent-indigo-600' },
              ] as const
            ).map(({ p, id, text, accent }) => (
              <div key={id}>
                <div className="flex justify-between mb-2">
                  <label className="font-bold text-slate-700 text-sm">{p.label}</label>
                  <span className={`font-mono font-bold text-sm ${text}`}>
                    {state.parameters[id]?.toFixed(0)} {p.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={state.parameters[id] || 0}
                  onChange={(e) => handleParamChange(id, parseFloat(e.target.value))}
                  className={`w-full ${accent}`}
                />
              </div>
            ))}

            <div className="mt-4 bg-red-50 border-2 border-red-100 rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="text-red-800 font-bold mb-1 text-sm">{faParam.label}</span>
              <span className="text-3xl font-black text-red-600 font-mono">
                {state.parameters['FA']?.toFixed(3)} {faParam.unit}
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
