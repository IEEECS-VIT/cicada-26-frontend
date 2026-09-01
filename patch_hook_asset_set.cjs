const fs = require('fs');
let content = fs.readFileSync('src/components/Admin/hooks/useAdminDashboard.js', 'utf8');

// 1. Add state
content = content.replace(
  `  const [tempAssetName, setTempAssetName] = useState('');
  const [tempAssetUrl, setTempAssetUrl] = useState('');`,
  `  const [tempAssetName, setTempAssetName] = useState('');
  const [tempAssetUrl, setTempAssetUrl] = useState('');
  const [tempAssetSet, setTempAssetSet] = useState('');`
);

// 2. Add to handleAddAssetToChallenge
content = content.replace(
  `  const handleAddAssetToChallenge = () => {
    if (!tempAssetName.trim()) return;
    const newAsset = {
      name: tempAssetName.trim(),
      url: tempAssetUrl.trim() || '#'
    };
    setNewChallengeAssets([...newChallengeAssets, newAsset]);
    setTempAssetName('');
    setTempAssetUrl('');
  };`,
  `  const handleAddAssetToChallenge = () => {
    if (!tempAssetName.trim()) return;
    const newAsset = {
      name: tempAssetName.trim(),
      url: tempAssetUrl.trim() || '#',
      asset_set: tempAssetSet ? parseInt(tempAssetSet, 10) : null
    };
    setNewChallengeAssets([...newChallengeAssets, newAsset]);
    setTempAssetName('');
    setTempAssetUrl('');
    setTempAssetSet('');
  };`
);

// 3. Add to resets
content = content.replace(/setTempAssetUrl\(''\);/g, "setTempAssetUrl('');\n    setTempAssetSet('');");

// 4. Expose the state
content = content.replace(
  `    tempAssetUrl,
    setTempAssetUrl,`,
  `    tempAssetUrl,
    setTempAssetUrl,
    tempAssetSet,
    setTempAssetSet,`
);

fs.writeFileSync('src/components/Admin/hooks/useAdminDashboard.js', content);
