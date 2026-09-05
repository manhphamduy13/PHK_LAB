const fs = require('fs');

const path = 'src/layouts/AdminLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add GraduationCap to lucide-react imports
content = content.replace(
    /Sparkles\n} from 'lucide-react';/, 
    "Sparkles,\n  GraduationCap\n} from 'lucide-react';"
);

// Add ClassManagement to navItems
content = content.replace(
    /\{ icon: BookOpen, label: 'Khóa học', path: '\/admin\/courses' \},/,
    "{ icon: BookOpen, label: 'Khóa học', path: '/admin/courses' },\n    { icon: GraduationCap, label: 'Lớp học', path: '/admin/classes' },"
);

fs.writeFileSync(path, content);
