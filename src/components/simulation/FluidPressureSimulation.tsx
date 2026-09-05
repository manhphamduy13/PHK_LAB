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

const FLUID_PRESETS: { label: string; rho: number }[] = [
  { label: 'Nước', rho: 1000 },
  { label: 'Dầu ăn', rho: 900 },
  { label: 'Nước muối', rho: 1030 },
];

export function FluidPressureSimulation({ spec }: Props) {
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

  const hParam = spec.parameters.find((p) => p.id === 'h')!;
  const rhoParam = spec.parameters.find((p) => p.id === 'rho')!;
  const pParam = spec.parameters.find((p) => p.id === 'p')!;

  const depthPct = (state.parameters['h'] / hParam.max) * 90;

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
        {/* Visual: bể chất lỏng với cảm biến ở độ sâu h */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 relative overflow-hidden flex items-center justify-center min-h-[400px] shadow-inner">
          <div className="absolute top-4 left-4 text-slate-400 font-bold tracking-widest text-sm opacity-50 uppercase">
            Bể chất lỏng
          </div>

          <div className="relative w-48 h-72 border-4 border-slate-500 rounded-b-3xl overflow-hidden bg-slate-800/40">
            {/* chất lỏng */}
            <div
              className="absolute bottom-0 left-0 right-0 transition-colors duration-300"
              style={{
                top: '10%',
                background:
                  state.parameters['rho'] >= 1020
                    ? 'linear-gradient(180deg, rgba(34,197,94,0.35), rgba(34,197,94,0.6))'
                    : state.parameters['rho'] <= 920
                      ? 'linear-gradient(180deg, rgba(250,204,21,0.35), rgba(250,204,21,0.55))'
                      : 'linear-gradient(180deg, rgba(59,130,246,0.35), rgba(59,130,246,0.6))',
              }}
            />
            {/* vạch chia độ sâu */}
            {[0, 20, 40, 60, 80].map((y) => (
              <div key={y} className="absolute left-0 right-0 h-px bg-slate-400/30" style={{ top: `${10 + y * 0.85}%` }} />
            ))}
            {/* cảm biến áp suất ở độ sâu h */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-4 border-red-500 shadow-lg transition-all duration-300 flex items-center justify-center"
              style={{ top: `${10 + depthPct}%` }}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            </div>
          </div>

          <div className="absolute bottom-4 text-slate-400 text-sm font-medium">
            Cảm biến áp suất đặt ở độ sâu h = {state.parameters['h']?.toFixed(0)} cm
          </div>
        </div>

        {/* Điều khiển */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-black text-lg text-slate-900 mb-6">Bảng Điều Khiển</h3>
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-slate-700">{hParam.label}</label>
                <span className="font-mono font-bold text-red-600">
                  {state.parameters['h']?.toFixed(0)} {hParam.unit}
                </span>
              </div>
              <input
                type="range"
                min={hParam.min}
                max={hParam.max}
                step={hParam.step}
                value={state.parameters['h'] || 0}
                onChange={(e) => handleParamChange('h', parseFloat(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-2 block">Chất lỏng</label>
              <div className="flex gap-2 flex-wrap mb-3">
                {FLUID_PRESETS.map((f) => (
                  <button
                    key={f.label}
                    onClick={() => handleParamChange('rho', f.rho)}
                    className={`px-3 py-2 rounded-xl font-bold text-sm border-2 transition-colors ${
                      Math.abs(state.parameters['rho'] - f.rho) < 5
                        ? 'bg-blue-500 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase">{rhoParam.label}</span>
                <span className="font-mono font-bold text-blue-600 text-sm">
                  {state.parameters['rho']?.toFixed(0)} {rhoParam.unit}
                </span>
              </div>
              <input
                type="range"
                min={rhoParam.min}
                max={rhoParam.max}
                step={rhoParam.step}
                value={state.parameters['rho'] || 0}
                onChange={(e) => handleParamChange('rho', parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="mt-4 bg-red-50 border-2 border-red-100 rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="text-red-800 font-bold mb-1">{pParam.label}</span>
              <span className="text-4xl font-black text-red-600 font-mono">
                {state.parameters['p']?.toFixed(0)} {pParam.unit}
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
