import React from 'react';
import { SimulationState, SimParameter } from '../../types/simulation';
import { Trash2, Download } from 'lucide-react';

interface DataTableProps {
  state: SimulationState;
  parameters: SimParameter[];
  onClear: () => void;
}

export function DataTable({ state, parameters, onClear }: DataTableProps) {
  if (state.measurements.length === 0) {
    return (
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 text-center text-slate-500 font-medium">
        Chưa có dữ liệu. Nhấn "Ghi dữ liệu" để bắt đầu.
      </div>
    );
  }

  // Filter out time if it's not a relevant parameter for this simulation (e.g. Ohm's Law)
  // But we'll just show all defined parameters.
  const displayParams = parameters.filter(p => p.type === 'number');

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b-2 border-slate-100 bg-slate-50">
        <h3 className="font-bold text-slate-800">Bảng dữ liệu ({state.measurements.length})</h3>
        <div className="flex gap-2">
           <button onClick={onClear} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa dữ liệu">
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b-2 border-slate-100">
            <tr>
              <th className="px-4 py-3">Lần đo</th>
              {displayParams.map(p => (
                <th key={p.id} className="px-4 py-3">{p.symbol} ({p.unit})</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.measurements.map((m, idx) => (
              <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-500">{idx + 1}</td>
                {displayParams.map(p => (
                  <td key={p.id} className="px-4 py-3 font-mono text-slate-700">
                    {m[p.id]?.toFixed(2) ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
