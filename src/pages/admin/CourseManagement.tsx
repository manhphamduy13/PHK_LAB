import { useState } from 'react';
import { Plus, Search, Edit3, Trash2, GripVertical, ChevronDown, ChevronRight, Layers, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_COURSES = [
  { id: '1', title: 'Vật Lý 10', grade: 'Lớp 10', subject: 'Vật Lý', status: 'PUBLISHED', lessons: 12 },
  { id: '2', title: 'Hóa Học 10', grade: 'Lớp 10', subject: 'Hóa Học', status: 'DRAFT', lessons: 0 },
];

export default function CourseManagement() {
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [expandedCourse, setExpandedCourse] = useState<string | null>('1');

  const chapters = [
    { id: 'c1', title: 'Chương 1: Động học chất điểm' },
    { id: 'c2', title: 'Chương 2: Động lực học chất điểm' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Quản lý Khóa học</h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">Quản lý nội dung, chương mục, và bài giảng</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all border-b-4 border-blue-700 active:border-b-0 active:translate-y-1">
          <Plus className="w-5 h-5" /> Khóa học mới
        </button>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
        <div className="p-4 border-b-2 border-slate-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm khóa học..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-colors"
            />
          </div>
          <select className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer">
            <option>Tất cả môn học</option>
            <option>Vật Lý</option>
            <option>Hóa Học</option>
          </select>
        </div>

        <div className="divide-y-2 divide-slate-100">
          {courses.map(course => (
            <div key={course.id}>
              <div 
                className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
              >
                <div className="text-slate-400">
                  {expandedCourse === course.id ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500">
                  <Layers className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900">{course.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">{course.grade}</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">{course.subject}</span>
                    <span className="text-sm font-bold text-slate-400">{course.lessons} bài giảng</span>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1.5 text-xs font-black rounded-lg uppercase tracking-wider ${
                    course.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {course.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" onClick={(e) => e.stopPropagation()}>
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Course Chapters Expanded */}
              {expandedCourse === course.id && (
                <div className="bg-slate-50 border-t-2 border-slate-100 p-6 pl-24">
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="font-black text-slate-700 uppercase tracking-wider text-sm">Cấu trúc Chương mục</h4>
                     <button className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                       <Plus className="w-4 h-4" /> Thêm chương
                     </button>
                   </div>
                   
                   <div className="space-y-3">
                     {chapters.map(chapter => (
                       <div key={chapter.id} className="bg-white border-2 border-slate-200 rounded-xl p-4 flex items-center gap-4 group">
                          <div className="cursor-grab opacity-50 group-hover:opacity-100">
                            <GripVertical className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="flex-1 font-bold text-slate-800">{chapter.title}</div>
                          <div className="flex gap-2">
                            <Link to="/admin/lessons/l1/editor" className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100">
                              <Plus className="w-4 h-4" /> Bài giảng
                            </Link>
                            <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
