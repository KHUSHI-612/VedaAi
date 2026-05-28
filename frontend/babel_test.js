const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('/Users/khushii/vedai-assesment/frontend/src/app/dashboard/create/page.tsx', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log('Babel parsed successfully!');
} catch (e) {
  console.error('Babel parse error:', e.message);
}
