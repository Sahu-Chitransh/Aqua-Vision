export const SNAPSHOT = '20 Oct 2026';
export const sites = [
  { id: 'AV-001', name: 'Bairagarh intake', area: 'Bairagarh', type: 'Surface water', status: 'Online', x: 19, y: 24, ph: 7.2, turbidity: 1.4, temperature: 24.1 },
  { id: 'AV-002', name: 'Koh-e-Fiza reservoir', area: 'Koh-e-Fiza', type: 'Reservoir', status: 'Online', x: 43, y: 26, ph: 7.4, turbidity: 1.8, temperature: 24.5 },
  { id: 'AV-003', name: 'Upper Lake inlet', area: 'Upper Lake', type: 'Surface water', status: 'Attention', x: 36, y: 52, ph: 7.3, turbidity: 6.2, temperature: 25.2 },
  { id: 'AV-004', name: 'Shahpura collection point', area: 'Shahpura', type: 'Groundwater', status: 'Online', x: 71, y: 77, ph: 7.1, turbidity: 1.2, temperature: 23.8 },
  { id: 'AV-005', name: 'Arera Colony tank', area: 'Arera Colony', type: 'Supply tank', status: 'Attention', x: 83, y: 54, ph: 8.8, turbidity: 2.1, temperature: 24.8 },
  { id: 'AV-006', name: 'Van Vihar station', area: 'Van Vihar', type: 'Surface water', status: 'Online', x: 29, y: 80, ph: 7.2, turbidity: 1.5, temperature: 24.2 },
  { id: 'AV-007', name: 'Lake View supply', area: 'Lake View', type: 'Distribution', status: 'Online', x: 59, y: 52, ph: 7.5, turbidity: 1.7, temperature: 24.6 },
  { id: 'AV-008', name: 'TT Nagar node', area: 'TT Nagar', type: 'Distribution', status: 'Offline', x: 74, y: 25, ph: null, turbidity: null, temperature: null },
];

export const collectors = ['Field team A', 'Field team B', 'Field team C'];
export const sampleTypes = ['Microplastic screening', 'PFAS laboratory assay', 'Routine water check'];
export const stages = ['Collected', 'In transit', 'At laboratory', 'Report available'];
export const initialSamples = [
  { id: 'AQ-2026-084', siteId: 'AV-003', type: sampleTypes[0], volume: 500, collector: collectors[0], stage: 'Collected', collectedAt: '2026-10-20T04:42:00Z' },
  { id: 'AQ-2026-083', siteId: 'AV-005', type: sampleTypes[1], volume: 1000, collector: collectors[1], stage: 'In transit', collectedAt: '2026-10-20T03:50:00Z' },
  { id: 'AQ-2026-082', siteId: 'AV-002', type: sampleTypes[0], volume: 500, collector: collectors[0], stage: 'At laboratory', collectedAt: '2026-10-19T09:10:00Z' },
  { id: 'AQ-2026-081', siteId: 'AV-007', type: sampleTypes[1], volume: 1000, collector: collectors[2], stage: 'Report available', collectedAt: '2026-10-18T04:00:00Z', report: { method: 'Illustrative targeted PFAS analysis', result: 'PFOA: 3.1 ng/L · PFOS: 2.4 ng/L', note: 'Illustrative laboratory values only. No regulatory or water-safety assessment is made.', date: '20 Oct 2026' } },
  { id: 'AQ-2026-080', siteId: 'AV-004', type: sampleTypes[2], volume: 250, collector: collectors[1], stage: 'Report available', collectedAt: '2026-10-17T06:15:00Z', report: { method: 'Illustrative routine water analysis', result: 'pH: 7.1 · Turbidity: 1.2 NTU', note: 'Routine parameters do not establish the absence of emerging contaminants.', date: '19 Oct 2026' } },
  { id: 'AQ-2026-079', siteId: 'AV-001', type: sampleTypes[0], volume: 500, collector: collectors[2], stage: 'Report available', collectedAt: '2026-10-17T03:30:00Z', report: { method: 'Illustrative microscopy screening', result: '12 suspected particles / 500 mL', note: 'Preliminary visual screening. Polymer identity has not been confirmed.', date: '18 Oct 2026' } },
  { id: 'AQ-2026-078', siteId: 'AV-006', type: sampleTypes[0], volume: 500, collector: collectors[0], stage: 'At laboratory', collectedAt: '2026-10-16T08:20:00Z' },
  { id: 'AQ-2026-077', siteId: 'AV-003', type: sampleTypes[1], volume: 1000, collector: collectors[1], stage: 'At laboratory', collectedAt: '2026-10-16T05:20:00Z' },
];

export const alerts = [
  { id: 'A1', siteId: 'AV-003', title: 'Turbidity needs attention', detail: '6.2 NTU · above the configured trigger of 5 NTU', time: '10:12', severity: 'warning', kind: 'Sampling recommended' },
  { id: 'A2', siteId: 'AV-005', title: 'pH change detected', detail: 'pH 8.8 · above the configured trigger of 8.5', time: '09:45', severity: 'warning', kind: 'Review reading' },
  { id: 'A3', siteId: 'AV-008', title: 'Node connection lost', detail: 'No reading in the bundled snapshot', time: '09:18', severity: 'offline', kind: 'Check connection' },
];

export const findSite = id => sites.find(site => site.id === id);
export const formatDate = value => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(value));
export const formatTime = value => new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date(value));

const STORAGE_KEY = 'aqua-vision-workspace-v1';
export function validSample(sample) {
  return sample && typeof sample.id === 'string' && /^AQ-[a-zA-Z0-9-]{4,48}$/.test(sample.id)
    && sites.some(site => site.id === sample.siteId)
    && sampleTypes.includes(sample.type) && collectors.includes(sample.collector)
    && sample.stage === 'Collected'
    && Number.isInteger(sample.volume) && sample.volume >= 50 && sample.volume <= 5000
    && typeof sample.collectedAt === 'string' && Number.isFinite(Date.parse(sample.collectedAt));
}
export function loadWorkspace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { added: [], acknowledged: [], storageIssue: false };
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.added) || !saved.added.every(validSample)
      || new Set(saved.added.map(s => s.id)).size !== saved.added.length
      || saved.added.some(s => initialSamples.some(f => f.id === s.id))
      || !Array.isArray(saved.acknowledged) || !saved.acknowledged.every(id => alerts.some(a => a.id === id))) throw new Error('Invalid saved data');
    return { added: saved.added.map(({ id, siteId, type, volume, collector, stage, collectedAt }) => ({ id, siteId, type, volume, collector, stage, collectedAt })), acknowledged: saved.acknowledged, storageIssue: false };
  } catch { return { added: [], acknowledged: [], storageIssue: true }; }
}
export function saveWorkspace(added, acknowledged) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ added, acknowledged })); return true; }
  catch { return false; }
}
export function csvCell(value) {
  const text = String(value ?? '');
  const safe = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function buildCsv(samples) {
  const rows = [
    ['AQUA-VISION — BUNDLED REPORT VALUES ARE ILLUSTRATIVE — NOT FOR WATER SAFETY DECISIONS'],
    ['Sample ID', 'Site', 'Test', 'Volume (mL)', 'Collected at', 'Stage', 'Report result'],
    ...samples.map(sample => [sample.id, findSite(sample.siteId).name, sample.type, sample.volume, sample.collectedAt, sample.stage, sample.report?.result || 'No laboratory report available']),
  ];
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}
export function exportCsv(samples, name = 'samples') {
  const url = URL.createObjectURL(new Blob(['\uFEFF', buildCsv(samples)], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url; link.download = `aqua-vision-${name}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
