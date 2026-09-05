const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TeacherAIAssistant.tsx', 'utf8');

const target = `      const data = await res.json();`;
const replacement = `      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Hệ thống đang quá tải, vui lòng thử lại sau.");
        }
        throw new Error("Lỗi kết nối tới Teacher AI");
      }
      const data = await res.json();`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/admin/TeacherAIAssistant.tsx', code);
