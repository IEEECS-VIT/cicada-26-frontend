const fs = require('fs');
let content = fs.readFileSync('src/components/Admin/modals/AdminModals.jsx', 'utf8');

// 1. Add Asset Set field to Edit Asset modal
content = content.replace(
  `                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditAssetModal(false);
                      setActiveAsset(null);
                      setActiveAssetChallengeId('');`,
  `                <div>
                  <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Asset Set Number (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave empty for all teams"
                    className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    value={editAssetSet || ''}
                    onChange={(e) => setEditAssetSet(e.target.value)}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditAssetModal(false);
                      setActiveAsset(null);
                      setActiveAssetChallengeId('');`
);

// Add editAssetSet to the destructuring
content = content.replace(
  `    setEditAssetUrl,`,
  `    setEditAssetUrl,
    editAssetSet,
    setEditAssetSet,`
);

content = content.replace(
  `    setEditTeamDisqualified,`,
  `    setEditTeamDisqualified,
    editTeamAssetSet,
    setEditTeamAssetSet,`
);

// 2. Add Team Asset Set to Edit Team modal
content = content.replace(
  `                <div className="flex items-center justify-between border border-copper/25 bg-black/50 p-3">
                  <label className="font-rajdhani text-[11px] tracking-[0.22em] text-copper">
                    Disqualified Status
                  </label>`,
  `                <div>
                  <label className="mb-1.5 block font-rajdhani text-[11px] tracking-[0.22em] text-copper">Assigned Asset Set (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter set number, or 'null' for automatic"
                    className="w-full border border-copper/25 bg-black/50 p-2.5 text-sm text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
                    value={editTeamAssetSet || ''}
                    onChange={(e) => setEditTeamAssetSet(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between border border-copper/25 bg-black/50 p-3 mt-4">
                  <label className="font-rajdhani text-[11px] tracking-[0.22em] text-copper">
                    Disqualified Status
                  </label>`
);

fs.writeFileSync('src/components/Admin/modals/AdminModals.jsx', content);
