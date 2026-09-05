const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AIPipelineDashboard.tsx', 'utf8');

const target1 = `      const res = await fetch('/api/ai/jobs', {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      const data = await res.json();`;
const rep1 = `      const res = await fetch('/api/ai/jobs', {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (!res.ok) return; // Prevent parsing errors on rate limit
      const data = await res.json();`;

code = code.replace(target1, rep1);

const target2 = `      const res = await fetch('/api/ai/upload-pdf', {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\` },
        body: formData
      });
      
      const data = await res.json();`;
      
const rep2 = `      const res = await fetch('/api/ai/upload-pdf', {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\` },
        body: formData
      });
      
      if (!res.ok) {
        if (res.status === 429) alert("Hệ thống quá tải, xin thử lại sau.");
        else alert("Lỗi tải lên tài liệu");
        return;
      }
      
      const data = await res.json();`;
      
code = code.replace(target2, rep2);
fs.writeFileSync('src/pages/admin/AIPipelineDashboard.tsx', code);
