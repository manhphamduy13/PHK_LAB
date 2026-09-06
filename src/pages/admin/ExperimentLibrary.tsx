import { useState } from "react";
import { FlaskConical, Search, Play } from "lucide-react";
import { VIRTUAL_LABS } from "../../data/simulations";
import { SimulationPlayer } from "../../components/simulation/SimulationPlayer";

export default function ExperimentLibrary() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const visible = VIRTUAL_LABS.filter((lab) =>
    `${lab.spec.title} ${lab.topic}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Thư viện Thí nghiệm
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">
          Danh mục mô phỏng chạy trên trình duyệt
        </p>
      </div>
      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <div className="p-4 border-b-2 border-slate-100 relative">
          <Search className="w-5 h-5 absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm thí nghiệm..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {visible.map((lab) => (
            <div
              key={lab.spec.id}
              className="border-2 border-slate-200 rounded-2xl overflow-hidden"
            >
              <div className="h-40 bg-slate-100 flex items-center justify-center">
                <FlaskConical className="w-12 h-12 text-blue-300" />
              </div>
              <div className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{lab.spec.title}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                    {lab.topic} · {lab.estMinutes} phút
                  </p>
                </div>
                <button
                  onClick={() => setSelected(lab.spec)}
                  title="Chạy mô phỏng"
                  className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl"
                >
                  <Play className="w-5 h-5" />
                </button>
              </div>
              {selected?.id === lab.spec.id && (
                <div className="p-4 border-t-2 border-slate-100">
                  <SimulationPlayer spec={lab.spec} />
                </div>
              )}
            </div>
          ))}
          {visible.length === 0 && (
            <p className="col-span-full p-8 text-center text-slate-500 font-bold">
              Không tìm thấy thí nghiệm.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
