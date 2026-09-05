import React, { useState, useEffect, useRef } from 'react';
import { SimulationSpecification, SimulationState } from '../../types/simulation';
import { PhysicsEngine } from '../../services/simulation/PhysicsEngine';
import { DataTable } from './DataTable';
import { GraphViewer } from './GraphViewer';
import { Play, RotateCcw, AlertTriangle, Activity } from 'lucide-react';

interface OhmsLawSimulationProps {
  spec: SimulationSpecification;
}

export function OhmsLawSimulation({ spec }: OhmsLawSimulationProps) {
  const engineRef = useRef<PhysicsEngine | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);

  useEffect(() => {
    engineRef.current = new PhysicsEngine(spec);
    setState(engineRef.current.getState());
  }, [spec]);

  if (!state || !engineRef.current) return <div>Đang khởi tạo...</div>;

  const handleParamChange = (id: string, value: number) => {
    if (engineRef.current) {
      setState(engineRef.current.updateParameter(id, value));
    }
  };

  const handleMeasure = () => {
    if (engineRef.current) {
      setState(engineRef.current.takeMeasurement());
    }
  };

  const handleReset = () => {
    if (engineRef.current) {
      setState(engineRef.current.reset());
    }
  };
  
  const handleClearData = () => {
     if (engineRef.current) {
        // We can add clearMeasurements to PhysicsEngine or just mutate state here for simplicity
        // But better to let engine handle it. For now, mutate local state copy.
        const newState = { ...state, measurements: [] };
        // We should really update the engine's internal state too.
        engineRef.current['state'].measurements = [];
        setState(newState);
     }
  }

  const uParam = spec.parameters.find(p => p.id === 'U');
  const rParam = spec.parameters.find(p => p.id === 'R');
  const iParam = spec.parameters.find(p => p.id === 'I');

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      
      {state.status === 'ERROR' && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-red-800">Lỗi Vật Lý / Giới hạn</h4>
            <ul className="list-disc list-inside text-sm text-red-700 mt-1">
              {state.errors.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual / Circuit Area */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] shadow-inner">
           {/* Simple DOM-based Circuit Visualization for Ohm's Law */}
           <div className="absolute top-4 left-4 text-slate-400 font-bold tracking-widest text-sm opacity-50 uppercase">
             Circuit View
           </div>
           
           <div className="relative w-64 h-48 border-4 border-slate-600 rounded-xl flex items-center justify-center">
             {/* Battery */}
             <div className="absolute -left-6 top-1/2 -translate-y-1/2 bg-slate-800 p-2 rounded-lg border-2 border-slate-500 flex flex-col items-center">
                <div className="w-8 h-2 bg-slate-400 mb-1 rounded-full"></div>
                <div className="w-4 h-2 bg-slate-400 rounded-full"></div>
                <span className="text-xs text-yellow-400 font-bold mt-2">{state.parameters['U']?.toFixed(1)}V</span>
             </div>
             
             {/* Resistor */}
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-700 w-16 h-8 flex items-center justify-center border-2 border-amber-900 rounded-sm">
                <span className="text-amber-100 text-xs font-bold">{state.parameters['R']?.toFixed(1)}Ω</span>
             </div>
             
             {/* Ammeter */}
             <div className="absolute -right-8 top-1/2 -translate-y-1/2 bg-white w-12 h-12 rounded-full border-4 border-slate-400 flex flex-col items-center justify-center shadow-lg">
                <span className="text-lg font-black text-slate-800">A</span>
                <span className="text-[10px] font-bold text-blue-600">{state.parameters['I']?.toFixed(2)}A</span>
             </div>
             
             {/* Electron flow animation (simple) */}
             {state.parameters['U'] > 0 && state.parameters['R'] > 0 && (
                <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400/30 rounded-xl animate-pulse"></div>
             )}
           </div>
           
           <p className="text-slate-400 text-sm mt-12 text-center max-w-md">
             (Mô phỏng minh họa: Mạch điện kín gồm Nguồn điện, Điện trở và Ampe kế)
           </p>
        </div>

        {/* Controls Area */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-black text-lg text-slate-900 mb-6">Bảng Điều Khiển</h3>
          
          <div className="space-y-6 flex-1">
            {/* Voltage Control */}
            {uParam && (
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-bold text-slate-700">{uParam.label} ({uParam.symbol})</label>
                  <span className="font-mono font-bold text-blue-600">{state.parameters['U']?.toFixed(1)} {uParam.unit}</span>
                </div>
                <input 
                  type="range" 
                  min={uParam.min} 
                  max={uParam.max} 
                  step={uParam.step} 
                  value={state.parameters['U'] || 0}
                  onChange={(e) => handleParamChange('U', parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            )}

            {/* Resistance Control */}
            {rParam && (
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-bold text-slate-700">{rParam.label} ({rParam.symbol})</label>
                  <span className="font-mono font-bold text-amber-600">{state.parameters['R']?.toFixed(1)} {rParam.unit}</span>
                </div>
                <input 
                  type="range" 
                  min={rParam.min} 
                  max={rParam.max} 
                  step={rParam.step} 
                  value={state.parameters['R'] || 0}
                  onChange={(e) => handleParamChange('R', parseFloat(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
            )}
            
            {/* Calculated Output Display (Current) */}
            {iParam && (
              <div className="mt-8 bg-blue-50 border-2 border-blue-100 rounded-xl p-4 flex flex-col items-center justify-center">
                <span className="text-blue-800 font-bold mb-1">{iParam.label}</span>
                <span className="text-4xl font-black text-blue-600 font-mono">
                  {state.parameters['I']?.toFixed(3)} {iParam.unit}
                </span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
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

      {/* Analysis Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <DataTable state={state} parameters={spec.parameters} onClear={handleClearData} />
         
         {spec.charts && spec.charts.length > 0 ? (
           <GraphViewer state={state} chart={spec.charts[0]} parameters={spec.parameters} />
         ) : (
           <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-medium">
             Không có đồ thị
           </div>
         )}
      </div>

    </div>
  );
}
