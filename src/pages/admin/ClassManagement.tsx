import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Target,
  BarChart2,
  BookOpen,
  Trash2,
  Upload,
  X,
  Copy,
  Check,
  Award,
  Calendar,
  FileText,
  UserPlus,
  Clock,
  Send,
  Download,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function ClassManagement() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"students" | "assignments" | "heatmap">("students");
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Students state
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Assignments state
  const [assignments, setAssignments] = useState<any[]>([]);
  const [lessonOptions, setLessonOptions] = useState<any[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lessonId: "",
    exerciseId: "",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    type: "EXERCISE",
  });
  const [attachFile, setAttachFile] = useState<any>(null);

  // Grading modal state
  const [gradingAssignment, setGradingAssignment] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingScores, setGradingScores] = useState<Record<string, { score: number | string; feedback: string }>>({});

  const { token } = useAuthStore();

  const currentClass = classes.find((c) => c.id === selectedClass);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0].id);
      }
    } catch (err) {
      console.error("Load classes error:", err);
    }
  };

  const fetchStudents = async (classId: string) => {
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/classes/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Load students error:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchAssignments = async (classId: string) => {
    try {
      const res = await fetch(`/api/assignments/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Load assignments error:", err);
    }
  };

  const fetchHeatmap = async (classId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/class/${classId}/heatmap`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHeatmap(data.heatmap || []);
      }
    } catch (err) {
      console.error("Load heatmap error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [lessonRes, exerciseRes] = await Promise.all([
        fetch("/api/assignments/lesson-options", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/assignments/exercise-options", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (lessonRes.ok) setLessonOptions(await lessonRes.json());
      if (exerciseRes.ok) setExerciseOptions(await exerciseRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClasses();
    loadOptions();
  }, [token]);

  useEffect(() => {
    if (!selectedClass) return;
    fetchStudents(selectedClass);
    fetchAssignments(selectedClass);
    fetchHeatmap(selectedClass);
  }, [selectedClass, token]);

  const handleCreateClass = async () => {
    const name = window.prompt("Tên lớp mới (Ví dụ: 10A1):");
    if (!name?.trim()) return;
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Không thể tạo lớp");
      }
      const created = await response.json();
      setClasses((current) => [...current, created]);
      setSelectedClass(created.id);
      alert(`Đã tạo lớp ${created.name} thành công! Mã lớp: ${created.joinCode}`);
    } catch (error) {
      alert(`Lỗi: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleCopyCode = () => {
    if (!currentClass?.joinCode) return;
    navigator.clipboard.writeText(currentClass.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddStudent = async () => {
    if (!studentEmail.trim() || !selectedClass) return;
    try {
      const res = await fetch(`/api/classes/${selectedClass}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: studentEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể thêm học sinh");
      }
      alert(data.message || "Đã thêm học sinh thành công!");
      setStudentEmail("");
      setShowAddStudent(false);
      fetchStudents(selectedClass);
    } catch (err: any) {
      alert(err.message || "Lỗi khi thêm học sinh");
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn gỡ học sinh "${studentName}" khỏi lớp?`)) return;
    try {
      const res = await fetch(`/api/classes/${selectedClass}/students/${studentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Không thể gỡ học sinh");
      }
      alert("Đã gỡ học sinh khỏi lớp");
      if (selectedClass) fetchStudents(selectedClass);
    } catch (err: any) {
      alert(err.message || "Lỗi khi gỡ học sinh");
    }
  };

  const handleCreateAssignment = async () => {
    if (!formData.title?.trim() || !selectedClass || !formData.dueDate) {
      alert("Vui lòng nhập đủ tên bài tập và hạn chót");
      return;
    }
    const lessonId = formData.lessonId || undefined;
    const exerciseId = !lessonId ? formData.exerciseId || undefined : undefined;
    const body: any = {
      title: formData.title.trim(),
      description: formData.description,
      classId: selectedClass,
      lessonId,
      exerciseId,
      type: lessonId ? "LESSON" : "EXERCISE",
      startDate: new Date().toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
    };

    if (attachFile) {
      const reader = new FileReader();
      const buffer = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.readAsDataURL(attachFile);
      });
      body.attachFile = {
        data: buffer,
        filename: attachFile.name,
        mimeType: attachFile.type,
      };
    }

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Không thể giao bài");
      }
      alert("Đã giao bài cho lớp và gửi thông báo tới toàn bộ học sinh!");
      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        lessonId: "",
        exerciseId: "",
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        type: "EXERCISE",
      });
      setAttachFile(null);
      fetchAssignments(selectedClass);
    } catch (err: any) {
      alert(err.message || "Lỗi khi giao bài");
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm("Xóa bài tập này?")) return;
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Lỗi xóa");
      }
      if (selectedClass) fetchAssignments(selectedClass);
    } catch (err: any) {
      alert(err.message || "Lỗi xóa bài tập");
    }
  };

  const openGradingModal = async (assign: any) => {
    setGradingAssignment(assign);
    setLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/assignments/${assign.id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(Array.isArray(data) ? data : []);
        // Initialize grading scores map
        const initialMap: Record<string, { score: number | string; feedback: string }> = {};
        for (const s of data) {
          initialMap[s.studentId] = {
            score: s.score != null ? s.score : "",
            feedback: s.feedback || "",
          };
        }
        setGradingScores(initialMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSaveGrade = async (studentId: string) => {
    if (!gradingAssignment) return;
    const gradeData = gradingScores[studentId];
    if (!gradeData || gradeData.score === "") {
      alert("Vui lòng nhập điểm số (0 - 100)");
      return;
    }
    const numericScore = Number(gradeData.score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      alert("Điểm số phải từ 0 đến 100");
      return;
    }

    try {
      const res = await fetch(
        `/api/assignments/${gradingAssignment.id}/submissions/${studentId}/grade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: numericScore,
            feedback: gradeData.feedback || "",
          }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Lỗi khi lưu điểm");
      }
      alert("Đã lưu điểm và gửi thông báo cho học sinh!");
      // Refresh submissions
      openGradingModal(gradingAssignment);
      if (selectedClass) fetchAssignments(selectedClass);
    } catch (err: any) {
      alert(err.message || "Lỗi khi chấm điểm");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Quản lý Lớp học
          </h1>
          <p className="text-slate-500 font-bold mt-1">
            Theo dõi học sinh, giao bài và chấm điểm trực tiếp
          </p>
        </div>
        <button
          onClick={handleCreateClass}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl border-b-4 border-blue-800 hover:bg-blue-700 active:border-b-0 active:translate-y-1 transition-all font-black text-sm"
        >
          <Plus className="w-5 h-5" />
          Tạo lớp mới
        </button>
      </div>

      {/* Class Selector Carousel / List */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {classes.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedClass(c.id)}
            className={`px-6 py-4 rounded-2xl font-black border-2 flex items-center gap-3 transition-all shrink-0 ${
              selectedClass === c.id
                ? "bg-blue-600 text-white border-blue-700 shadow-md translate-y-[-2px]"
                : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {currentClass && (
        <div className="space-y-6">
          {/* Class Overview Banner */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900">
                  Lớp {currentClass.name}
                </h2>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-lg border border-blue-200">
                  Sĩ số: {students.length} học sinh
                </span>
              </div>
              <p className="text-slate-500 font-medium text-sm mt-1">
                Khối: {currentClass.gradeName || "Lớp 10"} · Giáo viên: {currentClass.teacherName || "Phạm Hữu Khê"}
              </p>
            </div>

            {/* Join Code Card */}
            <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 px-5 py-3 flex items-center gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  MÃ THAM GIA LỚP
                </p>
                <p className="text-2xl font-black tracking-widest text-blue-600 font-mono">
                  {currentClass.joinCode || "PHK-LAB"}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2.5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors"
                title="Sao chép mã lớp"
              >
                {copiedCode ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b-2 border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab("students")}
              className={`px-5 py-2.5 rounded-xl font-black text-sm transition-colors flex items-center gap-2 ${
                activeTab === "students"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Users className="w-4 h-4" /> Danh sách Học sinh ({students.length})
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-5 py-2.5 rounded-xl font-black text-sm transition-colors flex items-center gap-2 ${
                activeTab === "assignments"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BookOpen className="w-4 h-4" /> Bài tập đã giao ({assignments.length})
            </button>
            <button
              onClick={() => setActiveTab("heatmap")}
              className={`px-5 py-2.5 rounded-xl font-black text-sm transition-colors flex items-center gap-2 ${
                activeTab === "heatmap"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BarChart2 className="w-4 h-4" /> Concept Heatmap
            </button>
          </div>

          {/* TAB 1: STUDENTS LIST */}
          {activeTab === "students" && (
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Học sinh trong lớp
                  </h3>
                  <p className="text-slate-500 font-medium text-sm">
                    Học sinh có thể tự tham gia bằng mã lớp hoặc bạn có thể thêm thủ công
                  </p>
                </div>
                <button
                  onClick={() => setShowAddStudent((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                >
                  <UserPlus className="w-4 h-4" /> Thêm học sinh
                </button>
              </div>

              {showAddStudent && (
                <div className="p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/60 flex items-center gap-3">
                  <input
                    type="email"
                    placeholder="Nhập email học sinh (ví dụ: student1@phk.edu)..."
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-sm bg-white"
                  />
                  <button
                    onClick={handleAddStudent}
                    className="px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors text-sm"
                  >
                    Thêm vào lớp
                  </button>
                  <button
                    onClick={() => setShowAddStudent(false)}
                    className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {loadingStudents ? (
                <div className="py-12 text-center text-slate-400 font-bold">
                  Đang tải danh sách học sinh...
                </div>
              ) : students.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
                  Chưa có học sinh nào trong lớp. Hãy chia sẻ mã lớp{" "}
                  <span className="text-blue-600 font-black">{currentClass.joinCode}</span>{" "}
                  để học sinh tham gia!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((st) => (
                    <div
                      key={st.id}
                      className="border-2 border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:border-slate-200 transition-colors bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-black flex items-center justify-center text-lg shrink-0">
                          {st.name?.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 truncate">
                            {st.name}
                          </p>
                          <p className="text-xs text-slate-400 font-medium truncate">
                            {st.email}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] font-bold text-slate-500">
                            <span className="text-amber-600 font-black">
                              ⭐ {st.totalXp} XP
                            </span>
                            <span>📚 {st.lessonsCompleted} bài</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(st.id, st.name)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                        title="Xóa khỏi lớp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ASSIGNMENTS LIST & CREATION */}
          {activeTab === "assignments" && (
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Bài tập đã giao
                  </h3>
                  <p className="text-slate-500 font-medium text-sm">
                    Giao bài học, bài tập hoặc tài liệu thực hành cho học sinh trong lớp
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateForm((v) => !v)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Giao bài mới
                </button>
              </div>

              {showCreateForm && (
                <div className="p-6 rounded-3xl border-2 border-blue-200 bg-blue-50/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-blue-900 text-base">
                      Tạo bài tập mới cho lớp {currentClass.name}
                    </h4>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Tiêu đề bài tập *"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-bold text-sm bg-white"
                  />
                  <textarea
                    placeholder="Mô tả hoặc hướng dẫn làm bài..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-medium text-sm bg-white"
                    rows={2}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Gắn với bài giảng
                      </label>
                      <select
                        value={formData.lessonId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lessonId: e.target.value,
                            exerciseId: "",
                          })
                        }
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-sm bg-white"
                      >
                        <option value="">-- Chọn bài giảng --</option>
                        {lessonOptions.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Gắn với bộ bài tập
                      </label>
                      <select
                        value={formData.exerciseId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            exerciseId: e.target.value,
                            lessonId: "",
                          })
                        }
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-sm bg-white"
                      >
                        <option value="">-- Chọn bài tập --</option>
                        {exerciseOptions.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Hạn chót nộp bài *
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData({ ...formData, dueDate: e.target.value })
                        }
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-sm bg-white"
                      >
                      </input>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      File đính kèm (PDF đề bài / tài liệu tham khảo)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setAttachFile(e.target.files?.[0] || null)}
                      className="w-full text-sm font-bold"
                    />
                    {attachFile && (
                      <p className="text-xs text-blue-600 font-bold mt-1">
                        📎 {attachFile.name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleCreateAssignment}
                    className="w-full py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" /> Giao bài cho cả lớp
                  </button>
                </div>
              )}

              {assignments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
                  Chưa có bài tập nào được giao cho lớp này.
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border-2 border-slate-200 p-5 hover:border-blue-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-slate-900 text-base">
                            {item.title}
                          </h4>
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-black rounded-lg border border-slate-200">
                            {item.type}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> Hạn chót:{" "}
                            {new Date(item.dueDate).toLocaleDateString("vi-VN")}
                          </span>
                          <span className="text-blue-600 font-black">
                            📝 Đã nộp: {item.submittedCount ?? 0}/{item.totalAssigned ?? students.length}
                          </span>
                          <span className="text-emerald-600 font-black">
                            ✓ Đã chấm: {item.gradedCount ?? 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => openGradingModal(item)}
                          className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-black rounded-xl text-xs transition-colors"
                        >
                          Chấm bài & Xem nộp
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(item.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="Xóa bài tập"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HEATMAP */}
          {activeTab === "heatmap" && (
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 space-y-6">
              <h3 className="text-xl font-black text-slate-900">
                Bản đồ Khái niệm (Concept Mastery)
              </h3>
              {loading ? (
                <div className="h-48 flex items-center justify-center font-bold text-slate-400 animate-pulse">
                  Đang phân tích dữ liệu...
                </div>
              ) : heatmap.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center font-bold text-slate-400 text-center">
                  <Target className="w-12 h-12 mb-3 text-slate-300" />
                  Chưa có dữ liệu học tập từ học sinh lớp này.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {heatmap.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{h.conceptId}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase mt-1">
                          {h.studentCount} Học sinh
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg font-black text-sm ${
                          h.averageMastery < 50
                            ? "bg-rose-100 text-rose-700"
                            : h.averageMastery < 80
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {h.averageMastery}% Mastery
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CHẤM BÀI / XEM BÀI NỘP */}
      {gradingAssignment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-2 border-slate-200">
            <div className="p-6 border-b-2 border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Chấm bài: {gradingAssignment.title}
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Danh sách bài làm của học sinh
                </p>
              </div>
              <button
                onClick={() => setGradingAssignment(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {loadingSubmissions ? (
                <div className="py-12 text-center text-slate-400 font-bold">
                  Đang tải bài nộp...
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold">
                  Chưa có học sinh nào nộp bài cho bài tập này.
                </div>
              ) : (
                submissions.map((sub) => {
                  const currentScore = gradingScores[sub.studentId]?.score ?? "";
                  const currentFeedback = gradingScores[sub.studentId]?.feedback ?? "";

                  return (
                    <div
                      key={sub.id}
                      className="border-2 border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-black flex items-center justify-center text-sm">
                            {sub.studentName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">
                              {sub.studentName}
                            </p>
                            <p className="text-xs text-slate-400">{sub.studentEmail}</p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${
                            sub.status === "GRADED"
                              ? "bg-emerald-100 text-emerald-700"
                              : sub.status === "SUBMITTED"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {sub.status === "GRADED" ? `Đã chấm: ${sub.score}đ` : sub.status}
                        </span>
                      </div>

                      {/* Student submission content */}
                      {sub.submissionContent || sub.submissionComment ? (
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                            Nội dung bài làm:
                          </p>
                          <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap">
                            {sub.submissionContent || sub.submissionComment}
                          </p>
                        </div>
                      ) : null}

                      {sub.hasSubmissionFile && (
                        <div className="flex items-center gap-2">
                          <a
                            href={`/api/assignments/student-submissions/${sub.id}/file`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100"
                          >
                            <Download className="w-4 h-4" /> Tải file bài nộp
                          </a>
                        </div>
                      )}

                      {/* Grading Input Form */}
                      <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">
                            Điểm (0-100):
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={currentScore}
                            onChange={(e) =>
                              setGradingScores({
                                ...gradingScores,
                                [sub.studentId]: {
                                  ...gradingScores[sub.studentId],
                                  score: e.target.value,
                                },
                              })
                            }
                            className="w-20 px-3 py-2 rounded-xl border-2 border-slate-200 font-black text-sm bg-white"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Lời nhận xét..."
                          value={currentFeedback}
                          onChange={(e) =>
                            setGradingScores({
                              ...gradingScores,
                              [sub.studentId]: {
                                ...gradingScores[sub.studentId],
                                feedback: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200 font-medium text-sm bg-white"
                        />
                        <button
                          onClick={() => handleSaveGrade(sub.studentId)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors shrink-0"
                        >
                          Lưu điểm
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}