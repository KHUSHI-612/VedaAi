const fs = require('fs');
const content = fs.readFileSync('/Users/khushii/vedai-assesment/frontend/src/app/dashboard/create/page.tsx', 'utf8');

const lines = content.split('\n');
const stack = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Very rough regex for opening and closing tags on a single line
  const opens = (line.match(/<div(\s|>)/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  
  for (let j = 0; j < opens; j++) stack.push(i + 1);
  for (let j = 0; j < closes; j++) {
    if (stack.length > 0) {
      stack.pop();
    } else {
      console.log('Unmatched close tag at line', i + 1);
    }
  }
}
console.log('Unclosed tags opened at lines:', stack);
