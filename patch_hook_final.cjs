const fs = require('fs');
let content = fs.readFileSync('src/components/Admin/hooks/useAdminDashboard.js', 'utf8');

// Add tempAssetSet
content = content.replace(
  `  const [tempAssetName, setTempAssetName] = useState('');
  const [tempAssetUrl, setTempAssetUrl] = useState('');`,
  `  const [tempAssetName, setTempAssetName] = useState('');
  const [tempAssetUrl, setTempAssetUrl] = useState('');
  const [tempAssetSet, setTempAssetSet] = useState('');`
);

// Add editTeamAssetSet
content = content.replace(
  `  const [editAssetSet, setEditAssetSet] = useState('');`,
  `  const [editAssetSet, setEditAssetSet] = useState('');
  const [editTeamAssetSet, setEditTeamAssetSet] = useState('');`
);

// Fix handleOpenEditTeam
content = content.replace(
  `    setEditTeamStatus(team.status);
    setShowEditTeamModal(true);`,
  `    setEditTeamStatus(team.status);
    setEditTeamAssetSet(team.assigned_asset_set || '');
    setShowEditTeamModal(true);`
);

// Fix handleSaveTeamEdit
content = content.replace(
  `    const statusChanged = editTeamStatus !== activeTeam.status;
    const pointsChanged = newPoints !== (activeTeam.points || 0);

    try {
      if (nameChanged || statusChanged) {
        await updateTeam(teamKey, {
          ...(nameChanged ? { name: editTeamName.trim() } : {}),
          ...(statusChanged ? { is_disqualified: editTeamStatus === 'disqualified' } : {}),
        });
      }
      if (pointsChanged) {
        await adjustScore(teamKey, { exact: newPoints });
      }

      setTeams(teams.map((t) => (t.id === activeTeam.id ? {
        ...t,
        name: nameChanged ? editTeamName.trim() : t.name,
        status: statusChanged ? editTeamStatus : t.status,
        points: pointsChanged ? newPoints : t.points,
      } : t)));`,
  `    const statusChanged = editTeamStatus !== activeTeam.status;
    const pointsChanged = newPoints !== (activeTeam.points || 0);

    let parsedAssetSet = null;
    if (editTeamAssetSet && editTeamAssetSet !== 'null') {
      parsedAssetSet = parseInt(editTeamAssetSet, 10);
    }
    const assetSetChanged = parsedAssetSet !== (activeTeam.assigned_asset_set || null);

    try {
      if (nameChanged || statusChanged || assetSetChanged) {
        const payload = {};
        if (nameChanged) payload.name = editTeamName.trim();
        if (statusChanged) payload.is_disqualified = editTeamStatus === 'disqualified';
        if (assetSetChanged) payload.assigned_asset_set = parsedAssetSet;
        await updateTeam(teamKey, payload);
      }
      if (pointsChanged) {
        await adjustScore(teamKey, { exact: newPoints });
      }

      setTeams(teams.map((t) => (t.id === activeTeam.id ? {
        ...t,
        name: nameChanged ? editTeamName.trim() : t.name,
        status: statusChanged ? editTeamStatus : t.status,
        points: pointsChanged ? newPoints : t.points,
        assigned_asset_set: assetSetChanged ? parsedAssetSet : t.assigned_asset_set,
      } : t)));`
);

// Expose tempAssetSet
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

fs.writeFileSync('src/components/Admin/hooks/useAdminDashboard.js', content);
