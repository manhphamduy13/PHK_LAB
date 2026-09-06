import { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Shield,
} from "lucide-react";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const visibleUsers = users.filter((item) => {
    const query = search.toLowerCase();
    return (
      (!query || `${item.name} ${item.email}`.toLowerCase().includes(query)) &&
      (!role || item.role === role)
    );
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xóa người dùng này?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert("Lỗi xóa người dùng");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Quản lý Người dùng
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">
            Học sinh & Giáo viên
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <div className="p-4 border-b-2 border-slate-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-colors"
            />
          </div>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">Tất cả vai trò</option>
            <option value="STUDENT">STUDENT</option>
            <option value="TEACHER">TEACHER</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center font-bold text-slate-500">
              Đang tải...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="p-4 font-black text-slate-600 uppercase tracking-wider text-sm">
                    Người dùng
                  </th>
                  <th className="p-4 font-black text-slate-600 uppercase tracking-wider text-sm">
                    Vai trò
                  </th>
                  <th className="p-4 font-black text-slate-600 uppercase tracking-wider text-sm">
                    Trạng thái
                  </th>
                  <th className="p-4 font-black text-slate-600 uppercase tracking-wider text-sm">
                    Hoạt động cuối
                  </th>
                  <th className="p-4 font-black text-slate-600 uppercase tracking-wider text-sm text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-50">
                {visibleUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600">
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 font-bold">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wider flex items-center gap-1 w-max ${
                          user.role === "TEACHER"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "SUPER_ADMIN"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {(user.role === "TEACHER" ||
                          user.role === "SUPER_ADMIN") && (
                          <Shield className="w-3 h-3" />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {user.status === "ACTIVE" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-sm font-bold text-slate-700">
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-500">
                      {user.lastActive}
                    </td>
                    <td className="p-4 text-center">
                      {currentUser?.id !== user.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
