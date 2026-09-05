import fs from 'fs';

let content = fs.readFileSync('src/routes/teacherAI.ts', 'utf8');
content = content.replace(
  "        // Find students in teacher's courses (mocked by all for this simple prototype or filtered by course)",
  "        // Use real Class enrollments for analytics"
);
fs.writeFileSync('src/routes/teacherAI.ts', content);
console.log('Fixed comment in teacherAI.ts');
