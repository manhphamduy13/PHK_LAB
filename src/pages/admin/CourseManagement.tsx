import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Layers,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../lib/api";

export default function CourseManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      setCourses(response.data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const visibleCourses = courses.filter((course) => {
    const matchesSearch = String(course.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch && (!subject || course.subject === subject);
  });

  const handleCreateCourse = async () => {
    const title = prompt("Tên khóa học mới:");
    if (!title) return;
    try {
      await api.post("/courses", { title });
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert(
        `Lỗi tạo khóa học: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const handleCreateChapter = async (courseId: string) => {
    const title = prompt("Tên chương mới:");
    if (!title) return;
    try {
      await api.post(`/courses/${courseId}/chapters`, { title });
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert(
        `Lỗi tạo chương: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const handleCreateLesson = async (chapterId: string) => {
    const title = prompt("Tên bài giảng mới:");
    if (!title) return;
    try {
      const res = await api.post(`/courses/chapters/${chapterId}/lessons`, {
        title,
      });
      // We could navigate to the lesson editor, but for now just refresh
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert(
        `Lỗi tạo bài giảng: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const handleEditCourse = async (courseId: string, oldTitle: string) => {
    const title = prompt("Tên khóa học mới:", oldTitle);
    if (!title || title === oldTitle) return;
    try {
      await api.put(`/courses/${courseId}`, { title });
      fetchCourses();
    } catch (err) {
      alert("Lỗi sửa khóa học");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return;
    try {
      await api.delete(`/courses/${courseId}`);
      fetchCourses();
    } catch (err) {
      alert("Lỗi xóa khóa học");
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!window.confirm("Xóa chương này?")) return;
    try {
      await api.delete(`/courses/chapters/${chapterId}`);
      fetchCourses();
    } catch (err) {
      alert("Lỗi xóa chương");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm("Xóa bài giảng này?")) return;
    try {
      await api.delete(`/courses/lessons/${lessonId}`);
      fetchCourses();
    } catch (err) {
      alert("Lỗi xóa bài giảng");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        Đang tải...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Quản lý Khóa học
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">
            Quản lý nội dung, chương mục, và bài giảng
          </p>
        </div>
        <button
          onClick={handleCreateCourse}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all border-b-4 border-blue-700 active:border-b-0 active:translate-y-1"
        >
          <Plus className="w-5 h-5" /> Khóa học mới
        </button>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <div className="p-4 border-b-2 border-slate-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-colors"
            />
          </div>
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">Tất cả môn học</option>
            <option value="Vật Lý">Vật Lý</option>
            <option value="Hóa Học">Hóa Học</option>
          </select>
        </div>

        <div className="divide-y-2 divide-slate-100">
          {visibleCourses.map((course) => (
            <div key={course.id}>
              <div
                className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() =>
                  setExpandedCourse(
                    expandedCourse === course.id ? null : course.id,
                  )
                }
              >
                <div className="text-slate-400">
                  {expandedCourse === course.id ? (
                    <ChevronDown className="w-6 h-6" />
                  ) : (
                    <ChevronRight className="w-6 h-6" />
                  )}
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500">
                  <Layers className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">
                      {course.grade}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">
                      {course.subject}
                    </span>
                    <span className="text-sm font-bold text-slate-400">
                      {course.lessons} bài giảng
                    </span>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-3 py-1.5 text-xs font-black rounded-lg uppercase tracking-wider ${
                      course.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCourse(course.id, course.title);
                    }}
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.id);
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Course Chapters Expanded */}
              {expandedCourse === course.id && (
                <div className="bg-slate-50 border-t-2 border-slate-100 p-6 pl-24">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black text-slate-700 uppercase tracking-wider text-sm">
                      Cấu trúc Chương mục
                    </h4>
                    <button
                      onClick={() => handleCreateChapter(course.id)}
                      className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Thêm chương
                    </button>
                  </div>

                  <div className="space-y-3">
                    {course.chapters?.map((chapter: any) => (
                      <div
                        key={chapter.id}
                        className="bg-white border-2 border-slate-200 rounded-xl p-4 flex items-center gap-4 group"
                      >
                        <div className="cursor-grab opacity-50 group-hover:opacity-100">
                          <GripVertical className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 font-bold text-slate-800">
                          {chapter.title}
                        </div>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => handleCreateLesson(chapter.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 mr-2"
                          >
                            <Plus className="w-4 h-4" /> Thêm bài giảng
                          </button>
                          {chapter.lessons?.map((lesson: any) => (
                            <div
                              key={lesson.id}
                              className="flex items-center group/lesson"
                            >
                              <Link
                                to={`/admin/lessons/${lesson.id}/editor`}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-l-lg text-sm font-bold hover:bg-slate-100 border border-slate-200 border-r-0"
                              >
                                {lesson.title}
                              </Link>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="p-1.5 border border-slate-200 border-l-0 rounded-r-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 ml-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!course.chapters || course.chapters.length === 0) && (
                      <div className="text-sm text-slate-400 font-medium italic">
                        Chưa có chương nào.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {visibleCourses.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-bold">
              Không tìm thấy khóa học.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
