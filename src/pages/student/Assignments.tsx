import { useState, useEffect } from "react";
import {
  Target,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  Upload,
  BookOpen,
  Award,
  X,
  FileText,
  FlaskConical,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Assignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "NOT_STARTED" | "SUBMITTED" | "GRADED">("ALL");
  const [submittingAssignment, setSubmittingAssignment] = useState<any | null>(null);
  const [submissionComment, setSubmissionComment] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuthStore();
  const navigate = useNavigate();

  const loadAssignments = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/assignments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [token]);

  const handleSubmitWork = async () => {
    if (!submittingAssignment) return;
    if (!submissionComment.trim() && !submissionFile) {
      alert("Vui lòng nhập câu trả lời/ghi chú hoặc chọn file nộp");
      return;
    }

    setIsSubmitting(true);
    try {
      let filePayload = undefined;
      if (submissionFile) {
        const reader = new FileReader();
        const buffer = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
          reader.readAsDataURL(submissionFile);
        });
        filePayload = {
          data: buffer,
          filename: submissionFile.name,
          mimeType: submissionFile.type,
        };
      }

      const res = await fetch(
        `/api/assignments/${submittingAssignment.assignmentId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            submissionContent: submissionComment.trim(),
            comment: submissionComment.trim(),
            file: filePayload,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Lỗi khi nộp bài");
      }

      alert("Nộp bài thành công! Thầy cô sẽ sớm xem và chấm điểm.");
      setSubmittingAssignment(null);
      setSubmissionComment("");
      setSubmissionFile(null);
      loadAssignments();
    } catch (err: any) {
      alert(err.message || "Không thể nộp bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleAssignments = assignments.filter((a) => {
    if (filter === "ALL") return true;
    if (filter === "NOT_STARTED") return a.status === "NOT_STARTED" || !a.status;
    if (filter === "SUBMITTED") return a.status === "SUBMITTED";
    if (filter === "GRADED") return a.status === "GRADED";
    return true;
  });

  if (loading) {
    return (
      <div className="p-12 text-center font-black text-slate-400 animate-pulse">
        Đang tải danh sách bài tập...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Bài Tập Được Giao
        </h1>
        <p className="text-slate-500 font-bold text-base">
          Theo dõi hạn nộp, làm bài và nhận phản hồi từ thầy cô
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-2 overflow-x-auto pb-2">
        {[
          { id: "ALL", label: `Tất cả (${assignments.length})` },
          {
            id: "NOT_STARTED",
            label: `Chưa nộp (${assignments.filter((a) => a.status === "NOT_STARTED" || !a.status).length})`,
          },
          {
            id: "SUBMITTED",
            label: `Đã nộp (${assignments.filter((a) => a.status === "SUBMITTED").length})`,
          },
          {
            id: "GRADED",
            label: `Đã chấm (${assignments.filter((a) => a.status === "GRADED").length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              filter === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visibleAssignments.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-b-8 border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">
            Không có bài tập trong mục này
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Bạn đã hoàn thành các nhiệm vụ hoặc chưa có bài tập mới.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleAssignments.map((a: any) => {
            const isGraded = a.status === "GRADED";
            const isSubmitted = a.status === "SUBMITTED";

            return (
              <div
                key={a.assignmentId}
                className="bg-white p-6 rounded-3xl border-2 border-b-8 border-slate-200 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      {a.lessonId ? (
                        <BookOpen className="w-6 h-6" />
                      ) : (
                        <Target className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xl font-black text-slate-900">
                          {a.title}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          {a.type}
                        </span>
                        {a.className && (
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
                            Lớp {a.className}
                          </span>
                        )}
                      </div>
                      {a.description && (
                        <p className="text-sm font-medium text-slate-600 mt-1 whitespace-pre-wrap">
                          {a.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Hạn chót:{" "}
                          {new Date(a.dueDate).toLocaleDateString("vi-VN")}
                        </span>
                        {a.teacherName && (
                          <span>Giáo viên: {a.teacherName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="self-start sm:self-center">
                    <span
                      className={`px-3 py-1.5 text-xs font-black rounded-xl border ${
                        isGraded
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : isSubmitted
                            ? "bg-amber-50 text-amber-700 border-amber-300"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {isGraded
                        ? `Đã chấm: ${a.score}/100 điểm`
                        : isSubmitted
                          ? "Đã nộp bài (Chờ chấm)"
                          : "Chưa nộp"}
                    </span>
                  </div>
                </div>

                {/* Graded Feedback Card */}
                {isGraded && (
                  <div className="bg-emerald-50/60 rounded-2xl border-2 border-emerald-200 p-4 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Điểm số: {a.score}/100
                    </div>
                    {a.feedback && (
                      <p className="text-xs font-medium text-emerald-900 mt-1">
                        <span className="font-black">Nhận xét của thầy cô:</span>{" "}
                        {a.feedback}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions: Open Content & Submit */}
                <div className="pt-3 border-t-2 border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {a.lessonId && (
                      <button
                        onClick={() => navigate(`/student/lessons/${a.lessonId}`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl text-xs hover:bg-blue-100 transition-colors"
                      >
                        <BookOpen className="w-4 h-4" /> Mở bài học
                      </button>
                    )}
                    {a.exerciseId && (
                      <button
                        onClick={() => navigate(`/student/exercises/${a.exerciseId}`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-600 font-bold rounded-xl text-xs hover:bg-purple-100 transition-colors"
                      >
                        <Target className="w-4 h-4" /> Làm bài trắc nghiệm
                      </button>
                    )}
                    {a.hasAttachment && (
                      <a
                        href={`/api/assignments/${a.assignmentId}/file`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                      >
                        📎 Đính kèm: {a.attachFileName || "Đề bài"}
                      </a>
                    )}
                  </div>

                  {!isGraded && (
                    <button
                      onClick={() => {
                        setSubmittingAssignment(a);
                        setSubmissionComment(a.submissionComment || "");
                      }}
                      className="px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 active:translate-y-0.5 transition-all text-xs flex items-center gap-1.5 ml-auto"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSubmitted ? "Nộp lại bài" : "Nộp bài"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL NỘP BÀI */}
      {submittingAssignment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-slate-200">
            <div className="p-6 border-b-2 border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Nộp bài: {submittingAssignment.title}
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Nhập bài làm hoặc đính kèm tài liệu giải
                </p>
              </div>
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nội dung bài làm / Câu trả lời:
                </label>
                <textarea
                  rows={5}
                  placeholder="Gõ lời giải, ghi chú kết quả thí nghiệm hoặc câu trả lời tại đây..."
                  value={submissionComment}
                  onChange={(e) => setSubmissionComment(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-medium text-sm focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Đính kèm file (ảnh bài làm, PDF, Word):
                </label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                  className="w-full text-sm font-bold text-slate-600"
                />
                {submissionFile && (
                  <p className="text-xs text-blue-600 font-bold mt-1">
                    📎 {submissionFile.name}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t-2 border-slate-100 flex gap-3">
                <button
                  onClick={() => setSubmittingAssignment(null)}
                  className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitWork}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Đang gửi..." : "Gửi bài nộp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
