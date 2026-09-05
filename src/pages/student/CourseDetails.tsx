import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, Lock, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Đang tải...</div>;
  if (!course) return <div className="p-8 text-center text-red-500 font-bold">Không tìm thấy khóa học</div>;

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
            <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold uppercase tracking-wider">{course.grade || 'THPT'}</span>
            <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold uppercase tracking-wider">{course.subject || 'Vật Lý'}</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4">{course.title}</h1>
          <p className="text-blue-100 font-medium text-lg leading-relaxed mb-8">{course.description}</p>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/20 h-3 rounded-full overflow-hidden">
              <div className="bg-white h-full rounded-full" style={{ width: `${course.progress || 0}%` }} />
            </div>
            <span className="font-black">{course.progress || 0}%</span>
          </div>
        </div>
        <div className="absolute right-0 top-0 text-9xl opacity-10 translate-x-4 -translate-y-4">⚛️</div>
      </div>

      {/* Chapters */}
      <div className="space-y-6">
        {course.chapters?.map((chapter: any, index: number) => (
          <div key={chapter.id} className="bg-white rounded-3xl border-2 border-b-4 border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b-2 border-slate-100">
              <h2 className="text-xl font-black text-slate-900">{chapter.title}</h2>
            </div>
            <div className="p-4 space-y-2">
              {chapter.lessons?.map((lesson: any) => (
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
