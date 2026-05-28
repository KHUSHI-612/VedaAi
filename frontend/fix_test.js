const fs = require('fs');
let code = fs.readFileSync('/Users/khushii/vedai-assesment/frontend/src/app/dashboard/create/page.tsx', 'utf8');
code = code.replace(/  <\/div> \{\/\* End Outer Layout Container \*\/\}\n/g, '');
fs.writeFileSync('/Users/khushii/vedai-assesment/frontend/src/app/dashboard/create/page.tsx', code);
