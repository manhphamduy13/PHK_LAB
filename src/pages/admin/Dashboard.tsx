import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Activity,
  FlaskConical,
  Target,
  CheckCircle,
  Bot,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    courses: 0,
    lessons: 0,
    exercises: 0,
    aiContent: 0,
    published: 0,
    questions: 0,
    recentActivity: [] as any[],
    students: [] as any[],
  });
  const { token } = useAuthStore();

  useEffect(() => {
    fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Không tải được thống kê")),
      )
      .then(setStats)
      .catch(console.error);
  }, [token]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 mt-1 font-bold uppercase tracking-wider text-sm">
          Chào mừng quay trở lại, Phạm Hữu Khê.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border-2 border-b-4 border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Học sinh
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900">
              {stats.totalStudents}
            </p>
            <span className="text-sm font-bold text-emerald-500">
              ({stats.activeStudents} active)
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-b-4 border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Khóa học
          </p>
          <p className="text-3xl font-black text-slate-900">{stats.courses}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-b-4 border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4 shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Bài giảng
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900">
              {stats.lessons}
            </p>
            <span className="text-sm font-bold text-blue-500">
              ({stats.published} published)
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-b-4 border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4 shadow-sm">
            <Target className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Bài tập
          </p>
          <p className="text-3xl font-black text-slate-900">
            {stats.exercises}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border-2 border-b-4 border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b-2 border-slate-100">
            <h2 className="text-xl font-black text-slate-900">
              Hoạt động gần đây
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {stats.recentActivity.length === 0 && (
              <p className="text-slate-500 font-medium">
                Chưa có hoạt động thực tế.
              </p>
            )}
            {stats.recentActivity.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-200 transition-colors bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-black text-blue-600">
                  {activity.action.slice(0, 1)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {activity.title || `${activity.action} ${activity.resourceType}`}{" "}
                    {!activity.title && (activity.resourceId || "")}
                  </p>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-1">
                    {new Date(activity.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            ))}

            {stats.students.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-black text-slate-900 mb-4">
                  Học sinh trong lớp của bạn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stats.students.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-100 bg-white"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-600">
                        {(student.name || "U").charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500 font-bold">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-b-4 border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b-2 border-slate-100">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-500" />
              Nội dung AI (Phase 3 Prep)
            </h2>
          </div>
          <div className="p-6">
            <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-3xl text-purple-900">
              <h3 className="font-black text-xl mb-2">Thống kê nội dung AI</h3>
              <p className="text-sm font-medium mb-6">
                Đã chuẩn bị sẵn sàng cho việc sinh nội dung hàng loạt ở Phase 3.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border-2 border-purple-100 text-center">
                  <div className="text-3xl font-black text-purple-600">
                    {stats.aiContent}
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase mt-1">
                    Bài giảng tạo bởi AI
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border-2 border-purple-100 text-center">
                  <div className="text-3xl font-black text-purple-600">
                    {stats.questions}
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase mt-1">
                    Câu hỏi AI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
