import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, FlaskConical, CheckCircle2, MessageSquare } from 'lucide-react';
import { useStudentStore } from '../../store/studentStore';
import { SimulationPlayer } from '../../components/simulation/SimulationPlayer';
import { SimulationSpecification } from '../../types/simulation';

const OHMS_LAW_SPEC: SimulationSpecification = {
  id: 'sim_ohm_1',
  type: 'OhmsLawSimulation',
  version: '1.0',
  title: 'Khảo sát định luật Ôm',
  description: 'Mối quan hệ giữa cường độ dòng điện và hiệu điện thế',
  subject: 'Physics',
  grade: 8,
  parameters: [
    { id: 'U', label: 'Hiệu điện thế', symbol: 'U', unit: 'V', type: 'number', min: 0, max: 24, default: 6, step: 0.1 },
    { id: 'R', label: 'Điện trở', symbol: 'R', unit: 'Ω', type: 'number', min: 1, max: 100, default: 10, step: 1 },
    { id: 'I', label: 'Cường độ dòng điện', symbol: 'I', unit: 'A', type: 'number', min: 0, max: 24, default: 0.6, step: 0.01 },
  ],
  objects: [],
  formulas: [
    { id: 'f_i', target: 'I', expression: 'U / R', dependencies: ['U', 'R'] }
  ],
  constraints: [
    { id: 'c_r_positive', expression: 'R > 0', errorMessage: 'Điện trở phải lớn hơn 0' }
  ],
  charts: [
    { id: 'chart_1', title: 'Đồ thị U - I', xAxis: 'U', yAxis: 'I', type: 'line' }
  ],
  questions: []
};

const LESSON_DATA = {
  title: 'Định luật Ôm',
  sections: [
    { id: 's1', title: 'Khởi động', type: 'text', content: 'Dòng điện chạy qua một dây dẫn phụ thuộc như thế nào vào hiệu điện thế đặt vào hai đầu dây dẫn đó?' },
    { id: 's2', title: 'Thí nghiệm', type: 'simulation', content: OHMS_LAW_SPEC },
    { id: 's3', title: 'Câu hỏi', type: 'quiz', content: 'Cường độ dòng điện chạy qua dây dẫn tỉ lệ thuận với đại lượng nào?' },
  ]
};

export default function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const { addXP, incrementLessons } = useStudentStore();
  
  const section = LESSON_DATA.sections[currentSection];
  const progress = ((currentSection + 1) / LESSON_DATA.sections.length) * 100;
  const isLast = currentSection === LESSON_DATA.sections.length - 1;

  const handleNext = () => {
    if (isLast) {
      addXP(50);
      incrementLessons();
      navigate('/student/courses/c1');
    } else {
      setCurrentSection(curr => curr + 1);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-7xl mx-auto">
      {/* Header & Progress */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <h1 className="font-black text-slate-900">{LESSON_DATA.title}</h1>
            <span className="text-sm font-bold text-slate-500">{currentSection + 1} / {LESSON_DATA.sections.length}</span>
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto mb-8 bg-white rounded-3xl border-2 border-b-4 border-slate-200 p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-right-8 duration-300" key={currentSection}>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-bold mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          {section.title}
        </div>

        {section.type === 'text' && (
          <div className="prose prose-slate prose-lg max-w-none">
            <p className="text-xl leading-relaxed text-slate-700 font-medium">{section.content as string}</p>
          </div>
        )}

        {section.type === 'simulation' && (
          <SimulationPlayer spec={section.content as SimulationSpecification} />
        )}

        {section.type === 'quiz' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-black text-slate-900">{section.content as string}</h3>
            <div className="space-y-3">
              {['Hiệu điện thế', 'Điện trở', 'Nhiệt độ', 'Thời gian'].map((ans, idx) => (
                <button key={idx} className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 font-bold text-slate-700 transition-colors">
                  {ans}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setCurrentSection(c => Math.max(0, c - 1))}
          disabled={currentSection === 0}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-slate-500 bg-white border-2 border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" /> Quay lại
        </button>

        <div className="flex gap-4">
          <button className="flex items-center gap-2 w-14 h-14 justify-center rounded-2xl font-bold text-blue-600 bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 transition-colors">
            <MessageSquare className="w-6 h-6" />
          </button>
          
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-blue-500 border-2 border-b-4 border-blue-700 active:border-b-2 active:translate-y-[2px] transition-all hover:bg-blue-400"
          >
            {isLast ? (
              <>Hoàn thành <CheckCircle2 className="w-5 h-5" /></>
            ) : (
              <>Tiếp tục <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
