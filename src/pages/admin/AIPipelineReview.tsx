import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowLeft,
  Send,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function AIPipelineReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/ai/lessons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.lesson) {
          setLesson(data.lesson);
          if (data.lesson.sourceDocumentId) {
            const pdfResponse = await fetch(
              `/api/ai/documents/${data.lesson.sourceDocumentId}/download`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (pdfResponse.ok)
              setPdfUrl(URL.createObjectURL(await pdfResponse.blob()));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLesson();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [id, token]);

  const handleRegenerate = async () => {
    if (!lesson?.sourceDocumentId) return;
    setReprocessing(true);
    try {
      const response = await fetch(
        `/api/ai/documents/${lesson.sourceDocumentId}/reprocess`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error(await response.text());
      alert("Đã tạo job phân tích lại. Theo dõi tại AI Pipeline.");
      navigate("/admin/ai-content");
    } catch (error) {
      alert(
        `Regenerate thất bại: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setReprocessing(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const response = await fetch(`/api/ai/lessons/${id}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          message = (await response.json()).error || message;
        } catch {
          message = await response.text();
        }
        throw new Error(message);
      }
      alert("Đã xuất bản thành công!");
      navigate("/admin/ai-content");
    } catch (error) {
      console.error(error);
      alert(
        `Lỗi xuất bản: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setPublishing(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (!lesson)
    return (
      <div className="p-8 text-center text-red-500">
        Không tìm thấy bài học!
      </div>
    );

  let contentData;
  try {
    contentData = JSON.parse(lesson.content);
  } catch (e) {
    contentData = {};
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col p-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Side-by-Side Review
            </h1>
            <p className="text-slate-500 text-sm font-bold">
              Document: {lesson.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-amber-100 text-amber-700 font-bold rounded-lg text-sm border-2 border-amber-200">
            {lesson.status}
          </div>
          <button
            onClick={handlePublish}
            disabled={publishing || lesson.status === "PUBLISHED"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {lesson.status === "PUBLISHED" ? "Đã xuất bản" : "Duyệt & Xuất bản"}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* LEFT: ORIGINAL SOURCE */}
        <div className="bg-slate-100 rounded-3xl border-2 border-slate-200 p-6 overflow-y-auto shadow-inner flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-slate-600 border-b-2 border-slate-200 pb-2">
            <FileText className="w-5 h-5" />
            <h2 className="font-bold">Original Source (PDF)</h2>
          </div>
          <div className="flex-1 bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
            {pdfUrl ? (
              <iframe
                title="PDF source"
                src={pdfUrl}
                className="w-full h-full min-h-[500px]"
              />
            ) : (
              <p className="text-slate-400 font-medium text-center p-8">
                Không có PDF nguồn cho bài học này.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: AI GENERATED LESSON */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 overflow-y-auto shadow-sm">
          <h2 className="font-black text-xl text-blue-900 mb-6 border-b-2 border-blue-100 pb-4">
            AI Generated Lesson
          </h2>
          <button
            onClick={handleRegenerate}
            disabled={reprocessing || !lesson.sourceDocumentId}
            className="mb-5 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-bold disabled:opacity-50"
          >
            {reprocessing ? "Đang tạo lại..." : "Regenerate toàn bộ"}
          </button>

          <div className="space-y-6">
            {/* Metadata */}
            {contentData.metadata && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-800 text-sm mb-2">
                  Metadata
                </h3>
                <p className="text-sm font-medium text-blue-900">
                  Môn học: {contentData.metadata.subject}
                </p>
                <p className="text-sm font-medium text-blue-900">
                  Lớp: {contentData.metadata.grade}
                </p>
              </div>
            )}

            {/* Concepts */}
            {contentData.concepts && (
              <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center justify-between">
                  <span>Khái niệm trọng tâm</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {contentData.concepts.map((c: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-slate-100 border-2 border-slate-200 px-3 py-1 rounded-full text-sm font-bold text-slate-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sections */}
            {contentData.sections && (
              <div>
                <h3 className="font-bold text-slate-800 mb-3">
                  Nội dung bài học
                </h3>
                <div className="space-y-4">
                  {contentData.sections.map((sec: any, idx: number) => (
                    <div
                      key={idx}
                      className="border-2 border-slate-100 rounded-xl p-4 relative group hover:border-blue-200 transition-colors"
                    >
                      <h4 className="font-bold text-slate-900 mb-2">
                        {sec.title}
                      </h4>
                      <p className="text-slate-600 text-sm">{sec.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experiments */}
            {contentData.experiments && contentData.experiments.length > 0 && (
              <div>
                <h3 className="font-bold text-emerald-800 mb-3">
                  Thí nghiệm được phát hiện
                </h3>
                <div className="space-y-4">
                  {contentData.experiments.map((exp: any, idx: number) => (
                    <div
                      key={idx}
                      className="border-2 border-emerald-100 bg-emerald-50 rounded-xl p-4"
                    >
                      <h4 className="font-bold text-emerald-900 mb-1">
                        🧪 {exp.name}
                      </h4>
                      <p className="text-emerald-700 text-sm">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
