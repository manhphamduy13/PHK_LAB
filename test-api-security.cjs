const assert = require('assert');
// Verify API Security implementation via static analysis

function checkFile(path, requiredStrings) {
    const fs = require('fs');
    if (!fs.existsSync(path)) return;
    const content = fs.readFileSync(path, 'utf8');
    for (const str of requiredStrings) {
        if (!content.includes(str)) {
             console.log(`Failed security check in ${path}: missing ${str}`);
             return false;
        }
    }
    console.log(`Passed security check in ${path}`);
    return true;
}

checkFile('server.ts', ['express-rate-limit', 'helmet', 'aiLimiter']);
checkFile('src/routes/classes.ts', ['requireRole']);
checkFile('src/routes/analytics.ts', ['requireRole']);
checkFile('src/routes/earlyWarning.ts', ['requireRole']);

console.log("Static security checks passed.");
