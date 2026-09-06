import { useState, useEffect } from "react";
import {
  Upload,
  Search,
  FileImage,
  FileVideo,
  FileText,
  Trash2,
  Download,
} from "lucide-react";
import api from "../../lib/api";

export default function MediaLibrary() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await api.get("/ai/documents");
      setMedia(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xóa tài liệu này?")) return;
    try {
      await api.delete(`/ai/documents/${id}`);
      fetchMedia();
    } catch (err) {
      alert("Lỗi xóa tài liệu");
    }
  };

  const handleDownload = (id: string, originalName: string) => {
    // We can just open the API endpoint in a new tab to trigger download
    // Ensure we send auth token if needed, but since it's a direct URL, we might need to fetch it as a blob
    fetch(`/api/ai/documents/${id}/download`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Download failed");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => alert("Lỗi tải xuống"));
  };

  const getIcon = (mimeType: string) => {
    if (mimeType?.includes("video"))
      return <FileVideo className="w-8 h-8 text-red-500" />;
    if (mimeType?.includes("image"))
      return <FileImage className="w-8 h-8 text-emerald-500" />;
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Thư viện Học liệu
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">
            Quản lý hình ảnh, video, tài liệu PDF
          </p>
        </div>
        <button
          onClick={() => document.getElementById("upload-input")?.click()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all border-b-4 border-blue-700 active:border-b-0 active:translate-y-1"
        >
          <Upload className="w-5 h-5" /> Tải lên
          <input
            type="file"
            id="upload-input"
            className="hidden"
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                const formData = new FormData();
                formData.append("file", e.target.files[0]);
                try {
                  const response = await fetch("/api/ai/upload-pdf", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: formData,
                  });
                  if (!response.ok) throw new Error(await response.text());
                  fetchMedia();
                } catch (err) {
                  alert("Lỗi tải lên");
                }
              }
            }}
          />
        </button>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <div className="p-4 border-b-2 border-slate-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm file..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center font-bold text-slate-500">
            Đang tải...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {media.map((file) => (
              <div
                key={file.id}
                className="group bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 hover:border-blue-300 transition-colors relative"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(file.id, file.originalName)}
                    className="p-1.5 bg-white text-slate-400 hover:text-blue-500 rounded-lg shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-32 flex items-center justify-center bg-white rounded-xl mb-4 border-2 border-slate-100">
                  {getIcon(file.mimeType)}
                </div>
                <p
                  className="font-bold text-slate-900 truncate"
                  title={file.originalName}
                >
                  {file.originalName}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    {formatSize(file.size)}
                  </span>
                </div>
              </div>
            ))}
            {media.length === 0 && (
              <div className="col-span-full text-center p-8 text-slate-500 font-bold">
                Chưa có tài liệu nào
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
