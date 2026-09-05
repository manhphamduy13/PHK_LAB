import { useState, useEffect } from "react";
import {
  FileUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export default function AIPipelineDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/ai/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return; // Prevent parsing errors on rate limit
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [token]);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/ai/upload-pdf", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      setFile(null);
      fetchJobs();
    } catch (error) {
      console.error("Upload failed", error);
      alert(
        "Tải PDF thất bại. Vui lòng kiểm tra định dạng, dung lượng và cấu hình AI.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            AI Pipeline Dashboard
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">
            Chuyển đổi PDF thành bài học tương tác
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm">
          <h2 className="font-black text-lg text-slate-900 mb-4">
            1. Tải lên PDF
          </h2>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              id="pdf-upload"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <FileUp className="w-12 h-12 text-slate-400 mb-4" />
              <p className="font-bold text-slate-700">
                {file ? file.name : "Chọn file PDF hoặc kéo thả vào đây"}
              </p>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Dung lượng tối đa: 10MB
              </p>
            </label>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            Bắt đầu phân tích
          </button>
        </div>

        {/* Jobs List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm">
          <h2 className="font-black text-lg text-slate-900 mb-4">
            2. Tiến trình xử lý (AI Jobs)
          </h2>

          <div className="space-y-4">
            {jobs.length === 0 && (
              <div className="text-center py-10 text-slate-500 font-medium">
                Chưa có tài liệu nào được xử lý
              </div>
            )}

            {jobs.map((job) => (
              <div
                key={job.id}
                className="border-2 border-slate-100 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-800">
                    Job: {job.id.slice(0, 8)}... - {job.task}
                  </p>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Trạng thái:{" "}
                    <span className="font-bold text-blue-600">
                      {job.status}
                    </span>
                  </p>
                  {job.error && (
                    <p className="text-xs text-red-500 mt-1">{job.error}</p>
                  )}
                </div>
                <div>
                  {job.status === "PROCESSING" && (
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  )}
                  {job.status === "COMPLETED" && (
                    <div className="flex gap-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <button
                        onClick={() => {
                          const res = job.resultData
                            ? JSON.parse(job.resultData)
                            : null;
                          if (res && res.lessonId) {
                            navigate(
                              `/admin/ai-content/${res.lessonId}/review`,
                            );
                          }
                        }}
                        className="text-sm font-bold text-blue-600 hover:underline"
                      >
                        Review & Publish
                      </button>
                    </div>
                  )}
                  {job.status === "FAILED" && (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
