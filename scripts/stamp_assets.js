/* Stamp every local stylesheet and script link in the site's HTML with a content version:
     href="../css/services.css"  ->  href="../css/services.css?v=<10 hex of sha256>"
   Why: Cloudflare tells browsers to keep css/js for 4 hours. Without a version, a page
   published with new markup can be shown with an old cached stylesheet (Batch 20,
   2026-10-08 23:40: the industries list rendered unstyled). A changed file gets a new
   URL, so browsers fetch it at once; an unchanged file keeps its URL and stays cached.
   The hash is taken over the file with CRLF normalised to LF, so it is the same on the
   Windows checkout and on Render.
   Run after any change to css/ or js/ (idempotent):  node scripts/stamp_assets.js
   tests/pricing-band.test.js fails if any link is missing its version or is stale. */
var fs = require('fs'), path = require('path'), crypto = require('crypto');
var ROOT = path.join(__dirname, '..');

function assetHash(rel) {
  var buf = fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(buf, 'utf8').digest('hex').slice(0, 10);
}
var REF = /((?:href|src)=")((?:\.\.\/)?)((?:css|js)\/[A-Za-z0-9_.\-\/]+\.(?:css|js))(\?v=[0-9a-f]*)?(")/g;

function htmlFiles() {
  var out = fs.readdirSync(ROOT).filter(function (f) { return /\.html$/.test(f); });
  fs.readdirSync(path.join(ROOT, 'pages')).forEach(function (f) { if (/\.html$/.test(f)) out.push('pages/' + f); });
  return out;
}
function stamp(html) {
  return html.replace(REF, function (m, a, up, rel, v, z) {
    if (!fs.existsSync(path.join(ROOT, rel))) return m; // leave unknown links alone; the test reports them
    return a + up + rel + '?v=' + assetHash(rel) + z;
  });
}
module.exports = { assetHash: assetHash, REF: REF, htmlFiles: htmlFiles, stamp: stamp };

if (require.main === module) {
  var changed = 0;
  htmlFiles().forEach(function (f) {
    var p = path.join(ROOT, f), raw = fs.readFileSync(p, 'utf8'), next = stamp(raw);
    if (next !== raw) { fs.writeFileSync(p, next); changed++; console.log('stamped ' + f); }
  });
  console.log(changed + ' file(s) changed');
}
