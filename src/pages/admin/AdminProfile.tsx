import { useState, useEffect } from "react";
import {
  Shield,
  BookOpen,
  Clock,
  Settings,
  LogOut,
  Users,
  Layers,
  FileText,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  History,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

interface AdminStats {
  totalStudents: number;
  activeStudents: number;
  courses: number;
  lessons: number;
  published: number;
  exercises: number;
  questions: number;
  aiContent: number;
}

interface AuditItem {
  id: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  resource?: string;
  userName?: string;
  createdAt: string;
}

export default function AdminProfile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, logsRes] = await Promise.allSettled([
          api.get("/admin/stats"),
          api.get("/audit-logs?limit=8"),
        ]);

        if (statsRes.status === "fulfilled") {
          setStats(statsRes.value.data);
        }
        if (logsRes.status === "fulfilled") {
          setRecentLogs(Array.isArray(logsRes.value.data) ? logsRes.value.data : []);
        }
      } catch (err) {
        console.error("Failed to load admin profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 8) {
      setPasswordStatus({ type: "error", text: "Mật khẩu mới phải có ít nhất 8 ký tự." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    setChangingPassword(true);
    try {
      await api.post("/users/me/password", { currentPassword, newPassword });
      setPasswordStatus({ type: "success", text: "Đổi mật khẩu thành công!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordStatus(null);
      }, 1500);
    } catch (error: any) {
      setPasswordStatus({
        type: "error",
        text: error.response?.data?.error || error.message || "Không thể đổi mật khẩu.",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden relative shadow-sm">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 mb-6 gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-blue-600 overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || "Teacher")}`}
                alt="Avatar"
                className="w-full h-full bg-blue-50 object-cover"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors text-sm"
              >
                <Settings className="w-4 h-4" /> Đổi mật khẩu
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl flex items-center gap-2 hover:bg-red-100 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black text-slate-900">{user?.name || "Giáo viên"}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1 flex items-center gap-2">
              {user?.email} • Nền tảng Giáo dục PHK_LAB
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {user?.role === "SUPER_ADMIN" ? (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black rounded-lg uppercase flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Quản trị viên (Super Admin)
                </span>
              ) : (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-lg uppercase flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Giáo viên (Teacher)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Thống kê hoạt động giảng dạy & nội dung
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border-2 border-b-4 border-slate-200">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {loading ? "..." : stats?.totalStudents ?? 0}
            </div>
            <div className="text-xs font-bold text-slate-500">Học sinh theo học</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border-2 border-b-4 border-slate-200">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {loading ? "..." : stats?.courses ?? 0}
            </div>
            <div className="text-xs font-bold text-slate-500">Khóa học quản lý</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border-2 border-b-4 border-slate-200">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {loading ? "..." : stats?.lessons ?? 0}
            </div>
            <div className="text-xs font-bold text-slate-500">
              Bài giảng ({stats?.published ?? 0} đã công bố)
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border-2 border-b-4 border-slate-200">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {loading ? "..." : stats?.exercises ?? 0}
            </div>
            <div className="text-xs font-bold text-slate-500">Bài tập & Thử thách</div>
          </div>
        </div>
      </div>

      {/* Activity Log Section */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200">
        <div className="flex items-center justify-between mb-4 border-b pb-4">
          <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> Hoạt động gần đây
          </h3>
          <span className="text-xs text-slate-400 font-bold">
            {recentLogs.length} ghi nhận mới nhất
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 italic py-4">Đang tải nhật ký...</p>
        ) : recentLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">Chưa có ghi nhận hoạt động nào gần đây.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-sm"
              >
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {log.resource ? `Tài nguyên: ${log.resource}` : `${log.resourceType || ""} ${log.resourceId || ""}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Đổi mật khẩu tài khoản</h3>
                <p className="text-xs text-slate-500">Cập nhật mật khẩu để bảo vệ tài khoản</p>
              </div>
            </div>

            {passwordStatus && (
              <div
                className={`p-3 rounded-xl text-sm font-medium mb-4 flex items-center gap-2 ${
                  passwordStatus.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {passwordStatus.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                {passwordStatus.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mật khẩu mới (tối thiểu 8 ký tự)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {changingPassword ? "Đang lưu..." : "Đổi mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

