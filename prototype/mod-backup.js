/* ==========================================================================
   Backup and restore
   --------------------------------------------------------------------------
   One file holds everything: all records plus every uploaded file (documents,
   photos, evidence, logos). It carries a checksum so a damaged or edited file
   is refused, and a version so a backup from an incompatible version is not
   loaded. Restoring replaces everything in this browser.
   ========================================================================== */
'use strict';

const BACKUP_FORMAT = 'vdw-hseq-backup';

// Every stored-file id referenced anywhere in the data
function referencedBlobs(o, out = new Set()) {
  if (Array.isArray(o)) o.forEach(x => referencedBlobs(x, out));
  else if (o && typeof o === 'object') Object.keys(o).forEach(k => { if (k === 'blobId' && typeof o[k] === 'string') out.add(o[k]); else referencedBlobs(o[k], out); });
  return out;
}
function blobToDataUrl(b) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b); }); }
function backupChecksum(data, files) { return sha256(JSON.stringify(data) + '|' + Object.keys(files).sort().map(k => k + ':' + files[k].length).join(',')); }
function backupCounts(d) { return { People: (d.people || []).length, Documents: (d.documents || []).length, Assets: (d.assets || []).length, Inspections: (d.inspections || []).length, Incidents: (d.incidents || []).length, 'Corrective actions': (d.actions || []).length }; }

async function buildBackup() {
  const files = {};
  for (const id of referencedBlobs(S)) {
    try { if (FILE_PENDING[id]) await FILE_PENDING[id]; const b = await idbGet(id); if (b) files[id] = await blobToDataUrl(b); } catch (e) { console.warn('File not included in backup', id, e); }
  }
  const data = JSON.parse(JSON.stringify(S)); delete data._tamperDemo;
  return { format: BACKUP_FORMAT, formatVersion: 1, dataVersion: S.version, createdOn: nowTs(), createdBy: pname(S.ui.user), orgs: S.orgs.map(o => o.short), counts: backupCounts(data), data, files, checksum: backupChecksum(data, files) };
}
ACT.backupDownload = async () => {
  toast('Preparing backup…', 'info');
  const bk = await buildBackup();
  if (!(await saveFile(`vdw-hseq-backup-${TODAY}.json`, new Blob([JSON.stringify(bk)], { type: 'application/json' })))) return;
  S.lastBackup = { ts: bk.createdOn, by: S.ui.user, files: Object.keys(bk.files).length }; log(`Downloaded a full backup (${Object.keys(bk.files).length} file(s))`, '#/admin/data'); save();
  toast(`Backup downloaded with ${Object.keys(bk.files).length} stored file(s).`); rerender();
};

/* Check a backup file; returns { ok, error, bk } */
function checkBackup(text) {
  let bk; try { bk = JSON.parse(text); } catch (e) { return { error: 'This is not a backup file (it could not be read).' }; }
  if (!bk || bk.format !== BACKUP_FORMAT || !bk.data || !bk.files) return { error: 'This is not a VDW HSEQ backup file.' };
  if (bk.dataVersion !== S.version) return { error: `This backup was made with a different version of the system (data version ${bk.dataVersion}; this system uses ${S.version}). It cannot be restored here.` };
  if (backupChecksum(bk.data, bk.files) !== bk.checksum) return { error: 'This backup file has been changed or damaged since it was made, so it cannot be trusted. Nothing was restored.' };
  if (!Array.isArray(bk.data.people) || !Array.isArray(bk.data.orgs)) return { error: 'This backup is incomplete.' };
  return { ok: true, bk };
}
ACT.backupRestore = () => {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      const r = checkBackup(rd.result);
      if (!r.ok) { openModal({ title: 'Backup not restored', size: 'narrow', body: `<div class="alert danger">${icon('alert')}<div>${esc(r.error)}</div></div>`, buttons: [] }); return; }
      const bk = r.bk;
      openModal({ title: 'Restore backup', sub: f.name, body: `<div class="alert warn">${icon('alert')}<div><b>Everything in this browser will be replaced</b> by the contents of this backup. Download a backup of the current data first if you may need it.</div></div>
        <div class="kv"><div>Made on</div><div>${fmtTs(bk.createdOn)}</div><div>Made by</div><div>${esc(bk.createdBy)}</div><div>Organisations</div><div>${esc(bk.orgs.join(', '))}</div>${Object.entries(bk.counts).map(([k, n]) => `<div>${esc(k)}</div><div>${n}</div>`).join('')}<div>Stored files</div><div>${Object.keys(bk.files).length}</div><div>Checksum</div><div class="mono t-sub">${esc(bk.checksum.slice(0, 16))}… verified</div></div>`,
        buttons: [{ label: 'Replace everything with this backup', cls: 'danger solid', onClick: () => { applyBackup(bk); } }] });
    };
    rd.readAsText(f);
  };
  inp.click();
};
async function applyBackup(bk) {
  const keepUser = S.ui.user;
  await idbClear();
  for (const [id, url] of Object.entries(bk.files)) { try { const b = await (await fetch(url)).blob(); await idbPut(id, b); } catch (e) { console.warn('Could not restore file', id, e); } }
  S = bk.data;
  S.ui = S.ui || {}; S.ui.user = S.people.some(p => p.id === keepUser && p.status !== 'Deactivated') ? keepUser : null;   // stay signed in if you exist in the backup
  if (!S.orgs.some(o => o.id === S.ui.org)) { S.ui.org = S.orgs[0].id; S.ui.site = 'ALL'; }
  log(`Restored the backup made on ${fmtTs(bk.createdOn)} by ${bk.createdBy}`, '#/admin/data'); save();
  toast('Backup restored.'); navigate('#/admin/data'); rerender();
}
function backupAdminHtml(ro) {
  const lb = S.lastBackup, files = referencedBlobs(S).size;
  return `<div class="card mb"><div class="card-head"><h2>Backup and restore</h2></div><div class="card-body">
    <p style="margin-top:0">A backup is one file with <b>all records and every uploaded file</b> (documents, photos, evidence, logos): ${Object.entries(backupCounts(S)).map(([k, n]) => `${n} ${k.toLowerCase()}`).join(', ')}, ${files} stored file(s).</p>
    <div class="kv mb"><div>Last backup</div><div>${lb ? `${fmtTs(lb.ts)} by ${esc(pname(lb.by))} (${lb.files} file(s))` : '<span class="due amber">No backup made yet</span>'}</div></div>
    <div class="btn-row"><button class="btn primary" data-act="backupDownload">${icon('download', 'sm')} Download full backup</button>${ro ? '' : `<button class="btn" data-act="backupRestore">${icon('upload', 'sm')} Restore from backup…</button>`}</div>
    <p class="muted mt-s">Use it to keep a copy, or to move the prototype and its data to another computer. A backup is checked before it is restored: a damaged or edited file, or one from an incompatible version, is refused. Prototype: the live system backs up automatically on the server.</p>
  </div></div>`;
}
