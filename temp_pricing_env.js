const fs = require('fs');
const main = process.env.NEW_MAIN || '';
const shadow = process.env.NEW_SHADOW || '';
if (!main || !shadow) {
  console.error('Set NEW_MAIN and NEW_SHADOW first');
  process.exit(1);
}
if (/-pooler\./.test(main) || /-pooler\./.test(shadow)) {
  console.error('ERROR: pooled host detected. Use DIRECT (non-pooled) URLs.');
  process.exit(2);
}
fs.mkdirSync('prisma/pricing', { recursive: true });
fs.writeFileSync('prisma/pricing/.env.pricing.local', );
const appendVar = (path, key, placeholder) => {
  let txt = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';
  const pattern = new RegExp('^' + key + '=.*$', 'm');
  if (!pattern.test(txt)) {
    if (txt.length && !txt.endsWith('\n')) txt += '\n';
    txt += ;
    fs.writeFileSync(path, txt);
  }
};
appendVar('.env.example', 'DATABASE_URL_PRICING', '<direct neon main url with ?schema=pricing>');
appendVar('.env.example', 'SHADOW_DATABASE_URL_PRICING', '<direct neon shadow url with ?schema=public>');
const mask = (s) => s.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@');
console.log('Wrote prisma/pricing/.env.pricing.local');
console.log('MAIN   =', mask(main));
console.log('SHADOW =', mask(shadow));
