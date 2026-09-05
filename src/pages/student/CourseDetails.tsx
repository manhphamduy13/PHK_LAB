import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, Lock, BookOpen } from 'lucide-react';

const DUMMY_COURSE = {
  id: 'c1',
  title: 'Vật Lý 10 Cơ Bản',
  description: 'Khám phá thế giới vật chất, từ chuyển động của các hạt vi mô đến các hành tinh trong hệ mặt trời.',
  progress: 25,
  chapters: [
    {
      id: 'ch1',
      title: 'Chương 1: Động Học Chất Điểm',
      lessons: [
        { id: 'l1', title: 'Bài 1: Chuyển động cơ', status: 'completed' },
        { id: 'l2', title: 'Bài 2: Chuyển động thẳng đều', status: 'completed' },
        { id: 'l3', title: 'Bài 3: Chuyển động thẳng biến đổi đều', status: 'current' },
        { id: 'l4', title: 'Bài 4: Sự rơi tự do', status: 'locked' },
      ]
    },
    {
      id: 'ch2',
      title: 'Chương 2: Động Lực Học Chất Điểm',
      lessons: [
        { id: 'l5', title: 'Bài 1: Lực và Gia tốc', status: 'locked' },
        { id: 'l6', title: 'Bài 2: Ba định luật Newton', status: 'locked' },
      ]
    }
  ]
};

export default function CourseDetails() {
  const { id } = useParams();
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Link to="/student/courses" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </Link>

      {/* Course Header */}
      <div className="bg-blue-500 rounded-3xl p-8 border-b-4 border-blue-700 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold uppercase tracking-wider">THPT</span>
            <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold uppercase tracking-wider">Vật Lý</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4">{DUMMY_COURSE.title}</h1>
          <p className="text-blue-100 font-medium text-lg leading-relaxed mb-8">{DUMMY_COURSE.description}</p>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/20 h-3 rounded-full overflow-hidden">
              <div className="bg-white h-full rounded-full" style={{ width: `${DUMMY_COURSE.progress}%` }} />
            </div>
            <span className="font-black">{DUMMY_COURSE.progress}%</span>
          </div>
        </div>
        <div className="absolute right-0 top-0 text-9xl opacity-10 translate-x-4 -translate-y-4">⚛️</div>
      </div>

      {/* Chapters */}
      <div className="space-y-6">
        {DUMMY_COURSE.chapters.map((chapter, index) => (
          <div key={chapter.id} className="bg-white rounded-3xl border-2 border-b-4 border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b-2 border-slate-100">
              <h2 className="text-xl font-black text-slate-900">{chapter.title}</h2>
            </div>
            <div className="p-4 space-y-2">
              {chapter.lessons.map((lesson) => (
                <Link 
                  to={lesson.status !== 'locked' ? `/student/lessons/${lesson.id}` : '#'}
                  key={lesson.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    lesson.status === 'completed' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-900 hover:border-emerald-300' 
                      : lesson.status === 'current'
                      ? 'bg-blue-50 border-blue-200 text-blue-900 hover:border-blue-400 hover:-translate-y-1'
                      : 'bg-slate-50 border-transparent text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      lesson.status === 'completed' ? 'bg-emerald-200 text-emerald-700' :
                      lesson.status === 'current' ? 'bg-blue-500 text-white' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      {lesson.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                       lesson.status === 'current' ? <Play className="w-5 h-5 ml-1" /> :
                       <Lock className="w-5 h-5" />}
                    </div>
                    <span className="font-bold">{lesson.title}</span>
                  </div>
                  {lesson.status === 'current' && (
                    <span className="px-3 py-1 bg-white rounded-lg text-blue-600 text-xs font-bold border border-blue-100 shadow-sm">
                      Tiếp tục học
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
