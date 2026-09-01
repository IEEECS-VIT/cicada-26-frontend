const fs = require('fs');
let hookContent = fs.readFileSync('src/components/Admin/hooks/useAdminDashboard.js', 'utf8');

// 1. Add asset_set state
hookContent = hookContent.replace(
  "const [editAssetUrl, setEditAssetUrl] = useState('');",
  "const [editAssetUrl, setEditAssetUrl] = useState('');\n  const [editAssetSet, setEditAssetSet] = useState('');"
);

// 2. Add team assigned_asset_set state
hookContent = hookContent.replace(
  "const [editTeamDisqualified, setEditTeamDisqualified] = useState(false);",
  "const [editTeamDisqualified, setEditTeamDisqualified] = useState(false);\n  const [editTeamAssetSet, setEditTeamAssetSet] = useState('');"
);

// 3. Update active asset selection (in ChallengesTab, but we can do it via the returned state or just let ChallengesTab handle it)
// Let's just expose editAssetSet.

// 4. Update team edit save
hookContent = hookContent.replace(
  "const updates = {};",
  "const updates = {};\n    if (editTeamAssetSet !== '') updates.assigned_asset_set = parseInt(editTeamAssetSet, 10);\n    if (editTeamAssetSet === 'null') updates.assigned_asset_set = null;"
);

// 5. Update active team selection
hookContent = hookContent.replace(
  "setEditTeamDisqualified(team.is_disqualified);",
  "setEditTeamDisqualified(team.is_disqualified);\n      setEditTeamAssetSet(team.assigned_asset_set || '');"
);

// 6. Update handleEditAssetSave
hookContent = hookContent.replace(
  "const updatedAsset = { ...activeAsset, name: editAssetName, url: editAssetUrl };",
  "const updatedAsset = { ...activeAsset, name: editAssetName, url: editAssetUrl, asset_set: editAssetSet ? parseInt(editAssetSet, 10) : null };"
);

// 7. Update return object
hookContent = hookContent.replace(
  "setEditAssetUrl,",
  "setEditAssetUrl,\n    editAssetSet,\n    setEditAssetSet,\n    editTeamAssetSet,\n    setEditTeamAssetSet,"
);

fs.writeFileSync('src/components/Admin/hooks/useAdminDashboard.js', hookContent);
