const fs = require('fs');
let content = fs.readFileSync('src/services/ai/PipelineManager.ts', 'utf8');
content = content.replace("sourceDocumentId: documentId,", "");
fs.writeFileSync('src/services/ai/PipelineManager.ts', content);
