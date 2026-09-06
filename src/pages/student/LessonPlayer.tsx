import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { useStudentStore } from "../../store/studentStore";
import { SimulationPlayer } from "../../components/simulation/SimulationPlayer";
import { SimulationSpecification } from "../../types/simulation";
import api from "../../lib/api";

export default function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const { completeLesson } = useStudentStore();

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/courses/lessons/${id}`);
        let parsedContent: any = [];
        try {
          if (res.data.content) {
            parsedContent =
              typeof res.data.content === "string"
                ? JSON.parse(res.data.content)
                : res.data.content;
          }
        } catch (e) {
          console.warn("Could not parse content JSON", e);
        }
        setLesson({
          ...res.data,
          sections: Array.isArray(parsedContent)
            ? parsedContent
            : parsedContent.sections || [],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLesson();
  }, [id]);

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        Đang tải...
      </div>
    );
  if (!lesson)
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Không tìm thấy bài giảng
      </div>
    );

  const section = lesson.sections[currentSection];
  const progress =
    lesson.sections.length > 0
      ? ((currentSection + 1) / lesson.sections.length) * 100
      : 100;
  const isLast = currentSection >= lesson.sections.length - 1;

  const handleNext = async () => {
    setSelectedAnswer(null);
    if (isLast) {
      if (id) {
        await completeLesson(id);
      }
      navigate(-1);
    } else {
      setCurrentSection((curr) => curr + 1);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-7xl mx-auto">
      {/* Header & Progress */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <h1 className="font-black text-slate-900">{lesson.title}</h1>
            {lesson.sections.length > 0 && (
              <span className="text-sm font-bold text-slate-500">
                {currentSection + 1} / {lesson.sections.length}
              </span>
            )}
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      {lesson.sections.length > 0 ? (
        <div
          className="flex-1 overflow-y-auto mb-8 bg-white rounded-3xl border-2 border-b-4 border-slate-200 p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-right-8 duration-300"
          key={currentSection}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {section.type === "heading"
              ? "Tiêu đề"
              : section.type === "image"
                ? "Hình ảnh"
                : section.type === "video"
                  ? "Video"
                  : section.type === "quiz"
                    ? "Câu hỏi"
                    : section.type === "simulation"
                      ? "Thí nghiệm"
                      : "Văn bản"}
          </div>

          {(section.type === "text" ||
            section.type === "heading" ||
            !section.type) && (
            <div className="prose prose-slate prose-lg max-w-none">
              {section.type === "heading" ? (
                <h2 className="text-3xl font-black text-slate-900">
                  {section.content || "Tiêu đề"}
                </h2>
              ) : (
                <>
                  {section.title && (
                    <h3 className="text-2xl font-black text-slate-900 mb-4">
                      {section.title}
                    </h3>
                  )}
                  <p className="text-xl leading-relaxed text-slate-700 font-medium">
                    {section.content as string}
                  </p>
                </>
              )}
            </div>
          )}

          {section.type === "image" && (
            <div className="flex justify-center">
              <img
                src={section.content}
                alt="Lesson Image"
                className="max-w-full h-auto rounded-xl border-2 border-slate-200"
              />
            </div>
          )}

          {section.type === "video" && (
            <div className="flex justify-center">
              <iframe
                className="w-full aspect-video rounded-xl border-2 border-slate-200"
                src={section.content}
                allowFullScreen
              />
            </div>
          )}

          {section.type === "simulation" &&
            section.content &&
            typeof section.content === "object" && (
              <SimulationPlayer
                spec={section.content as SimulationSpecification}
              />
            )}

          {section.type === "quiz" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <h3 className="text-2xl font-black text-slate-900">
                {section.content as string}
              </h3>
              <div className="space-y-3">
                {["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"].map(
                  (ans, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAnswer(idx)}
                      className={`w-full text-left p-4 rounded-2xl border-2 font-bold transition-colors ${selectedAnswer === idx ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700"}`}
                    >
                      {ans}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white rounded-3xl border-2 border-b-4 border-slate-200 p-6 md:p-8">
          <p className="text-slate-500 font-bold text-lg">
            Bài giảng này chưa có nội dung.
          </p>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentSection((c) => Math.max(0, c - 1))}
          disabled={currentSection === 0}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-slate-500 bg-white border-2 border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" /> Quay lại
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/student/ai-tutor")}
            title="Hỏi AI Tutor"
            className="flex items-center gap-2 w-14 h-14 justify-center rounded-2xl font-bold text-blue-600 bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-blue-500 border-2 border-b-4 border-blue-700 active:border-b-2 active:translate-y-[2px] transition-all hover:bg-blue-400"
          >
            {isLast ? (
              <>
                Hoàn thành <CheckCircle2 className="w-5 h-5" />
              </>
            ) : (
              <>
                Tiếp tục <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
