import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, AlertCircle, BarChart2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLocation } from 'react-router-dom';

export default function TeacherAIAssistant() {
  const location = useLocation();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState(location.state?.prefill || '');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (location.state?.prefill) {
      setInput(location.state.prefill);
    }
  }, [location.state]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);


  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/teacher/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: input })
      });
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Hệ thống đang quá tải, vui lòng thử lại sau.");
        }
        throw new Error("Lỗi kết nối tới Teacher AI");
      }
      const data = await res.json();
      
      const aiMessage = {
        role: 'assistant',
        content: data.summary,
        insights: data.insights,
        recommendedActions: data.recommendedActions
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lỗi kết nối Khê AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Khê Teacher AI</h1>
          <p className="text-slate-500 font-bold">Trợ lý phân tích dữ liệu lớp học</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-3xl border-2 border-b-4 border-slate-200 p-6 flex flex-col gap-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mb-6">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Tôi có thể giúp gì cho thầy/cô?</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Hỏi tôi về tiến độ học tập, những khái niệm học sinh đang yếu, hoặc yêu cầu tạo kế hoạch ôn tập.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setInput('Những học sinh nào yếu phần Định luật Ôm?')} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:border-blue-300">
                Học sinh yếu Định luật Ôm
              </button>
              <button onClick={() => setInput('Tạo bài ôn tập cho lớp 8A1')} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:border-blue-300">
                Tạo bài ôn tập
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[70%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                {msg.content}
              </div>
              
              {msg.insights && msg.insights.length > 0 && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl text-left">
                  <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Phân tích</h4>
                  <ul className="list-disc list-inside text-sm text-orange-900 space-y-1">
                    {msg.insights.map((ins: string, idx: number) => <li key={idx}>{ins}</li>)}
                  </ul>
                </div>
              )}
              
              {msg.recommendedActions && msg.recommendedActions.length > 0 && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left">
                  <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Đề xuất</h4>
                  <div className="flex flex-wrap gap-2">
                    {msg.recommendedActions.map((action: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-white border border-emerald-200 text-emerald-700 font-bold text-xs rounded-lg uppercase">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-100 p-4 rounded-2xl flex gap-2 items-center">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-6 flex gap-4">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nhập câu hỏi hoặc yêu cầu..."
          className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-medium"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-8 py-4 bg-blue-500 text-white font-black rounded-2xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
