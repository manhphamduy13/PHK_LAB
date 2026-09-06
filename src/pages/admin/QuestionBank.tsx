import { useEffect, useState } from "react";
import { Plus, Search, HelpCircle, Edit3, Trash2, X, Check, Trash } from "lucide-react";
import api from "../../lib/api";
import { useSearchParams } from "react-router-dom";

interface AnswerOption {
  content: string;
  isCorrect: boolean;
}

interface QuestionItem {
  id: string;
  exerciseId: string;
  content: string;
  type: string;
  answers?: AnswerOption[];
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [search, setSearch] = useState("");
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ]);
  const [questionContent, setQuestionContent] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const exerciseIdFromUrl = searchParams.get("exerciseId") || "";

  const load = async () => {
    try {
      setQuestions((await api.get("/questions")).data);
    } catch (error) {
      console.error(error);
    }
  };
  const loadExercises = async () => {
    try {
      setExercises((await api.get("/exercises")).data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    load();
    loadExercises();
  }, []);

  useEffect(() => {
    if (exerciseIdFromUrl) setSelectedExerciseId(exerciseIdFromUrl);
  }, [exerciseIdFromUrl]);

  const addOption = () => {
    setAnswerOptions((items) => [...items, { content: "", isCorrect: false }]);
  };
  const removeOption = (index: number) => {
    if (answerOptions.length <= 2) return;
    setAnswerOptions((items) => items.filter((_, i) => i !== index));
  };
  const markCorrect = (index: number) => {
    setAnswerOptions((items) =>
      items.map((item, i) => ({ ...item, isCorrect: i === index })),
    );
  };

  const create = async () => {
    if (!selectedExerciseId) {
      alert("Vui lòng chọn bài tập");
      return;
    }
    if (!questionContent.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi");
      return;
    }
    const options = answerOptions.filter((o) => o.content.trim());
    if (options.length < 2) {
      alert("Cần ít nhất 2 lựa chọn");
      return;
    }
    if (!options.some((o) => o.isCorrect)) {
      alert("Cần chọn 1 đáp án đúng");
      return;
    }
    try {
      await api.post("/questions", {
        exerciseId: selectedExerciseId,
        content: questionContent.trim(),
        type: "multiple_choice",
        answerOptions: options,
      });
      setQuestionContent("");
      setAnswerOptions([
        { content: "", isCorrect: false },
        { content: "", isCorrect: false },
      ]);
      load();
    } catch (err) {
      alert("Lỗi tạo câu hỏi: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const edit = async (question: QuestionItem) => {
    const content = prompt("Sửa câu hỏi:", question.content);
    if (content && content !== question.content) {
      await api.put(`/questions/${question.id}`, { content, type: question.type });
      load();
    }
  };
  const remove = async (id: string) => {
    if (confirm("Xóa câu hỏi này?")) {
      await api.delete(`/questions/${id}`);
      load();
    }
  };
  const visible = questions.filter(
    (q) =>
      (!selectedExerciseId || q.exerciseId === selectedExerciseId) &&
      q.content.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Ngân hàng Câu hỏi
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">
            Quản lý câu hội trắc nghiệm - thêm lựa chọ n dễ dàng
          </p>
        </div>
      </div>

      {/* Create question form */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 space-y-4">
        <h2 className="font-black text-slate-900 text-lg">Thêm câu hỏi mới</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Chọn bài tập *
            </label>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-bold"
            >
              <option value="">-- Chọn bài tập --</option>
              {exercises.map((ex: any) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Nội dung câu hỏi *
            </label>
            <input
              value={questionContent}
              onChange={(e) => setQuestionContent(e.target.value)}
              placeholder="Ví dụ: Đơn vị đo lực là gì?"
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-bold"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Các lựa chọn (chọn 1 đáp án đúng)
            </label>
            <button
              onClick={addOption}
              className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" /> Thêm lựa chọn
            </button>
          </div>
          <div className="space-y-2">
            {answerOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <button
                  onClick={() => markCorrect(index)}
                  title="Đánh dấu đáp án đúng"
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    option.isCorrect
                      ? "bg-emerald-500 border-emerald-600 text-white"
                      : "border-slate-300 text-slate-300 hover:border-emerald-400 hover:text-emerald-400"
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <input
                  value={option.content}
                  onChange={(e) =>
                    setAnswerOptions((items) =>
                      items.map((item, i) =>
                        i === index ? { ...item, content: e.target.value } : item,
                      ),
                    )
                  }
                  placeholder={`Lựa chọn ${index + 1}`}
                  className={`flex-1 rounded-xl border-2 px-3 py-2 font-medium ${
                    option.isCorrect
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200"
                  }`}
                />
                <button
                  onClick={() => removeOption(index)}
                  disabled={answerOptions.length <= 2}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors disabled:opacity-30"
                  title="Xóa lựa chọn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {answerOptions.filter((o) => o.isCorrect).length === 0
              ? "💡 Nhấn vào hình tròn bên trái để chọn đáp án đúng"
              : `✅ Đáp án đúng: "${answerOptions.find((o) => o.isCorrect)?.content || ""}"`}
          </p>
        </div>

        <button
          onClick={create}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" /> Tạo câu hỏi
        </button>
      </div>

      {/* Questions list */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <div className="p-4 border-b-2 border-slate-100">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold"
            />
          </div>
        </div>
        <div className="p-6 space-y-4">
          {visible.map((question) => (
            <div
              key={question.id}
              className="border-2 border-slate-100 rounded-2xl p-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{question.content}</p>
                  <div className="mt-3 space-y-1.5">
                    {(question.answers || []).map((answer, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                          answer.isCorrect
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className="w-4 h-4 flex items-center justify-center rounded-full border-2 text-xs font-bold">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {answer.content}
                        {answer.isCorrect && (
                          <span className="ml-auto text-xs font-bold text-emerald-600">
                            ✓ Đúng
                          </span>
                        )}
                      </div>
                    ))}
                    {(!question.answers || question.answers.length === 0) && (
                      <p className="text-xs text-slate-400 italic">
                        Chưa có lựa chọn cho câu hỏi này
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {question.type} · {question.answers?.length || 0} đáp án
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => edit(question)}
                    title="Sửa"
                    className="p-2 text-slate-400 hover:text-blue-500"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => remove(question.id)}
                    title="Xóa"
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="p-8 text-center text-slate-500 font-bold">
              Chưa có câu hỏi phù hợp.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}