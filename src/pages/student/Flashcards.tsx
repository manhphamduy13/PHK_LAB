import { useState, useEffect } from "react";
import { RotateCcw, Check, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Flashcards() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ know: 0, review: 0 });
  const { token } = useAuthStore();

  useEffect(() => {
    async function loadCards() {
      try {
        const res = await fetch("/api/learning/flashcards", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCards(data.flashcards);
        }
      } catch (err) {
        console.error("Failed to load flashcards", err);
      } finally {
        setLoading(false);
      }
    }
    if (token) loadCards();
  }, [token]);

  const card = cards[currentIndex];
  const isComplete = currentIndex >= cards.length && cards.length > 0;

  const handleNext = async (status: "know" | "review") => {
    setStats((prev) => ({ ...prev, [status]: prev[status] + 1 }));
    setIsFlipped(false);

    // Call backend to update spaced repetition ease and interval
    try {
      await fetch("/api/learning/flashcards/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          flashcardId: card.id,
          quality: status === "know" ? 3 : 1, // 3=Good, 1=Again
        }),
      });
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 150);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setStats({ know: 0, review: 0 });
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <div className="text-center p-8 text-slate-500 font-bold">
        Đang tải thẻ học...
      </div>
    );
  }

  if (cards.length === 0) {
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
            Chưa có flashcard nào!
          </h2>
          <p className="text-slate-500">
            Bạn cần hoàn thành thêm bài học để mở khóa thẻ ghi nhớ.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <Link
        to="/student"
        className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-900">
          Ôn tập Flashcards
        </h1>
        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-sm">
          Thẻ ghi nhớ của bạn
        </p>
      </div>

      {!isComplete ? (
        <div className="space-y-8">
          <div className="flex justify-between text-sm font-bold text-slate-400 px-4">
            <span>
              Tiến độ: {currentIndex + 1} / {cards.length}
            </span>
            <span>
              Đã thuộc: <span className="text-emerald-500">{stats.know}</span>
            </span>
          </div>

          {/* Card Container */}
          <div
            className="relative h-80 w-full perspective-1000 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className={`w-full h-full transition-all duration-500 preserve-3d relative ${isFlipped ? "rotate-y-180" : ""}`}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-3xl border-2 border-b-8 border-slate-200 p-8 flex items-center justify-center text-center group-hover:border-blue-300">
                <h2 className="text-3xl font-black text-slate-900">
                  {card.front}
                </h2>
                <div className="absolute bottom-6 text-slate-400 text-sm font-bold flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Chạm để lật
                </div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden bg-blue-500 text-white rounded-3xl border-b-8 border-blue-700 p-8 flex items-center justify-center text-center rotate-y-180">
                <p className="text-xl font-medium leading-relaxed">
                  {card.back}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            className={`flex gap-4 transition-opacity duration-300 ${isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext("review");
              }}
              className="flex-1 py-4 bg-orange-100 text-orange-700 font-black rounded-2xl border-2 border-b-4 border-orange-200 hover:bg-orange-200 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-lg"
            >
              <X className="w-6 h-6" /> Ôn lại
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext("know");
              }}
              className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl border-2 border-b-4 border-emerald-700 hover:bg-emerald-400 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-lg"
            >
              <Check className="w-6 h-6" /> Đã thuộc
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-b-4 border-slate-200 animate-in zoom-in-95">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
            <Check className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            Hoàn thành bộ thẻ!
          </h2>
          <p className="text-slate-500 font-medium mb-8">
            Bạn đã nhớ được {stats.know} trên tổng số {cards.length} thuật ngữ.
          </p>
          <Link
            to="/student"
            className="px-8 py-4 bg-blue-500 text-white font-black rounded-2xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all inline-block"
          >
            Quay lại tổng quan
          </Link>
        </div>
      )}
    </div>
  );
}
