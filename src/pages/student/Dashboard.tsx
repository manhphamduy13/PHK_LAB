import { useAuthStore } from "../../store/authStore";
import { useStudentStore } from "../../store/studentStore";
import { Link } from "react-router-dom";
import {
  Play,
  Trophy,
  Star,
  BookOpen,
  Clock,
  Flame,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { xp, level, streak, lessonsCompleted, weeklyGoal, fetchProfile } =
    useStudentStore();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setCourses(data.slice(0, 2));
      } catch (err) {}
    };
    fetchCourses();
  }, [fetchProfile]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Profile Section */}
      <div className="bg-blue-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-black border-4 border-white/30 shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Xin chào, {user?.name}! 👋
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                <Star className="w-4 h-4 fill-current text-yellow-300" />
                Level {level}
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                <Trophy className="w-4 h-4 text-orange-300" />
                {xp} XP
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                <Flame className="w-4 h-4 text-red-400 fill-current" />
                {streak} Ngày Streak
              </span>
            </div>
          </div>
        </div>
        <div className="relative z-10 bg-white/10 p-4 rounded-2xl backdrop-blur-sm w-full md:w-auto text-center border-2 border-white/20">
          <div className="text-sm font-bold mb-2 uppercase tracking-wider text-blue-100 flex items-center justify-center gap-1">
            <Target className="w-4 h-4" /> Mục tiêu tuần
          </div>
          <div className="text-3xl font-black">
            {weeklyGoal.current} / {weeklyGoal.target}
          </div>
          <div className="text-xs mt-1 text-blue-200">bài học</div>
        </div>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute right-32 top-8 text-8xl opacity-20 hidden md:block">
          🚀
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Tiếp tục học
              </h2>
            </div>
            <div className="bg-white rounded-3xl border-2 border-b-4 border-slate-200 overflow-hidden hover:border-blue-500 transition-colors group">
              <div className="h-2 w-full bg-slate-100">
                <div className="h-full bg-blue-500 w-[65%] rounded-r-full" />
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-24 h-24 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-500">
                    <BookOpen className="w-10 h-10" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold mb-2">
                      Vật Lý 10
                    </span>
                    <h3 className="text-xl font-bold mb-2 text-slate-900">
                      Bài 4: Chuyển động thẳng biến đổi đều
                    </h3>
                    <p className="text-sm text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
                      <Clock className="w-4 h-4" /> Còn khoảng 15 phút
                    </p>
                  </div>
                  <Link to="/student/lessons/l3" className="w-full md:w-auto">
                    <button className="w-full md:w-auto px-6 py-3 bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all group-hover:bg-blue-400">
                      <Play className="w-5 h-5 fill-current" />
                      Tiếp tục
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Recommended Courses */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Khóa học của bạn
              </h2>
              <Link
                to="/student/courses"
                className="text-blue-500 font-bold hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {courses.map((course, i) => (
                <Link
                  to={`/student/courses/${course.id}`}
                  key={course.id}
                  className="bg-white p-6 rounded-3xl border-2 border-b-4 border-slate-200 hover:border-blue-500 transition-colors group cursor-pointer block"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${i === 1 ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-purple-600"}`}
                  >
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-slate-900">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-4">
                    {course.subject}
                  </p>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                </Link>
              ))}
              {courses.length === 0 && (
                <div className="col-span-full text-center p-8 text-slate-500 font-medium border-2 border-slate-100 border-dashed rounded-3xl">
                  Chưa có khóa học nào
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 border-2 border-b-4 border-slate-200">
            <h3 className="font-black text-xl mb-6 text-slate-900">
              Tiến độ tuần này
            </h3>
            <div className="h-40 flex items-end gap-2 justify-between">
              {[40, 70, 45, 90, 60, 20, 0].map((h, i) => (
                <div
                  key={i}
                  className="w-8 bg-blue-50 rounded-t-lg relative group h-full flex items-end"
                >
                  <div
                    className={`w-full rounded-t-lg transition-all ${i === 3 ? "bg-blue-500" : "bg-slate-200"}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span className="text-blue-500">T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-b-4 border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-slate-900">
                Thành tựu gần đây
              </h3>
              <Link
                to="/student/achievements"
                className="text-sm font-bold text-blue-500"
              >
                Xem
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 text-2xl shadow-sm">
                  🎯
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Chính xác tuyệt đối
                  </h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Đạt 10/10 bài kiểm tra
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl shadow-sm">
                  🔬
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Nhà khoa học trẻ
                  </h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Hoàn thành 5 thí nghiệm
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
