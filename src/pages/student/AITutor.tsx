import { useState } from 'react';
import { Send, Bot, User, Sparkles, Lightbulb, BookOpen, HelpCircle } from 'lucide-react';
import { AITutorService, AIChatMessage } from '../../services/aiTutorService';

export default function AITutor() {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Chào bạn! Mình là Khê AI Tutor. Mình có thể giúp gì cho bạn trong việc học môn Vật Lý và Toán hôm nay?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMsg: AIChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await AITutorService.sendMessage(text);
    
    const aiMsg: AIChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handlePromptClick = async (action: string) => {
    let msg = '';
    if (action === 'hint') msg = await AITutorService.getHint('Khái niệm hiện tại');
    if (action === 'simplify') msg = await AITutorService.simplifyExplanation('Lý thuyết vừa học');
    
    if (msg) {
       const userMsg: AIChatMessage = { id: Date.now().toString(), role: 'user', content: `Yêu cầu: ${action === 'hint' ? 'Cho gợi ý' : 'Giải thích đơn giản'}`, timestamp: new Date() };
       setMessages(prev => [...prev, userMsg]);
       setIsLoading(true);
       
       setTimeout(() => {
         const aiMsg: AIChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: msg, timestamp: new Date() };
         setMessages(prev => [...prev, aiMsg]);
         setIsLoading(false);
       }, 500);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white rounded-3xl border-2 border-b-4 border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b-2 border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white border-b-4 border-purple-700 shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-xl text-slate-900 flex items-center gap-2">
              Khê AI Tutor <Sparkles className="w-4 h-4 text-amber-400" />
            </h1>
            <p className="text-sm font-bold text-slate-500">Sẵn sàng hỗ trợ 24/7</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`p-4 rounded-2xl max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white font-medium rounded-tr-sm border-b-4 border-blue-700' 
                : 'bg-white border-2 border-slate-200 text-slate-700 font-medium rounded-tl-sm shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 rounded-tl-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
      </div>

      {/* Action Prompts */}
      <div className="px-6 py-4 border-t-2 border-slate-100 bg-white">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => handlePromptClick('simplify')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl border-2 border-emerald-100 hover:bg-emerald-100 whitespace-nowrap">
            <Lightbulb className="w-4 h-4" /> Giải thích đơn giản hơn
          </button>
          <button onClick={() => handlePromptClick('hint')} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 font-bold rounded-xl border-2 border-amber-100 hover:bg-amber-100 whitespace-nowrap">
            <HelpCircle className="w-4 h-4" /> Cho mình gợi ý
          </button>
          <button onClick={() => handleSend('Cho mình một ví dụ thực tế')} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl border-2 border-blue-100 hover:bg-blue-100 whitespace-nowrap">
            <BookOpen className="w-4 h-4" /> Cho ví dụ thực tế
          </button>
          <button onClick={() => handleSend('Tạo cho mình một câu trắc nghiệm')} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 font-bold rounded-xl border-2 border-purple-100 hover:bg-purple-100 whitespace-nowrap">
            <Sparkles className="w-4 h-4" /> Kiểm tra kiến thức
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-4 mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi AI bất cứ điều gì về bài học..."
            className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-14 h-14 bg-purple-500 text-white rounded-2xl flex items-center justify-center border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}
