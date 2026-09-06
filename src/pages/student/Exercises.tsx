import { useState, useEffect } from "react";
import {
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Star,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useStudentStore } from "../../store/studentStore";
import { useAuthStore } from "../../store/authStore";
import { useParams } from "react-router-dom";

export default function Exercises() {
  const [exerciseData, setExerciseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addXP } = useStudentStore();
  const [xpEarned, setXpEarned] = useState(0);
  const { token } = useAuthStore();
  const { id: assignedExerciseId } = useParams();

  const fetchExercise = async () => {
    setLoading(true);
    setIsSubmitted(false);
    setSelectedAnswer(null);
    try {
      const res = await fetch(
        assignedExerciseId
          ? `/api/exercises/${assignedExerciseId}`
          : "/api/learning/exercises/random",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setExerciseData(data.exercise);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchExercise();
  }, [token, assignedExerciseId]);

  if (loading)
    return (
      <div className="text-center p-8 font-bold text-slate-500">
        Đang tải bài tập...
      </div>
    );
  if (
    !exerciseData ||
    !exerciseData.questions ||
    exerciseData.questions.length === 0
  ) {
    return (
      <div className="max-w-2xl mx-auto text-center p-8">
        <Link
          to="/student"
          className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </Link>
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-b-4 border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Chưa có bài tập nào!
          </h2>
        </div>
      </div>
    );
  }

  const question = exerciseData.questions[0]; // Assuming 1 question per exercise for now
  const options = question.answers || [];
  const correctOption = options.find((o: any) => o.isCorrect);

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);

    if (selectedAnswer === correctOption?.id) {
      const points = 100;
      setXpEarned(points);
      await addXP(points, {
        action: "COMPLETE_EXERCISE",
        sourceType: "EXERCISE",
        sourceId: exerciseData.id,
      });
      // Track completion
      fetch("/api/learning/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventType: "EXERCISE_COMPLETED",
          resourceId: exerciseData.id,
          metadata: JSON.stringify({ score: 100 }),
        }),
      }).catch(console.error);
    }
  };

  const isCorrect = selectedAnswer === correctOption?.id;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <Link
        to="/student"
        className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </Link>

      <div className="bg-white rounded-3xl border-2 border-b-4 border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b-2 border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                {exerciseData.title}
              </h1>
              <div className="flex gap-2 mt-1">
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                  Trắc nghiệm
                </span>
                <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                  100 XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-slate-700 leading-relaxed mb-8">
            {question.content}
          </h2>

          <div className="space-y-4">
            {options.map((option: any) => {
              let btnClass =
                "w-full text-left p-4 rounded-2xl border-2 font-bold transition-all ";

              if (!isSubmitted) {
                btnClass +=
                  selectedAnswer === option.id
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 hover:border-blue-300 text-slate-600 hover:bg-slate-50";
              } else {
                if (option.isCorrect) {
                  btnClass +=
                    "border-emerald-500 bg-emerald-50 text-emerald-700";
                } else if (option.id === selectedAnswer) {
                  btnClass += "border-red-500 bg-red-50 text-red-700";
                } else {
                  btnClass += "border-slate-200 text-slate-400 opacity-50";
                }
              }

              return (
                <button
                  key={option.id}
                  disabled={isSubmitted}
                  onClick={() => setSelectedAnswer(option.id)}
                  className={btnClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.content}</span>
                    {isSubmitted && option.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                    {isSubmitted &&
                      option.id === selectedAnswer &&
                      !option.isCorrect && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Result & Explanation */}
          {isSubmitted && (
            <div
              className={`mt-8 p-6 rounded-2xl border-2 animate-in slide-in-from-bottom-4 ${isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}
            >
              <div className="flex items-center gap-3 mb-4">
                {isCorrect ? (
                  <>
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    <div className="font-black text-xl text-emerald-700">
                      Chính xác! (+{xpEarned} XP)
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div className="font-black text-xl text-red-700">
                      Chưa chính xác
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action */}
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="w-full mt-8 px-6 py-4 bg-blue-500 text-white rounded-2xl font-black text-lg border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kiểm tra
            </button>
          ) : (
            <button
              onClick={fetchExercise}
              className="w-full mt-8 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg border-b-4 border-slate-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Câu tiếp theo <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
