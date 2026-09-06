import { useEffect, useState } from "react";
import { Search, History, Eye, X, Shield, Calendar, User, FileCode, CheckCircle2 } from "lucide-react";
import api from "../../lib/api";

interface AuditLogItem {
  id: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  resource?: string;
  userId?: string;
  userName?: string;
  metadata?: string | Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (query?: string) => {
    setLoading(true);
    try {
      const url = query ? `/audit-logs?search=${encodeURIComponent(query)}` : "/audit-logs";
      const response = await api.get(url);
      setLogs(response.data || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(search);
  };

  const visible = logs.filter((log) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(s) ||
      log.resourceType?.toLowerCase().includes(s) ||
      log.resource?.toLowerCase().includes(s) ||
      log.userName?.toLowerCase().includes(s) ||
      log.resourceId?.toLowerCase().includes(s)
    );
  });

  const getActionColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("TAO") || act.includes("JOIN")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (act.includes("DELETE") || act.includes("XOA") || act.includes("REMOVE")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (act.includes("UPDATE") || act.includes("GRADE") || act.includes("CHAM")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Nhật ký Hệ thống
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">
            Audit Logs ghi nhận các hoạt động thực tế từ database
          </p>
        </div>
        <button
          onClick={() => fetchLogs(search)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors self-start"
        >
          Làm mới
        </button>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="p-4 border-b-2 border-slate-100 relative">
          <Search className="w-5 h-5 absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm kiếm theo hành động, người thực hiện, hoặc tài nguyên..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm"
          />
        </form>

        <div className="p-6 space-y-3">
          {loading ? (
            <p className="text-center text-slate-400 font-bold py-8 italic">Đang tải nhật ký...</p>
          ) : visible.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-bold">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              Không tìm thấy nhật ký phù hợp.
            </div>
          ) : (
            visible.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 border-2 border-slate-100 hover:border-indigo-200 rounded-2xl transition-colors bg-white"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl mt-0.5">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      {log.userName && (
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {log.userName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {log.resource || `${log.resourceType || ""} ${log.resourceId || ""}`}
                    </p>
                    <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLog(log)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
                >
                  <Eye className="w-3.5 h-3.5" /> Chi tiết
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Chi tiết Audit Log</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedLog.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Hành động:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-black uppercase border ${getActionColor(selectedLog.action)}`}>
                  {selectedLog.action}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Người thực hiện:</span>
                <span className="font-bold text-slate-800">{selectedLog.userName || selectedLog.userId || "Hệ thống"}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Tài nguyên:</span>
                <span className="font-bold text-slate-800">{selectedLog.resource || selectedLog.resourceType || "—"}</span>
              </div>

              {selectedLog.resourceId && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-bold">Resource ID:</span>
                  <span className="font-mono text-xs text-slate-700">{selectedLog.resourceId}</span>
                </div>
              )}

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-bold">Thời gian ghi nhận:</span>
                <span className="font-medium text-slate-700">{new Date(selectedLog.createdAt).toLocaleString("vi-VN")}</span>
              </div>

              {selectedLog.ipAddress && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-bold">Địa chỉ IP:</span>
                  <span className="font-mono text-xs text-slate-700">{selectedLog.ipAddress}</span>
                </div>
              )}

              {selectedLog.metadata && (
                <div className="pt-2">
                  <span className="text-slate-500 font-bold block mb-1">Dữ liệu Metadata:</span>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs overflow-x-auto font-mono max-h-40">
                    {typeof selectedLog.metadata === "string"
                      ? selectedLog.metadata
                      : JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

