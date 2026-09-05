import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  ArrowRight,
  Atom,
  Bot,
  FlaskConical,
  Play,
  Sparkles,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-slate-900 font-black text-2xl tracking-tight">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-xl">
            PHK
          </div>
          STEM LAB
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="font-bold">
              Đăng nhập
            </Button>
          </Link>
          <Link to="/register">
            <Button>Đăng ký miễn phí</Button>
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="display-grid relative mx-4 overflow-hidden rounded-[2rem] bg-[#172033] px-6 pb-16 pt-14 text-white sm:px-10 lg:mx-10 lg:px-20 lg:pb-24 lg:pt-20">
          <div className="relative z-10 max-w-3xl reveal">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-[#f4c95d]">
              <Sparkles className="h-4 w-4" /> Phòng thí nghiệm học tập số
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">
              Đừng chỉ học.
              <br />
              <span className="text-[#f4c95d]">Hãy thử nghiệm.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
              Một không gian STEM nơi mỗi câu hỏi trở thành một thí nghiệm, mỗi
              lần sai là một phát hiện mới.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-[#ee6c4d] shadow-[0_4px_0_#b8472e] hover:bg-[#f17a5d]"
                >
                  <span>Bắt đầu khám phá</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-[#172033]"
                >
                  <Play className="mr-2 h-4 w-4 fill-current" /> Xem không gian
                  học
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-12 bottom-[-4rem] hidden h-80 w-80 rounded-full border-[3rem] border-[#ee6c4d]/80 lg:block" />
          <div className="absolute right-24 top-20 hidden rotate-12 lg:block">
            <Atom
              className="h-36 w-36 text-[#f4c95d] opacity-80"
              strokeWidth={1}
            />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 bg-white border-y-4 border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-white border-2 border-b-4 border-slate-200 hover:border-amber-500 transition-colors group text-center cursor-pointer">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-600 group-hover:scale-110 transition-transform">
                  <FlaskConical className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  Interactive Experiments
                </h3>
                <p className="text-slate-500 font-medium">
                  Thực hành mô phỏng ngay trên trình duyệt mà không cần dụng cụ.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white border-2 border-b-4 border-slate-200 hover:border-purple-500 transition-colors group text-center cursor-pointer">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  AI Learning
                </h3>
                <p className="text-slate-500 font-medium">
                  Gia sư AI cá nhân hóa lộ trình học tập và giải đáp thắc mắc
                  24/7.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white border-2 border-b-4 border-slate-200 hover:border-emerald-500 transition-colors group text-center cursor-pointer">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  Teacher Tools
                </h3>
                <p className="text-slate-500 font-medium">
                  Công cụ quản lý lớp học và theo dõi tiến độ chi tiết cho giáo
                  viên.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
