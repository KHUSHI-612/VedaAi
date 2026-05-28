const fs = require('fs');
const code = fs.readFileSync('/Users/khushii/vedai-assesment/frontend/src/app/dashboard/create/page.tsx', 'utf8');

let depth = 0;
let lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  // Basic JSX open tag matching that doesn't self-close
  let opens = (line.match(/<div(\s+[^>]*)?>/g) || []).length;
  // Basic JSX close tag matching
  let closes = (line.match(/<\/div>/g) || []).length;
  
  depth += opens - closes;
  if (depth < 0) {
    console.log(`Too many closes at line ${i + 1}!`);
    break;
  }
}
console.log(`Final depth: ${depth}`);
