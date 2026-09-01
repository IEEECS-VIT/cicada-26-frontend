const fs = require('fs');
let content = fs.readFileSync('src/components/Admin/modals/AdminModals.jsx', 'utf8');

// Replace the grid container and inputs
content = content.replace(
  `                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Asset Name (e.g. file.zip)"
                        className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                        value={tempAssetName}
                        onChange={(e) => setTempAssetName(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="URL (optional)"
                        className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                        value={tempAssetUrl}
                        onChange={(e) => setTempAssetUrl(e.target.value)}
                      />
                    </div>`,
  `                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Name (e.g. file.zip)"
                        className="w-full border border-copper/25 bg-black/50 p-2.5 text-xs text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                        value={tempAssetName}
                        onChange={(e) => setTempAssetName(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="URL (optional)"
                        className="w-full border border-copper/25 bg-black/50 p-2.5 text-xs text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                        value={tempAssetUrl}
                        onChange={(e) => setTempAssetUrl(e.target.value)}
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Set # (Opt)"
                        className="w-full border border-copper/25 bg-black/50 p-2.5 text-xs text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                        value={tempAssetSet || ''}
                        onChange={(e) => setTempAssetSet(e.target.value)}
                        title="Leave empty for all teams"
                      />
                    </div>`
);

// We already added tempAssetSet to the destructuring in the previous commit/patch?
// Let's verify if it's there. We can blindly replace if it's not.
if (!content.includes('tempAssetSet,')) {
    content = content.replace(
      `    tempAssetUrl,
    setTempAssetUrl,`,
      `    tempAssetUrl,
    setTempAssetUrl,
    tempAssetSet,
    setTempAssetSet,`
    );
}

fs.writeFileSync('src/components/Admin/modals/AdminModals.jsx', content);
