import { useEffect, useState } from "react";
import { type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FlaskConical } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuthStore } from "../../store/authStore";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/classes/options")
      .then((response) => (response.ok ? response.json() : []))
      .then(setClasses)
      .catch(() => setClasses([]));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          classId: classId || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Không thể tạo tài khoản");
      login(data.user, data.token || "");
      navigate("/student");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Không thể tạo tài khoản",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="display-grid flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden bg-[#172033] p-10 text-white lg:block">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" /> Về trang chủ
          </Link>
          <div className="mt-20">
            <FlaskConical className="h-12 w-12 text-[#f4c95d]" />
            <h1 className="mt-8 text-4xl font-bold leading-tight">
              Sẵn sàng đặt câu hỏi lớn hơn?
            </h1>
            <p className="mt-5 leading-7 text-slate-300">
              Tạo không gian học tập của riêng em và bắt đầu với một thí nghiệm
              đầu tiên.
            </p>
          </div>
          <div className="mt-16 space-y-4 text-sm font-semibold text-slate-300">
            <p className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#9ed8c5]" /> Lộ trình học
              rõ ràng
            </p>
            <p className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#9ed8c5]" /> Gia sư AI luôn
              sẵn sàng
            </p>
          </div>
        </div>
        <div className="p-7 sm:p-12">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" /> Về trang chủ
          </Link>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ee6c4d]">
            PHK STEM LAB
          </p>
          <h2 className="mt-3 text-3xl font-bold">Tạo tài khoản học sinh</h2>
          <p className="mt-2 text-slate-500">
            Miễn phí để bắt đầu hành trình khám phá.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}
            <div>
              <label className="mb-2 block text-sm font-bold">Họ và tên</label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nguyễn Minh Anh"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="em@example.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold">Mật khẩu</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ít nhất 8 ký tự"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold">Lớp học</label>
              <select
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-bold"
                required
              >
                <option value="">Chọn lớp học</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - GV: {item.teacherName}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              className="mt-2 w-full bg-[#ee6c4d] shadow-[0_4px_0_#b8472e] hover:bg-[#f17a5d]"
              disabled={loading}
            >
              {loading ? "Đang tạo tài khoản..." : "Bắt đầu học"}
            </Button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="font-bold text-[#ee6c4d] hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
