import { useState, useEffect } from "react";
import { Search, Filter, BookOpen, Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../lib/api";

const GRADES = [
  {
    id: "primary",
    name: "Tiểu học",
    icon: "🎨",
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: "middle",
    name: "THCS",
    icon: "🔬",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "high",
    name: "THPT",
    icon: "🧬",
    color: "bg-purple-100 text-purple-600",
  },
];

const SUBJECTS = ["Toán Học", "Vật Lý", "Hóa Học", "Sinh Học", "Tin Học"];

export default function CourseExplorer() {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [subject, setSubject] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCourseColor = (index: number) => {
    const colors = [
      "bg-emerald-50 text-emerald-600 border-emerald-200",
      "bg-blue-50 text-blue-600 border-blue-200",
      "bg-amber-50 text-amber-600 border-amber-200",
      "bg-purple-50 text-purple-600 border-purple-200",
    ];
    return colors[index % colors.length];
  };

  const visibleCourses = courses.filter((course) => {
    const haystack =
      `${course.title || ""} ${course.subject || ""}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesGrade =
      !selectedGrade ||
      String(course.grade || "")
        .toLowerCase()
        .includes(
          selectedGrade === "primary"
            ? "tiểu"
            : selectedGrade === "middle"
              ? "thcs"
              : "thpt",
        );
    const matchesSubject = !subject || course.subject === subject;
    return matchesSearch && matchesGrade && matchesSubject;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border-2 border-b-4 border-slate-200">
        <h1 className="text-3xl font-black text-slate-900 mb-4">
          Khám phá Khóa học
        </h1>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm môn học, chủ đề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters((value) => !value)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl border-2 border-slate-200 hover:bg-slate-200 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Lọc
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSubject("")}
              className={`px-3 py-2 rounded-lg text-sm font-bold border-2 ${!subject ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}
            >
              Tất cả môn
            </button>
            {SUBJECTS.map((item) => (
              <button
                key={item}
                onClick={() => setSubject(item)}
                className={`px-3 py-2 rounded-lg text-sm font-bold border-2 ${subject === item ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grades Selection */}
      <section>
        <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-current" />
          Chọn Cấp Học
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GRADES.map((grade) => (
            <div
              key={grade.id}
              onClick={() =>
                setSelectedGrade(grade.id === selectedGrade ? null : grade.id)
              }
              className={`p-6 rounded-3xl border-2 border-b-4 cursor-pointer transition-all ${
                selectedGrade === grade.id
                  ? "border-blue-500 bg-blue-50 scale-[1.02]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${grade.color}`}
                >
                  {grade.icon}
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900">
                    {grade.name}
                  </h3>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">
                    Lớp{" "}
                    {grade.id === "primary"
                      ? "1-5"
                      : grade.id === "middle"
                        ? "6-9"
                        : "10-12"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Courses List */}
      <section>
        <h2 className="text-xl font-black text-slate-900 mb-4">
          Các khóa học nổi bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-8 text-center text-slate-500 font-bold">
              Đang tải...
            </div>
          ) : (
            visibleCourses.map((course, index) => {
              const colorClass = getCourseColor(index);
              return (
                <Link
                  to={`/student/courses/${course.id}`}
                  key={course.id}
                  className="block group"
                >
                  <div className="bg-white rounded-3xl p-6 border-2 border-b-4 border-slate-200 group-hover:border-blue-500 transition-all group-hover:-translate-y-1 h-full flex flex-col">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 border-2 ${colorClass}`}
                    >
                      {course.image || "📚"}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                        {course.grade || "Lớp"}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                        {course.subject || "Môn"}
                      </span>
                    </div>
                    <h3 className="font-black text-xl text-slate-900 mb-2 leading-tight">
                      {course.title}
                    </h3>
                    <div className="mt-auto pt-4 flex items-center justify-between text-slate-500 font-bold text-sm">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.chapters?.length || 0} chương
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
          {!loading && visibleCourses.length === 0 && (
            <div className="col-span-full p-8 text-center text-slate-500 font-bold">
              Không tìm thấy khóa học phù hợp.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
