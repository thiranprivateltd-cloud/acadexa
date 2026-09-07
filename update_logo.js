const fs = require('fs');
const buf = fs.readFileSync('assets/logo.png');
const b64 = buf.toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <image href="data:image/png;base64,${b64}" x="0" y="0" width="500" height="500"/>
</svg>`;
fs.writeFileSync('assets/logo.svg', svg);
fs.writeFileSync('assets/favicon.svg', svg);
console.log('Successfully updated assets/logo.svg and assets/favicon.svg with official AC ADEXA brand logo!');
