#!/bin/bash
FILE="src/App.jsx"

sed -i '' 's/const toastRef = useRef(null);/const toastRef = useRef(null);\n  const [shareOpen, setShareOpen] = useState(false);/' "$FILE"

node -e "
const fs = require('fs');
let src = fs.readFileSync('$FILE', 'utf8');

const oldFn = \`  function copyShare() {
    if (!result) return;
    const unit = UNIT_TYPES.find(u => u.key === form.unitType)?.label?.toLowerCase() || \"unit\";
    const txt = \\\`Vancouver Fair Rent: I'm paying \\\${result.todayPct > 0 ? \"+\" : \"\"}\\\${result.todayPct}% vs today's market for a \\\${unit} in \\\${form.neighborhood}. vancouverfairrent.ca\\\`;
    navigator.clipboard?.writeText(txt);
    setToast(true);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(false), 2800);
  }\`;

const newFn = \`  function getShareText() {
    const unit = UNIT_TYPES.find(u => u.key === form.unitType)?.label?.toLowerCase() || \"unit\";
    return \\\`Vancouver Fair Rent: I'm paying \\\${result.todayPct > 0 ? \"+\" : \"\"}\\\${result.todayPct}% vs today's market for a \\\${unit} in \\\${form.neighborhood}. vancouverfairrent.ca\\\`;
  }

  function copyLink() {
    navigator.clipboard?.writeText('https://vancouverfairrent.ca');
    setToast(true);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(false), 2800);
  }

  function nativeShare() {
    if (navigator.share) {
      navigator.share({ title: 'Vancouver Fair Rent', text: getShareText(), url: 'https://vancouverfairrent.ca' }).catch(() => {});
    }
  }\`;

src = src.replace(oldFn, newFn);
fs.writeFileSync('$FILE', src);
console.log('functions done');
"

node -e "
const fs = require('fs');
let src = fs.readFileSync('$FILE', 'utf8');

const oldBtn = \`              <div className={\\\`cta \\\${revealed ? \"reveal d5\" : \"\"}\\\`} style={{ display: \"grid\", gridTemplateColumns: \"1fr 1fr\", gap: 12 }}>
                <button className=\"btn-ghost\" onClick={handleReset}>← Check Another</button>
                <button className=\"btn-dark\"  onClick={copyShare}>Share Result</button>
              </div>\`;

const newBtn = \`              <div className={\\\`cta \\\${revealed ? \"reveal d5\" : \"\"}\\\`} style={{ display: \"grid\", gridTemplateColumns: \"1fr 1fr\", gap: 12 }}>
                <button className=\"btn-ghost\" onClick={handleReset}>← Check Another</button>
                <button className=\"btn-dark\" onClick={() => setShareOpen(s => !s)}>Share Result ↗</button>
              </div>

              {shareOpen && (
                <div style={{ background: \"var(--paper-tint)\", border: \"1px solid var(--rule)\", borderRadius: 10, padding: \"16px 18px\", display: \"flex\", flexDirection: \"column\", gap: 10 }}>
                  <div style={{ fontFamily: \"'DM Mono', monospace\", fontSize: 10, letterSpacing: \".1em\", textTransform: \"uppercase\", color: \"var(--ink-muted)\", marginBottom: 2 }}>Share your result</div>
                  <div style={{ display: \"grid\", gridTemplateColumns: \"1fr 1fr\", gap: 8 }}>
                    <a href={\\\`https://www.reddit.com/submit?url=https://vancouverfairrent.ca&title=\\\${encodeURIComponent(getShareText())}\\\`} target=\"_blank\" rel=\"noopener noreferrer\" style={{ display: \"flex\", alignItems: \"center\", justifyContent: \"center\", padding: \"10px\", background: \"#ff4500\", color: \"white\", borderRadius: 7, fontFamily: \"'DM Mono', monospace\", fontSize: 11, fontWeight: 600, textDecoration: \"none\", letterSpacing: \".04em\" }}>Reddit</a>
                    <a href={\\\`https://twitter.com/intent/tweet?text=\\\${encodeURIComponent(getShareText())}\\\`} target=\"_blank\" rel=\"noopener noreferrer\" style={{ display: \"flex\", alignItems: \"center\", justifyContent: \"center\", padding: \"10px\", background: \"#000\", color: \"white\", borderRadius: 7, fontFamily: \"'DM Mono', monospace\", fontSize: 11, fontWeight: 600, textDecoration: \"none\", letterSpacing: \".04em\" }}>X / Twitter</a>
                    <a href={\\\`https://www.threads.net/intent/post?text=\\\${encodeURIComponent(getShareText())}\\\`} target=\"_blank\" rel=\"noopener noreferrer\" style={{ display: \"flex\", alignItems: \"center\", justifyContent: \"center\", padding: \"10px\", background: \"#000\", color: \"white\", borderRadius: 7, fontFamily: \"'DM Mono', monospace\", fontSize: 11, fontWeight: 600, textDecoration: \"none\", letterSpacing: \".04em\" }}>Threads</a>
                    {navigator.share ? (
                      <button onClick={nativeShare} style={{ display: \"flex\", alignItems: \"center\", justifyContent: \"center\", padding: \"10px\", background: \"var(--ink)\", color: \"white\", border: \"none\", borderRadius: 7, fontFamily: \"'DM Mono', monospace\", fontSize: 11, fontWeight: 600, cursor: \"pointer\", letterSpacing: \".04em\" }}>More ↗</button>
                    ) : (
                      <button onClick={copyLink} style={{ display: \"flex\", alignItems: \"center\", justifyContent: \"center\", padding: \"10px\", background: \"var(--ink)\", color: \"white\", border: \"none\", borderRadius: 7, fontFamily: \"'DM Mono', monospace\", fontSize: 11, fontWeight: 600, cursor: \"pointer\", letterSpacing: \".04em\" }}>Copy Link</button>
                    )}
                  </div>
                </div>
              )}\`;

src = src.replace(oldBtn, newBtn);
fs.writeFileSync('$FILE', src);
console.log('panel done');
"
echo "Vancouver done"
