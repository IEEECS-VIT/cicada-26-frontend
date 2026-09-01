const fs = require('fs');
let content = fs.readFileSync('src/components/Admin/tabs/ChallengesTab.jsx', 'utf8');

content = content.replace(
  `    setEditAssetName,
    setEditAssetUrl,`,
  `    setEditAssetName,
    setEditAssetUrl,
    setEditAssetSet,`
);

content = content.replace(
  `                                          setEditAssetName(asset.name);
                                          setEditAssetUrl(asset.url);
                                          setShowEditAssetModal(true);`,
  `                                          setEditAssetName(asset.name);
                                          setEditAssetUrl(asset.url);
                                          setEditAssetSet(asset.asset_set || '');
                                          setShowEditAssetModal(true);`
);

fs.writeFileSync('src/components/Admin/tabs/ChallengesTab.jsx', content);
