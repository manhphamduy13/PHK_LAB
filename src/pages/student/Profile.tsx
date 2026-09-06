import { useStudentStore } from "../../store/studentStore";
import { useAuthStore } from "../../store/authStore";
import {
  Settings,
  LogOut,
  BookOpen,
  Flame,
  Target,
  Award,
  Users,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  School,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

interface EnrolledClass {
  id: string;
  name: string;
  grade: number;
  joinCode: string;
  teacherName?: string;
  studentCount?: number;
  enrolledAt?: string;
}

export default function Profile() {
  const { user, logout } = useAuthStore();
  const {
    xp,
    level,
    streak,
    lessonsCompleted,
    badgesCount,
    accuracyRate,
    grade,
    fetchProfile,
  } = useStudentStore();
  const navigate = useNavigate();

  const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMsg, setJoinMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchEnrolledClasses();
  }, [fetchProfile]);

  const fetchEnrolledClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await api.get("/classes/my-enrolled");
      setEnrolledClasses(res.data?.classes || []);
    } catch (err) {
      console.error("Failed to fetch enrolled classes:", err);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setJoinLoading(true);
    setJoinMsg(null);
    try {
      const res = await api.post("/classes/join", { joinCode: joinCodeInput.trim().toUpperCase() });
      setJoinMsg({ type: "success", text: res.data?.message || "Tham gia lớp học thành công!" });
      setJoinCodeInput("");
      fetchEnrolledClasses();
    } catch (err: any) {
      setJoinMsg({
        type: "error",
        text: err.response?.data?.error || "Mã lớp không hợp lệ hoặc đã tham gia lớp này.",
      });
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border-2 border-b-4 border-slate-200 text-center relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            title="Đổi mật khẩu"
            className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <div className="w-32 h-32 mx-auto bg-blue-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-5xl font-black mb-4 relative z-10">
          {user?.name?.charAt(0) || "U"}
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-1">{user?.name}</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-6">
          {grade ? `Học sinh lớp ${grade}` : "Học sinh"}
        </p>

        <div className="flex justify-center gap-6 border-t-2 border-slate-100 pt-6">
          <div className="text-center">
            <div className="text-2xl font-black text-blue-600 mb-1">{level}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấp độ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-amber-500 mb-1">{xp}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">XP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-500 mb-1">{streak}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chuỗi ngày (Streak)</div>
          </div>
        </div>
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-b-4 border-slate-200">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">{lessonsCompleted}</div>
          <div className="text-xs font-bold text-slate-500">Bài hoàn thành</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-b-4 border-slate-200">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-3">
            <Flame className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">{streak} ngày</div>
          <div className="text-xs font-bold text-slate-500">Chuỗi học tập</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-b-4 border-slate-200">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
            <Target className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {accuracyRate !== null && accuracyRate !== undefined ? `${accuracyRate}%` : "—"}
          </div>
          <div className="text-xs font-bold text-slate-500">Độ chính xác</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-b-4 border-slate-200">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">{badgesCount}</div>
          <div className="text-xs font-bold text-slate-500">Huy hiệu</div>
        </div>
      </div>

      {/* Classroom Enrollment Section */}
      <div className="bg-white p-6 rounded-3xl border-2 border-b-4 border-slate-200 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Lớp học của tôi</h2>
              <p className="text-xs text-slate-500 font-medium">Tham gia lớp học bằng mã do giáo viên cung cấp</p>
            </div>
          </div>
        </div>

        {/* Join Code Form */}
        <form onSubmit={handleJoinClass} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
            placeholder="Nhập mã lớp (VD: PHK8X2)"
            maxLength={10}
            className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono uppercase font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={joinLoading || !joinCodeInput.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md active:translate-y-[1px]"
          >
            {joinLoading ? "Đang xử lý..." : "Tham gia lớp"}
          </button>
        </form>

        {joinMsg && (
          <div
            className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
              joinMsg.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {joinMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {joinMsg.text}
          </div>
        )}

        {/* Enrolled Classes List */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Các lớp đang tham gia ({enrolledClasses.length})
          </h3>
          {loadingClasses ? (
            <p className="text-sm text-slate-400 italic">Đang tải danh sách lớp...</p>
          ) : enrolledClasses.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500">Bạn chưa tham gia lớp học nào.</p>
              <p className="text-xs text-slate-400 mt-1">Hãy xin mã lớp từ giáo viên để nhận bài tập và thông báo!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {enrolledClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-2xl transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{cls.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Khối {cls.grade} • GV: {cls.teacherName || "Chưa rõ"}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-mono font-bold rounded">
                      {cls.joinCode}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {cls.studentCount || 1} học sinh
                    </span>
                    {cls.enrolledAt && (
                      <span>Tham gia: {new Date(cls.enrolledAt).toLocaleDateString("vi-VN")}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 font-black rounded-2xl border-2 border-b-4 border-red-200 hover:bg-red-100 active:border-b-2 active:translate-y-[2px] transition-all"
      >
        <LogOut className="w-5 h-5" />
        Đăng xuất
      </button>

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
                <h3 className="text-lg font-black text-slate-900">Đổi mật khẩu</h3>
                <p className="text-xs text-slate-500">Cập nhật mật khẩu tài khoản của bạn</p>
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

