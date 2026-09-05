import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, GripVertical, Plus, Save, Play, Type, Image as ImageIcon, Video, HelpCircle, Layers, FlaskConical, LayoutTemplate, MoreVertical } from 'lucide-react';
import api from '../../lib/api';

const BLOCK_TYPES = [
  { id: 'heading', name: 'Tiêu đề', icon: Type, color: 'text-blue-500' },
  { id: 'text', name: 'Văn bản', icon: LayoutTemplate, color: 'text-slate-500' },
  { id: 'image', name: 'Hình ảnh', icon: ImageIcon, color: 'text-emerald-500' },
  { id: 'video', name: 'Video', icon: Video, color: 'text-red-500' },
  { id: 'quiz', name: 'Câu hỏi (Quiz)', icon: HelpCircle, color: 'text-purple-500' },
  { id: 'flashcard', name: 'Flashcard', icon: Layers, color: 'text-amber-500' },
  { id: 'experiment', name: 'Thí nghiệm', icon: FlaskConical, color: 'text-cyan-500' },
];

export default function LessonBuilder() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonStatus, setLessonStatus] = useState('DRAFT');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`/courses/lessons/${lessonId}`);
      setLessonTitle(res.data.title);
      setLessonStatus(res.data.status || 'DRAFT');
      
      let parsedContent = [];
      try {
        if (res.data.content) {
          parsedContent = typeof res.data.content === 'string' ? JSON.parse(res.data.content) : res.data.content;
        }
      } catch(e) {
         console.warn("Could not parse content JSON", e);
      }
      setBlocks(Array.isArray(parsedContent) ? parsedContent : []);
      if (parsedContent.length > 0) setActiveBlock(parsedContent[0].id);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải bài giảng');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/courses/lessons/${lessonId}`, {
        title: lessonTitle,
        status: lessonStatus,
        content: blocks
      });
      alert('Đã lưu bài giảng');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu bài giảng');
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type: string) => {
    const newBlock = { id: Date.now().toString(), type, content: '' };
    setBlocks([...blocks, newBlock]);
    setActiveBlock(newBlock.id);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Đang tải...</div>;

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-slate-50 -m-8 font-sans">
      {/* Left: Blocks Palette */}
      <div className="w-72 bg-white border-r-2 border-slate-200 flex flex-col h-full z-10">
        <div className="p-4 border-b-2 border-slate-100">
          <h2 className="font-black text-slate-900 text-lg uppercase tracking-wider">Khối nội dung</h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {BLOCK_TYPES.map(bt => (
            <button 
              key={bt.id}
              onClick={() => addBlock(bt.id)}
              className="w-full flex items-center gap-3 p-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all group text-left"
            >
              <div className={`p-2 bg-slate-50 rounded-lg group-hover:scale-110 transition-transform ${bt.color}`}>
                <bt.icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-700">{bt.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b-2 border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Đang chỉnh sửa</div>
               <input 
                 type="text" 
                 value={lessonTitle}
                 onChange={e => setLessonTitle(e.target.value)}
                 className="font-black text-slate-900 leading-none outline-none bg-transparent"
               />
            </div>
            <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wider ml-2 border ${
              lessonStatus === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
            }`}>
              {lessonStatus}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              <Play className="w-4 h-4" /> Preview
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Lưu JSON'}
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
          <div className="max-w-3xl mx-auto space-y-4 pb-20">
            {blocks.map((block, index) => {
               const isActive = activeBlock === block.id;
               const bt = BLOCK_TYPES.find(b => b.id === block.type);
               return (
                 <div 
                   key={block.id}
                   onClick={() => setActiveBlock(block.id)}
                   className={`relative bg-white rounded-2xl border-2 transition-all cursor-pointer group ${
                     isActive ? 'border-blue-500 shadow-md ring-4 ring-blue-50' : 'border-slate-200 hover:border-slate-300'
                   }`}
                 >
                   {/* Drag Handle */}
                   <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:bg-slate-50 rounded-l-2xl border-r border-slate-100">
                     <GripVertical className="w-5 h-5 text-slate-400" />
                   </div>
                   
                   <div className="pl-12 pr-4 py-4 min-h-[80px]">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          {bt?.icon && <bt.icon className="w-3 h-3" />} {bt?.name}
                       </span>
                       <button className="p-1 hover:bg-slate-100 rounded text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                         <MoreVertical className="w-4 h-4" />
                       </button>
                     </div>
                     {/* Content Preview */}
                     <div className="font-medium text-slate-700">
                       {block.content || <span className="text-slate-300 italic">Nhập nội dung...</span>}
                     </div>
                   </div>
                 </div>
               )
            })}
            
            <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:bg-slate-200 hover:text-slate-600 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Kéo thả khối vào đây
            </button>
          </div>
        </div>
      </div>

      {/* Right: Properties */}
      <div className="w-80 bg-white border-l-2 border-slate-200 flex flex-col h-full z-10">
        <div className="p-4 border-b-2 border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-lg uppercase tracking-wider">Cài đặt</h2>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
           {activeBlock ? (
             <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Block Properties</label>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nội dung</label>
                  <textarea 
                    rows={4}
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:border-blue-500 outline-none mb-3"
                    value={blocks.find(b => b.id === activeBlock)?.content}
                    onChange={(e) => {
                      setBlocks(blocks.map(b => b.id === activeBlock ? {...b, content: e.target.value} : b))
                    }}
                    placeholder="Nhập nội dung tại đây..."
                  />
                </div>
                {blocks.find(b => b.id === activeBlock)?.type === 'heading' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Cấp độ (H1-H6)</label>
                    <select className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold outline-none">
                      <option>H2 (Mặc định)</option>
                      <option>H3</option>
                    </select>
                  </div>
                )}
                {blocks.find(b => b.id === activeBlock)?.type === 'quiz' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Chọn ID câu hỏi</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold outline-none" placeholder="VD: q_123" />
                  </div>
                )}
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center mb-8">
               <LayoutTemplate className="w-12 h-12 mb-4 opacity-50" />
               <p className="font-bold">Chọn một khối để xem thuộc tính</p>
             </div>
           )}

           <hr className="my-8 border-2 border-slate-100 border-dashed" />
           
           <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Lesson Settings</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Trạng thái (Status)</label>
                <select 
                  value={lessonStatus}
                  onChange={e => setLessonStatus(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold outline-none text-sm cursor-pointer"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="AI_GENERATED">AI_GENERATED</option>
                  <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                  <option value="REVIEWED">REVIEWED</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Version History</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div>
                      <p className="font-bold text-blue-700 text-sm">Version 3 (Current)</p>
                      <p className="text-xs font-bold text-blue-500 mt-1 uppercase">Just now</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-700 text-sm">Version 2</p>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase">1 hour ago</p>
                    </div>
                    <button className="text-xs font-bold text-slate-400 hover:text-blue-500 hover:underline">Rollback</button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-700 text-sm">Version 1</p>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Yesterday</p>
                    </div>
                    <button className="text-xs font-bold text-slate-400 hover:text-blue-500 hover:underline">Rollback</button>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
