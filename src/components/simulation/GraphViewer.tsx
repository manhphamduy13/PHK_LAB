import React from 'react';
import { SimulationState, SimChart, SimParameter } from '../../types/simulation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';

interface GraphViewerProps {
  state: SimulationState;
  chart: SimChart;
  parameters: SimParameter[];
}

export function GraphViewer({ state, chart, parameters }: GraphViewerProps) {
  const xParam = parameters.find(p => p.id === chart.xAxis);
  const yParam = parameters.find(p => p.id === chart.yAxis);

  if (!xParam || !yParam) return null;

  // Format data for recharts
  const data = state.measurements.map(m => ({
    x: m[chart.xAxis],
    y: m[chart.yAxis],
  }));

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col h-full min-h-[300px]">
      <h3 className="font-bold text-slate-800 mb-4 text-center">{chart.title}</h3>
      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === 'scatter' ? (
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name={xParam.label} 
                unit={xParam.unit} 
                stroke="#64748b" 
                tick={{fill: '#64748b'}} 
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name={yParam.label} 
                unit={yParam.unit} 
                stroke="#64748b" 
                tick={{fill: '#64748b'}} 
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Data" data={data} fill="#3b82f6" line shape="circle" />
            </ScatterChart>
          ) : (
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                type="number"
                dataKey="x" 
                name={xParam.label}
                unit={xParam.unit}
                stroke="#64748b"
                tick={{fill: '#64748b'}}
              />
              <YAxis 
                type="number"
                dataKey="y"
                name={yParam.label}
                unit={yParam.unit}
                stroke="#64748b"
                tick={{fill: '#64748b'}}
              />
              <Tooltip />
              <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2 text-sm text-slate-500 font-medium">
        Trục X: {xParam.symbol} ({xParam.unit}) — Trục Y: {yParam.symbol} ({yParam.unit})
      </div>
    </div>
  );
}
