import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { FlaskConical, Bot, Users } from "lucide-react";

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
            <Button variant="ghost" className="font-bold">Đăng nhập</Button>
          </Link>
          <Link to="/register">
            <Button>Đăng ký miễn phí</Button>
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6">
            ✨ Phiên bản thử nghiệm Phase 2 (CMS & Admin)
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            HỌC KHOA HỌC BẰNG CÁCH <span className="text-blue-600">KHÁM PHÁ</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
            "Biến những bài học khô khan thành những trải nghiệm tương tác." Nền tảng học tập STEM được thiết kế dành riêng cho học sinh.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">Bắt đầu học ngay</Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
              <FlaskConical className="w-5 h-5" />
              Khám phá thí nghiệm
            </Button>
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
                <h3 className="text-xl font-black text-slate-900 mb-3">Interactive Experiments</h3>
                <p className="text-slate-500 font-medium">Thực hành mô phỏng ngay trên trình duyệt mà không cần dụng cụ.</p>
              </div>
              <div className="p-8 rounded-3xl bg-white border-2 border-b-4 border-slate-200 hover:border-purple-500 transition-colors group text-center cursor-pointer">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">AI Learning</h3>
                <p className="text-slate-500 font-medium">Gia sư AI cá nhân hóa lộ trình học tập và giải đáp thắc mắc 24/7.</p>
              </div>
              <div className="p-8 rounded-3xl bg-white border-2 border-b-4 border-slate-200 hover:border-emerald-500 transition-colors group text-center cursor-pointer">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Teacher Tools</h3>
                <p className="text-slate-500 font-medium">Công cụ quản lý lớp học và theo dõi tiến độ chi tiết cho giáo viên.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
