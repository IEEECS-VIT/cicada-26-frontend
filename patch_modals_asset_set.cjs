const fs = require('fs');
let content = fs.readFileSync('src/components/Admin/modals/AdminModals.jsx', 'utf8');

// Update destructuring
content = content.replace(
  `    tempAssetUrl,
    setTempAssetUrl,`,
  `    tempAssetUrl,
    setTempAssetUrl,
    tempAssetSet,
    setTempAssetSet,`
);

// Add input field to the grid
content = content.replace(
  `                    <div className="grid grid-cols-2 gap-2 mb-2">
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
  `                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Name (e.g. file.zip)"
                        className="w-full border border-copper/25 bg-black/50 p-2.5 text-[11px] text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                        value={tempAssetName}
                        onChange={(e) => setTempAssetName(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="URL (optional)"
                        className="w-full border border-copper/25 bg-black/50 p-2.5 text-[11px] text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                        value={tempAssetUrl}
                        onChange={(e) => setTempAssetUrl(e.target.value)}
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Set # (opt)"
                        className="w-full border border-copper/25 bg-black/50 p-2.5 text-[11px] text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                        value={tempAssetSet || ''}
                        onChange={(e) => setTempAssetSet(e.target.value)}
                        title="Asset Set Number (Leave empty to share with all teams)"
                      />
                    </div>`
);

fs.writeFileSync('src/components/Admin/modals/AdminModals.jsx', content);
