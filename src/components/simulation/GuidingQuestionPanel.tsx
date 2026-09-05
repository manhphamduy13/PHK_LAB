import React, { useState } from 'react';
import { SimQuestion, SimulationState } from '../../types/simulation';
import { Lightbulb, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

interface GuidingQuestionPanelProps {
  questions: SimQuestion[];
  state: SimulationState;
  onSubmitted?: () => void;
}

/**
 * Hiển thị câu hỏi định hướng nghiên cứu, KHÔNG đưa đáp án ngay.
 * Học sinh có thể mở dần từng cấp gợi ý (1 -> 3), sau đó tự ghi kết luận.
 * Đáp án tham khảo (correctAnswer) chỉ hiện ra SAU KHI học sinh đã nộp câu trả lời của mình,
 * để tránh việc học sinh đọc đáp án thay vì tự suy luận.
 */
export function GuidingQuestionPanel({ questions, state, onSubmitted }: GuidingQuestionPanelProps) {
  const [hintLevel, setHintLevel] = useState<Record<string, number>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  if (!questions || questions.length === 0) return null;

  const revealNextHint = (qId: string, maxHints: number) => {
    setHintLevel((prev) => {
      const current = prev[qId] || 0;
      return { ...prev, [qId]: Math.min(current + 1, maxHints) };
    });
  };

  const handleSubmit = (qId: string) => {
    if (!answers[qId] || answers[qId].trim().length < 5) return;
    setSubmitted((prev) => ({ ...prev, [qId]: true }));
    onSubmitted?.();
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 rounded-2xl p-6 space-y-8">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-indigo-600" />
        <h3 className="font-black text-indigo-900">Câu hỏi định hướng nghiên cứu</h3>
      </div>

      {questions.map((q) => {
        const level = hintLevel[q.id] || 0;
        const hints = q.hints || [];
        const isSubmitted = submitted[q.id];
        const enoughData = state.measurements.length >= 2;

        return (
          <div key={q.id} className="space-y-4">
            <p className="font-bold text-slate-800 leading-relaxed">{q.text}</p>

            {!enoughData && (
              <p className="text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                Em cần ghi lại ít nhất 2 lần đo với các thông số khác nhau trước khi trả lời câu hỏi này.
              </p>
            )}

            {/* Gợi ý theo cấp, hiện dần */}
            {hints.length > 0 && (
              <div className="space-y-2">
                {hints.slice(0, level).map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">
                      <span className="font-black text-indigo-600">Gợi ý {idx + 1}: </span>
                      {h}
                    </span>
                  </div>
                ))}

                {level < hints.length && (
                  <button
                    onClick={() => revealNextHint(q.id, hints.length)}
                    disabled={!enoughData}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Sparkles className="w-4 h-4" />
                    {level === 0 ? 'Xem gợi ý' : 'Xem thêm gợi ý'} ({level}/{hints.length})
                  </button>
                )}
              </div>
            )}

            {/* Ô trả lời tự luận */}
            {!isSubmitted ? (
              <div className="space-y-2">
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  disabled={!enoughData}
                  placeholder="Em hãy tự viết nhận xét / kết luận của mình dựa trên dữ liệu đã đo..."
                  rows={4}
                  className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none font-medium text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                />
                <button
                  onClick={() => handleSubmit(q.id)}
                  disabled={!enoughData || !(answers[q.id]?.trim().length >= 5)}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  Nộp câu trả lời
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-emerald-700 uppercase tracking-wide">Câu trả lời của em</p>
                    <p className="text-sm font-medium text-emerald-900 mt-1">{answers[q.id]}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white border-2 border-indigo-100 rounded-xl px-4 py-3">
                  <Lightbulb className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-indigo-700 uppercase tracking-wide">Kết luận tham khảo</p>
                    <p className="text-sm font-medium text-slate-700 mt-1">{q.correctAnswer}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
