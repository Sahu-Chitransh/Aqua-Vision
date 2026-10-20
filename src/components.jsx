import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, CheckCheck, ChevronRight, CircleHelp, Droplets, FlaskConical, LocateFixed, MapPin, Minus, Plus, Radio, SearchX, ShieldCheck, Waves, WifiOff, X } from 'lucide-react';
import { collectors, findSite, formatDate, formatTime, sampleTypes, sites, stages } from './data.js';

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge ${tone}`}><span className="badge-dot" />{children}</span>;
}
export function EmptyState({ title = 'No matching records', text = 'Try another location or clear your filters.' }) {
  return <div className="empty-state"><SearchX size={28} /><strong>{title}</strong><p>{text}</p></div>;
}
export function SectionHeading({ eyebrow, title, action, children }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{children}</div>{action}</div>;
}
export function Modal({ title, subtitle, onClose, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const opener = document.activeElement;
    ref.current.showModal();
    return () => { if (opener instanceof HTMLElement) opener.focus(); };
  }, []);
  return <dialog ref={ref} className={`modal ${wide ? 'wide' : ''}`} aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === ref.current) { const r = ref.current.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose(); } }}>
    <div className="modal-head"><div><span className="eyebrow">AQUA-VISION WORKSPACE</span><h2 id="dialog-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button></div>
    {children}
  </dialog>;
}

export function SampleForm({ siteId, onSave, onClose }) {
  const [form, setForm] = useState({ siteId: siteId === 'all' ? '' : siteId, type: '', volume: '500', collector: '' });
  const [errors, setErrors] = useState({});
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const submit = event => {
    event.preventDefault();
    const next = {};
    if (!form.siteId) next.siteId = 'Choose a collection site.';
    if (!form.type) next.type = 'Choose the intended test.';
    if (!Number.isInteger(Number(form.volume)) || Number(form.volume) < 50 || Number(form.volume) > 5000) next.volume = 'Enter a whole number from 50 to 5000 mL.';
    if (!form.collector) next.collector = 'Choose a field team.';
    setErrors(next);
    if (Object.keys(next).length) { document.getElementById(`field-${Object.keys(next)[0]}`).focus(); return; }
    onSave({ ...form, volume: Number(form.volume) });
  };
  const field = (name, title, content, hint) => <div className="form-field"><label htmlFor={`field-${name}`}>{title}</label>{content}{hint && <small>{hint}</small>}{errors[name] && <span id={`error-${name}`} className="field-error">{errors[name]}</span>}</div>;
  const attrs = name => ({ id: `field-${name}`, value: form[name], onChange: e => set(name, e.target.value), 'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `error-${name}` : undefined });
  return <Modal title="Register a new sample" subtitle="Start a traceable journey from collection to confirmation." onClose={onClose}>
    <div className="modal-notice"><FlaskConical size={17} /><span>Collection record · saved in this browser</span></div>
    <form onSubmit={submit} noValidate>
      {field('siteId', 'Collection site', <select {...attrs('siteId')}><option value="">Select a monitoring site</option>{sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}</select>)}
      {field('type', 'Intended test', <select {...attrs('type')}><option value="">Select a test type</option>{sampleTypes.map(type => <option key={type}>{type}</option>)}</select>)}
      <div className="form-columns">
        {field('volume', 'Volume (mL)', <input {...attrs('volume')} type="number" min="50" max="5000" step="1" />, 'Whole numbers, 50–5000 mL')}
        {field('collector', 'Collected by', <select {...attrs('collector')}><option value="">Select a field team</option>{collectors.map(name => <option key={name}>{name}</option>)}</select>, 'Workspace field teams')}
      </div>
      <p className="muted form-explanation">The sample will start at <strong>Collected</strong>. Registration does not run an analysis or produce a laboratory result.</p>
      <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button type="submit" className="button primary"><Plus size={17} />Register sample</button></div>
    </form>
  </Modal>;
}

export function SampleDetails({ sample, onClose, onExport }) {
  const site = findSite(sample.siteId);
  const stageIndex = stages.indexOf(sample.stage);
  return <Modal title={sample.id} subtitle={site.name} onClose={onClose} wide>
    <div className="detail-top"><Badge tone={sample.report ? 'success' : 'blue'}>{sample.stage}</Badge><span className="source-tag">Local dataset</span></div>
    <dl className="detail-grid"><div><dt>Intended test</dt><dd>{sample.type}</dd></div><div><dt>Sample volume</dt><dd>{sample.volume} mL</dd></div><div><dt>Collected by</dt><dd>{sample.collector}</dd></div><div><dt>Collected (IST)</dt><dd>{formatDate(sample.collectedAt)} · {formatTime(sample.collectedAt)}</dd></div></dl>
    <h3 className="detail-heading">Sample journey</h3>
    <ol className="timeline">{stages.map((stage, index) => <li key={stage} className={index <= stageIndex ? 'complete' : ''}><span className="timeline-icon">{index <= stageIndex ? <Check size={15} /> : index + 1}</span><div><strong>{stage}</strong><small>{index === 0 ? `${formatDate(sample.collectedAt)} · ${formatTime(sample.collectedAt)} IST` : index <= stageIndex ? 'Illustrative event in bundled record' : 'Not recorded'}</small></div></li>)}</ol>
    {sample.report ? <div className="report-result"><div className="report-label"><FlaskConical size={19} /><strong>Illustrative report</strong></div><p className="result-value">{sample.report.result}</p><p>{sample.report.method} · {sample.report.date}</p><small>{sample.report.note}</small></div> : <div className="modal-notice"><CircleHelp size={19} /><span>No laboratory report available. Routine readings and visual screening do not confirm PFAS or polymer identity.</span></div>}
    <div className="modal-actions"><button className="button secondary" onClick={onClose}>Close</button><button className="button primary" onClick={() => onExport([sample], sample.id)}>Export record<ArrowUpRight size={16} /></button></div>
  </Modal>;
}

function MapArtwork() {
  return <svg viewBox="0 0 900 440" preserveAspectRatio="none" className="map-art" aria-hidden="true">
    <defs><pattern id="blocks" width="74" height="62" patternTransform="rotate(-18)" patternUnits="userSpaceOnUse"><rect width="74" height="62" fill="#eef0e8" /><rect x="5" y="5" width="60" height="48" rx="4" fill="#e4e7de" /><path d="M5 29H65M34 5V53" stroke="#eceee7" strokeWidth="3" /></pattern><pattern id="trees" width="17" height="17" patternUnits="userSpaceOnUse"><circle cx="4" cy="5" r="2" fill="#c1d2be" /></pattern></defs>
    <rect width="900" height="440" fill="url(#blocks)" />
    <path d="M0 70Q140 115 160 180T260 350L180 440H0Z" fill="#d3dfcb" />
    <path d="M0 70Q140 115 160 180T260 350L180 440H0Z" fill="url(#trees)" />
    <path d="M10 212C90 167 145 160 220 176S330 147 403 180S465 211 502 242S519 290 477 308S423 296 381 320S326 355 276 321S222 296 171 311S78 281 0 311Z" fill="#a8d6d4" />
    <path d="M10 224C90 179 145 172 220 188S330 159 403 192S465 223 492 250" fill="none" stroke="#c8e5df" strokeWidth="3" />
    <path d="M420 440Q448 376 530 357T610 321T672 298Q720 298 728 338T780 384L900 419V440Z" fill="#c0ddda" />
    <path d="M0 113Q155 147 233 111T462 117T711 111L900 61M210 0Q280 113 324 141T521 199T629 265T692 440M900 207L745 220L676 290L590 342L508 440M28 440L288 362L411 345" fill="none" stroke="#d7dace" strokeWidth="14" />
    <path d="M0 113Q155 147 233 111T462 117T711 111L900 61M210 0Q280 113 324 141T521 199T629 265T692 440M900 207L745 220L676 290L590 342L508 440M28 440L288 362L411 345" fill="none" stroke="#fffef9" strokeWidth="9" />
    <path d="M500 0L525 90L589 137L684 167L900 162M335 440L418 376L507 340M765 0L727 110L770 200L840 263L900 273M0 374L138 347L244 357" fill="none" stroke="#fafbf7" strokeWidth="6" />
    <path d="M760 440L787 349L851 303L900 313" fill="none" stroke="#e0cd9f" strokeWidth="8" />
    <path d="M760 440L787 349L851 303L900 313" fill="none" stroke="#fff2ca" strokeWidth="5" />
    <path d="M345 0L380 82L451 128L574 144L673 196L738 277L850 350L900 371" fill="none" stroke="#c6cabc" strokeWidth="2" strokeDasharray="4 5" />
    <g fill="#859182" fontFamily="DM Sans, sans-serif" fontSize="12" letterSpacing="2"><text x="100" y="54">BAIRAGARH</text><text x="370" y="61">KOH-E-FIZA</text><text x="715" y="49">TT NAGAR</text><text x="712" y="186">ARERA COLONY</text><text x="682" y="411">SHAHPURA</text><text x="118" y="400">VAN VIHAR</text></g>
    <text x="215" y="252" fill="#579a9a" fontFamily="Manrope, sans-serif" fontSize="17" fontStyle="italic" letterSpacing="3">Upper Lake</text>
    <text x="565" y="287" fill="#859182" fontFamily="DM Sans, sans-serif" fontSize="10" letterSpacing="2">LAKE VIEW</text>
  </svg>;
}
export function NetworkMap({ visibleSites, selected, onSelect, large = false }) {
  const [zoom, setZoom] = useState(1);
  const selectedSite = visibleSites.find(site => site.id === selected);
  return <div className={`network-map ${large ? 'large' : ''}`}>
    <div className="map-transform" style={{ transform: `scale(${zoom})` }}><MapArtwork />{visibleSites.map(site => <button key={site.id} className={`map-node ${site.status.toLowerCase()} ${selected === site.id ? 'selected' : ''}`} style={{ left: `${site.x}%`, top: `${site.y}%` }} onClick={() => onSelect(site.id)} aria-label={`${site.name}, ${site.status}`} aria-pressed={selected === site.id}><span><Droplets size={15} /></span></button>)}</div>
    <div className="map-caption"><span className="map-live-dot" />BHOPAL PILOT <span className="map-caption-divider">/</span> {visibleSites.length} SITES</div>
    <div className="map-controls"><button aria-label="Zoom in" disabled={zoom >= 1.6} onClick={() => setZoom(z => Math.min(1.6, z + .2))}><Plus size={16} /></button><button aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - .2))}><Minus size={16} /></button><button aria-label="Reset map view" onClick={() => setZoom(1)}><LocateFixed size={16} /></button></div>
    {selectedSite && <div className="map-site-card"><div className="map-site-icon"><Radio size={18} /></div><div><strong>{selectedSite.name}</strong><span>{selectedSite.id} · {selectedSite.status === 'Offline' ? 'No current reading' : `pH ${selectedSite.ph} · ${selectedSite.turbidity} NTU`}</span></div><button className="icon-button" onClick={() => onSelect(null)} aria-label="Dismiss site preview"><X size={14} /></button></div>}
    <span className="map-disclaimer">Schematic map · bundled readings</span>
  </div>;
}

export function TrendChart({ siteId }) {
  const [parameter, setParameter] = useState('pH');
  const [period, setPeriod] = useState('24 hours');
  const site = findSite(siteId);
  const noData = site?.status === 'Offline';
  const base = parameter === 'pH' ? site?.ph ?? 7.5 : site?.turbidity ?? 2.3;
  const values = Array.from({ length: 13 }, (_, i) => +(base + (parameter === 'pH' ? .2 : .4) * Math.sin(i * 1.7 + (period === '7 days' ? 2 : 0))).toFixed(1));
  const min = parameter === 'pH' ? 6 : 0, max = parameter === 'pH' ? 10 : 8;
  const points = values.map((v, i) => [42 + i * 27, 137 - (v - min) / (max - min) * 106]);
  const line = points.map(p => p.join(',')).join(' ');
  return <section className="panel trend-panel"><SectionHeading title="Water quality trends" action={<select className="compact-select" aria-label="Trend period" value={period} onChange={e => setPeriod(e.target.value)}><option>24 hours</option><option>7 days</option></select>} />
    <div className="trend-tools"><div className="segmented">{['pH', 'Turbidity'].map(p => <button key={p} aria-pressed={parameter === p} className={parameter === p ? 'active' : ''} onClick={() => setParameter(p)}>{p}</button>)}</div><span>{site ? site.area : 'Network average'}</span></div>
    {noData ? <EmptyState title="No readings available" text="This node is offline. Select another location." /> : <>
      <div className="trend-current"><strong>{base.toFixed(1)}</strong><span>{parameter === 'pH' ? 'pH units' : 'NTU'}<small>Bundled reading</small></span><span className="trend-source"><Waves size={15} />Routine parameter</span></div>
      <svg viewBox="0 0 390 170" className="trend-chart" role="img" aria-label={`${parameter}, ${period}, ${site ? site.name : 'network average'}. Generated values: ${values.join(', ')}`}>
        <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2ca78d" stopOpacity=".18" /><stop offset="100%" stopColor="#2ca78d" stopOpacity="0" /></linearGradient></defs>
        {[0, 1, 2, 3].map(i => <g key={i}><line x1="38" x2="375" y1={31 + i * 35} y2={31 + i * 35} stroke="#e8eeec" strokeDasharray="3 4" /><text x="7" y={35 + i * 35} fill="#60736b" fontSize="10">{(max - i * (max - min) / 3).toFixed(1)}</text></g>)}
        <polygon points={`42,140 ${line} 366,140`} fill="url(#chart-fill)" /><polyline points={line} fill="none" stroke="#259d84" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={points[12][0]} cy={points[12][1]} r="4" fill="#259d84" stroke="white" strokeWidth="2" />
        {(period === '24 hours' ? ['00:00', '06:00', '12:00', '18:00', '23:59'] : ['14 Oct', '16 Oct', '18 Oct', '19 Oct', '20 Oct']).map((v, i) => <text key={v} x={42 + i * 81} y="162" textAnchor="middle" fill="#60736b" fontSize="10">{v}</text>)}
      </svg>
      <p className="chart-footnote">Generated trend · 20 Oct 2026 · not live telemetry</p>
    </>}
  </section>;
}

export function SampleTable({ samples, onOpen, compact = false }) {
  if (!samples.length) return <EmptyState title="No samples match this search" text="Clear your search or choose another monitoring location." />;
  return <div className="table-scroll"><table className={compact ? 'compact-table' : ''}><thead><tr><th>Sample / location</th><th>Test type</th>{!compact && <th>Collected</th>}<th>Status</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>{samples.map(sample => <tr key={sample.id}><td><button className="sample-link" onClick={() => onOpen(sample)}>{sample.id}</button><span className="table-sub">{findSite(sample.siteId).name}</span></td><td><span className="test-label">{sample.type === 'Microplastic screening' ? 'Microplastics' : sample.type === 'PFAS laboratory assay' ? 'PFAS assay' : 'Routine check'}</span><span className="table-sub">{sample.volume} mL</span></td>{!compact && <td>{formatDate(sample.collectedAt)}<span className="table-sub">{sample.collector}</span></td>}<td><Badge tone={sample.stage === 'Report available' ? 'success' : sample.stage === 'At laboratory' ? 'violet' : sample.stage === 'In transit' ? 'amber' : 'blue'}>{sample.stage}</Badge></td><td><button className="icon-button" onClick={() => onOpen(sample)} aria-label={`Open ${sample.id}`}><ChevronRight size={17} /></button></td></tr>)}</tbody></table></div>;
}

export function AlertList({ items, acknowledged, onAcknowledge, onSite, compact = false }) {
  if (!items.length) return <EmptyState title="No alerts for this location" text="There are no recorded alerts in this snapshot." />;
  return <div className={`alert-list ${compact ? 'compact' : ''}`}>{items.map(alert => {
    const ack = acknowledged.includes(alert.id);
    return <article key={alert.id} className="alert-item"><span className={`alert-icon ${alert.severity}`}>{alert.severity === 'offline' ? <WifiOff size={18} /> : <Waves size={18} />}</span><div className="alert-body"><div className="alert-title-row"><h3>{alert.title}</h3><time>{alert.time}</time></div><button className="text-link site-link" onClick={() => onSite(alert.siteId)}>{findSite(alert.siteId).name}<ArrowUpRight size={11} /></button>{!compact && <p>{alert.detail}</p>}<div className="alert-bottom"><span>{ack ? 'Anomaly still requires review' : alert.kind}</span><button className={`ack-button ${ack ? 'acknowledged' : ''}`} disabled={ack} onClick={() => onAcknowledge(alert.id)} aria-label={`${ack ? 'Acknowledged' : 'Acknowledge'}: ${alert.title}`}>{ack ? <><CheckCheck size={13} />Acknowledged</> : 'Acknowledge'}</button></div></div></article>;
  })}</div>;
}

export function Guide() {
  const steps = [
    [Droplets, '01', 'Connect & collect', 'Choose the source and register a sample with its collection site, volume and field team. The sample ID keeps each record connected.'],
    [Waves, '02', 'Screen with context', 'Routine sensors reveal parameter changes. Microscopy can flag suspected particles, but does not establish polymer identity.'],
    [MapPin, '03', 'Keep the trail intact', 'Follow the sample from collection through transport and laboratory receipt. Missing steps stay visible as “Not recorded.”'],
    [ShieldCheck, '04', 'Confirm the result', 'PFAS-specific assays and suitable laboratory methods provide evidence that ordinary water sensors cannot. Review the method with the result.'],
  ];
  return <div className="guide-content"><div className="guide-hero"><div><span className="eyebrow">FROM A DROP TO A DECISION</span><h2>Good evidence starts<br />in the field.</h2><p>A simple guide to the AQUA-VISION sampling journey.</p></div><div className="guide-emblem"><Droplets size={88} strokeWidth={1} /></div></div><div className="guide-grid">{steps.map(([Icon, number, title, copy]) => <article className="panel guide-step" key={number}><div className="guide-step-top"><Icon size={27} /><span>{number}</span></div><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="info-strip"><CircleHelp size={20} /><p>This frontend supports record keeping and screening workflows. It does not perform tests, certify water safety, or provide treatment advice.</p></div></div>;
}
