import React, { useEffect, useRef, useState } from 'react';
import { Activity, ArrowDownToLine, ArrowRight, ArrowUpRight, Bell, BookOpen, CalendarDays, Check, ChevronRight, CircleHelp, ClipboardList, Droplets, FileCheck2, FlaskConical, LayoutDashboard, MapPin, Menu, Plus, Radio, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Waves, X } from 'lucide-react';
import { alerts, exportCsv, findSite, initialSamples, loadWorkspace, saveWorkspace, sites, SNAPSHOT } from './data.js';
import { AlertList, Badge, EmptyState, Guide, Modal, NetworkMap, SampleDetails, SampleForm, SampleTable, SectionHeading, TrendChart } from './components.jsx';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'monitoring', label: 'Monitoring sites', icon: Radio },
  { id: 'samples', label: 'Samples & tests', icon: FlaskConical },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'reports', label: 'Reports', icon: FileCheck2 },
];
const pageCopy = {
  overview: ['Water intelligence, at a glance.', 'A connected view of your water sources. Every sample, every signal.'],
  monitoring: ['Know your network.', 'Explore monitoring locations and the readings behind each signal.'],
  samples: ['Every sample tells a story.', 'Follow the journey from collection to laboratory confirmation.'],
  alerts: ['Give every signal attention.', 'Review changes in routine readings and monitor node connectivity.'],
  reports: ['Evidence you can trace.', 'Explore report methods, results, and the samples behind them.'],
  guide: ['A little guidance. Better evidence.', 'Your companion to the AQUA-VISION field sampling workflow.'],
};
function initialView() { const hash = window.location.hash.slice(1); return pageCopy[hash] ? hash : 'overview'; }

export default function App() {
  const [stored] = useState(loadWorkspace);
  const [added, setAdded] = useState(stored.added);
  const [acknowledged, setAcknowledged] = useState(stored.acknowledged);
  const [storageIssue, setStorageIssue] = useState(stored.storageIssue);
  const [view, setView] = useState(initialView);
  const [location, setLocation] = useState('all');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [selectedSite, setSelectedSite] = useState('AV-003');
  const [dialog, setDialog] = useState(null);
  const [sample, setSample] = useState(null);
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const sidebarRef = useRef(null);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const listener = event => { setIsMobile(event.matches); if (!event.matches) setMobileNav(false); };
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);
  useEffect(() => { if (!saveWorkspace(added, acknowledged)) setStorageIssue(true); }, [added, acknowledged]);
  useEffect(() => { const listener = () => { setView(initialView()); setMobileNav(false); }; window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 5000); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    if (!mobileNav) return;
    const opener = document.activeElement;
    const controls = () => [...sidebarRef.current.querySelectorAll('a[href], button:not(:disabled)')].filter(element => element.getClientRects().length);
    sidebarRef.current.querySelector('.mobile-nav-close')?.focus();
    const listener = event => {
      if (event.key === 'Escape') setMobileNav(false);
      if (event.key === 'Tab') {
        const elements = controls(), first = elements[0], last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', listener);
    return () => { document.removeEventListener('keydown', listener); if (opener instanceof HTMLElement) opener.focus(); };
  }, [mobileNav]);
  const navigate = id => { setView(id); window.location.hash = id; setMobileNav(false); if (id !== 'samples') setStatus('All statuses'); };
  const visibleSites = sites.filter(site => location === 'all' || site.id === location);
  const allSamples = [...added, ...initialSamples];
  const locationSamples = allSamples.filter(s => location === 'all' || s.siteId === location);
  const filteredSamples = locationSamples.filter(s => `${s.id} ${findSite(s.siteId).name} ${s.type} ${s.collector}`.toLowerCase().includes(search.toLowerCase()) && (status === 'All statuses' || s.stage === status));
  const locationAlerts = alerts.filter(a => location === 'all' || a.siteId === location);
  const reports = locationSamples.filter(s => s.report);
  const connected = visibleSites.filter(s => s.status !== 'Offline').length;
  const pendingAlerts = locationAlerts.filter(a => !acknowledged.includes(a.id)).length;
  const pendingLab = locationSamples.filter(s => s.stage === 'At laboratory').length;
  const changeLocation = id => { setLocation(id); setSelectedSite(id === 'all' ? 'AV-003' : id); };
  const visitSite = id => { changeLocation(id); navigate('monitoring'); };
  const download = (items, name = 'samples') => { exportCsv(items, name); setToast(`${items.length} record${items.length === 1 ? '' : 's'} exported.`); };
  const openSample = record => { setSample(record); setDialog('detail'); };
  const register = fields => {
    let id;
    do { id = `AQ-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`; } while (allSamples.some(record => record.id === id));
    const next = { ...fields, id, stage: 'Collected', collectedAt: new Date().toISOString() };
    setAdded(current => [next, ...current]); setDialog(null); setSearch(''); setStatus('All statuses'); changeLocation(fields.siteId); navigate('samples'); setToast('Sample registered. Your collection record is ready.');
  };
  const acknowledge = id => { setAcknowledged(current => [...new Set([...current, id])]); setToast('Alert acknowledged. The underlying reading is unchanged.'); };
  const label = navigation.find(item => item.id === view)?.label || 'Field guide';

  return <div className="app-shell">
    <a href="#main-content" className="skip-link" onClick={e => { e.preventDefault(); document.getElementById('main-content').focus(); }}>Skip to content</a>
    {mobileNav && <button className="nav-backdrop" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <aside ref={sidebarRef} className={`sidebar ${mobileNav ? 'is-open' : ''}`} aria-label="Main navigation" inert={isMobile && !mobileNav ? true : undefined} role={mobileNav ? 'dialog' : undefined} aria-modal={mobileNav ? 'true' : undefined}>
      <button className="mobile-nav-close icon-button" onClick={() => setMobileNav(false)} aria-label="Close navigation menu"><X size={19} /></button>
      <a className="brand" href="#overview" onClick={() => navigate('overview')} aria-label="Aqua Vision overview"><span className="brand-mark"><Droplets size={26} strokeWidth={1.7} /></span><span>AQUA<span className="brand-light">VISION</span><small>CLARITY IN EVERY DROP</small></span></a>
      <div className="workspace-card"><span className="workspace-icon"><Waves size={19} /></span><div><strong>Bhopal water network</strong><small>Pilot workspace</small></div><span className="workspace-dot" /></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{navigation.map(({ id, label: text, icon: Icon }) => <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => navigate(id)} aria-current={view === id ? 'page' : undefined}><Icon size={18} /><span>{text}</span>{id === 'alerts' && <span className="nav-count">{alerts.filter(a => !acknowledged.includes(a.id)).length}</span>}{view === id && id !== 'alerts' && <span className="active-dot" />}</button>)}</nav>
      <div className="nav-label resources-label">RESOURCES</div><button className={`nav-item ${view === 'guide' ? 'active' : ''}`} onClick={() => navigate('guide')} aria-current={view === 'guide' ? 'page' : undefined}><BookOpen size={18} /><span>Field guide</span><ArrowUpRight size={14} /></button>
      <div className="sidebar-bottom"><div className="mission-card"><div className="mission-droplet"><Droplets size={24} /></div><h3>Small drops.<br />Lasting impact.</h3><p>Better insights for a<br />water-secure tomorrow.</p><svg viewBox="0 0 180 40" aria-hidden="true"><path d="M0 25Q30 5 60 25T120 25T180 25M0 34Q30 14 60 34T120 34T180 34" fill="none" stroke="currentColor" /></svg></div><button className="sidebar-help" onClick={() => setDialog('about')}><CircleHelp size={17} /><span>About AQUA-VISION</span><ArrowUpRight size={14} /></button><div className="profile"><span className="avatar">IC</span><div><strong>Imaginary Coders</strong><small>SIH 2026 · Team workspace</small></div></div></div>
    </aside>

    <div className="main-shell" inert={mobileNav ? true : undefined}>
      <header className="topbar"><div className="breadcrumbs"><button id="menu-toggle" className="icon-button mobile-toggle" aria-label="Toggle navigation" aria-expanded={mobileNav} onClick={() => setMobileNav(!mobileNav)}><Menu size={21} /></button><span className="breadcrumb-home">Workspace</span><ChevronRight size={13} /><strong>{label}</strong></div><div className="topbar-right"><div className="global-search"><Search size={16} /><input aria-label="Search samples" placeholder="Search samples..." value={search} onChange={e => { setSearch(e.target.value); if (e.target.value) navigate('samples'); }} />{search && <button className="icon-button" aria-label="Clear sample search" onClick={() => setSearch('')}><X size={13} /></button>}</div><span className="workspace-indicator"><span />Team workspace</span><button className="notification-button icon-button" aria-label="Open alerts" onClick={() => navigate('alerts')}><Bell size={19} />{alerts.some(a => !acknowledged.includes(a.id)) && <i />}</button><span className="top-avatar">IC</span></div></header>
      <main id="main-content" tabIndex="-1">
        {storageIssue && <div className="storage-warning" role="status">Browser storage is unavailable or saved data could not be loaded. Changes will last until this page is closed.</div>}
        <div className="page-heading"><div><div className="page-eyebrow"><span className="tiny-dot" />MONITOR. UNDERSTAND. PROTECT.</div><h1>{view === 'overview' ? 'Network overview' : label}</h1><p>{pageCopy[view][1]}</p></div><div className="page-heading-actions"><button className="button secondary export-button" onClick={() => download(view === 'reports' ? reports : filteredSamples, view === 'reports' ? 'reports' : 'samples')} disabled={view === 'reports' ? !reports.length : !filteredSamples.length}><ArrowDownToLine size={16} />Export data</button><button className="button primary" onClick={() => setDialog('new')}><Plus size={18} />New sample</button></div></div>
        <div className="context-bar"><div className="location-select"><MapPin size={15} /><select aria-label="Filter by monitoring location" value={location} onChange={e => changeLocation(e.target.value)}><option value="all">All monitoring locations</option>{sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}</select></div><span className="context-divider" /><span className="snapshot-label"><CalendarDays size={14} />Snapshot · {SNAPSHOT}</span><span className="context-source"><span />Local dataset</span></div>

        {view === 'overview' && <>
          <div className="metrics-grid">
            <Metric title="Connected nodes" value={String(connected).padStart(2, '0')} suffix={`/ ${String(visibleSites.length).padStart(2, '0')}`} icon={Radio} tone="teal" note={`${visibleSites.length - connected} offline · ${visibleSites.filter(s => s.status === 'Attention').length} need attention`} bars={[30, 45, 40, 60, 52, 74, 67, 83, 77, 91]} />
            <Metric title="Samples collected" value={String(locationSamples.length).padStart(2, '0')} icon={FlaskConical} tone="blue" note="Traceable from source to result" bars={[22, 35, 33, 49, 40, 66, 60, 77, 72, 95]} />
            <Metric title="Unacknowledged alerts" value={String(pendingAlerts).padStart(2, '0')} icon={Bell} tone="amber" note={`${locationAlerts.length} total signals in this snapshot`} />
            <Metric title="Awaiting lab results" value={String(pendingLab).padStart(2, '0')} icon={ClipboardList} tone="violet" note={`${reports.length} reports available`} />
          </div>
          <div className="overview-primary"><section className="panel map-panel"><SectionHeading title="Your monitoring network" action={<button className="text-link" onClick={() => navigate('monitoring')}>Explore sites<ArrowUpRight size={15} /></button>}><p>Connected sources. One clear picture.</p></SectionHeading><NetworkMap visibleSites={visibleSites} selected={selectedSite} onSelect={setSelectedSite} /><div className="map-legend"><span><i className="legend-dot teal" />Online <strong>{visibleSites.filter(s => s.status === 'Online').length}</strong></span><span><i className="legend-dot amber" />Attention <strong>{visibleSites.filter(s => s.status === 'Attention').length}</strong></span><span><i className="legend-dot gray" />Offline <strong>{visibleSites.filter(s => s.status === 'Offline').length}</strong></span><span className="map-legend-hint">Select a node to inspect</span></div></section>
            <section className="panel alerts-panel"><SectionHeading title="Recent alerts" action={<span className="count-bubble">{locationAlerts.length}</span>}><p>A little attention goes a long way.</p></SectionHeading><AlertList items={locationAlerts} acknowledged={acknowledged} onAcknowledge={acknowledge} onSite={visitSite} compact /><button className="panel-bottom-link" onClick={() => navigate('alerts')}>View all alerts<ArrowRight size={15} /></button></section>
          </div>
          <div className="overview-secondary"><TrendChart siteId={location} /><section className="panel recent-samples"><SectionHeading title="Recent samples" action={<button className="text-link" onClick={() => navigate('samples')}>View all<ArrowRight size={15} /></button>}><p>From field collection to reliable evidence.</p></SectionHeading><SampleTable samples={filteredSamples.slice(0, 4)} onOpen={openSample} compact /></section></div>
          <div className="evidence-note"><ShieldCheck size={16} /><p>Screening is a first step. <strong>Confirmation builds confidence.</strong> Routine sensors do not directly detect PFAS or confirm microplastics.</p><span>CONNECT <ChevronRight size={10} /> SCREEN <ChevronRight size={10} /> TRACE <ChevronRight size={10} /> CONFIRM</span></div>
        </>}

        {view === 'monitoring' && <><section className="panel map-panel"><SectionHeading title="Bhopal monitoring network" action={<Badge tone="success">{connected} nodes connected</Badge>}><p>Schematic locations · readings from the bundled snapshot</p></SectionHeading><NetworkMap visibleSites={visibleSites} selected={selectedSite} onSelect={setSelectedSite} large /><div className="map-legend"><span><i className="legend-dot teal" />Online</span><span><i className="legend-dot amber" />Attention</span><span><i className="legend-dot gray" />Offline</span></div></section><div className="site-grid">{visibleSites.map(site => <article key={site.id} className={`panel site-card ${site.id === selectedSite ? 'selected' : ''}`}><div className="site-card-header"><span className="site-code">{site.id}</span><Badge tone={site.status === 'Online' ? 'success' : site.status === 'Attention' ? 'amber' : 'neutral'}>{site.status}</Badge></div><h3>{site.name}</h3><p><MapPin size={13} />{site.type} · {site.area}</p><div className="readings"><div><span>pH</span><strong>{site.ph ?? '—'}</strong></div><div><span>Turbidity</span><strong>{site.turbidity ?? '—'}<small> NTU</small></strong></div><div><span>Temperature</span><strong>{site.temperature ?? '—'}<small> °C</small></strong></div></div><button className="site-card-action" onClick={() => { changeLocation(site.id); navigate('overview'); }}>View location overview<ArrowUpRight size={16} /></button></article>)}</div></>}

        {view === 'samples' && <section className="panel"><SectionHeading title="Sample register" action={<span className="soft-count">{filteredSamples.length} records</span>}><p>Collection records and their current stage.</p></SectionHeading><div className="table-toolbar"><div className="table-search"><Search size={16} /><input aria-label="Search sample register" placeholder="Search ID, location, test or team..." value={search} onChange={e => setSearch(e.target.value)} />{search && <button className="icon-button" aria-label="Clear register search" onClick={() => setSearch('')}><X size={14} /></button>}</div><div className="status-filter"><SlidersHorizontal size={15} /><select aria-label="Filter sample status" value={status} onChange={e => setStatus(e.target.value)}>{['All statuses', 'Collected', 'In transit', 'At laboratory', 'Report available'].map(s => <option key={s}>{s}</option>)}</select></div></div><SampleTable samples={filteredSamples} onOpen={openSample} /><div className="table-footer">Showing {filteredSamples.length} of {locationSamples.length} samples at {location === 'all' ? 'all locations' : findSite(location).name}<span>Records saved in this browser</span></div></section>}

        {view === 'alerts' && <div className="alerts-page"><section className="panel"><SectionHeading title="Signals requiring review" action={<Badge tone={pendingAlerts ? 'amber' : 'success'}>{pendingAlerts} unacknowledged</Badge>}><p>Snapshot on 20 Oct 2026 · times in IST</p></SectionHeading><AlertList items={locationAlerts} acknowledged={acknowledged} onAcknowledge={acknowledge} onSite={visitSite} /></section><aside className="panel explanation-card"><span className="explanation-icon"><Activity size={25} /></span><h3>A signal, not a diagnosis.</h3><p>Changes in pH and turbidity help identify where a closer look may be needed. They do not directly detect PFAS or identify microplastics.</p><hr /><h4>What does acknowledging do?</h4><p>It records that you have seen the alert. It does not resolve the underlying anomaly or change a reading.</p><small>Trigger values are illustrative settings, not regulatory limits.</small></aside></div>}

        {view === 'reports' && <><div className="info-strip"><FlaskConical size={20} /><p>Bundled reports contain <strong>illustrative results</strong>. Review each method and sample history; these values are not laboratory certifications.</p></div>{reports.length ? <div className="reports-grid">{reports.map(record => <article className="panel report-card" key={record.id}><div className="report-card-top"><span className="report-file"><FileCheck2 size={24} /></span><span className="source-tag">Illustrative report</span></div><span className="eyebrow">{record.id}</span><h3>{findSite(record.siteId).name}</h3><p>{record.type}</p><div className="report-card-result"><span>ILLUSTRATIVE RESULT</span><strong>{record.report.result}</strong></div><small>{record.report.note}</small><button className="site-card-action" onClick={() => openSample(record)}>View report & sample trail<ArrowUpRight size={16} /></button></article>)}</div> : <section className="panel"><EmptyState title="No laboratory report available" text="No report is available for this location. Select another location to view its records." /></section>}</>}

        {view === 'guide' && <Guide />}
        <footer className="page-footer"><span><Droplets size={13} />AQUA-VISION <i />Protecting every drop.</span><span>Built for a clearer tomorrow <span className="footer-dot">·</span> SIH 2026</span></footer>
      </main>
    </div>

    {dialog === 'new' && <SampleForm siteId={location} onSave={register} onClose={() => setDialog(null)} />}
    {dialog === 'detail' && sample && <SampleDetails sample={sample} onClose={() => setDialog(null)} onExport={download} />}
    {dialog === 'about' && <Modal title="A clearer view of water." subtitle="AQUA-VISION · Smart India Hackathon 2026" onClose={() => setDialog(null)}><div className="about-content"><span className="source-tag">Water monitoring frontend</span><p>AQUA-VISION brings monitoring locations, field samples, and report records into one connected workspace. This frontend uses bundled records and browser-local storage.</p><p>New samples and acknowledged alerts are saved in this browser where storage is available. No data is sent to a server.</p><div className="modal-notice"><ShieldCheck size={20} /><span>Screening and routine readings cannot establish water safety. Bundled readings and report values are illustrative.</span></div><p className="muted">Created for team Imaginary Coders · SIH26252</p></div><div className="modal-actions"><button className="button danger-quiet" onClick={() => setDialog('reset')}><RotateCcw size={15} />Reset workspace data</button><button className="button primary" onClick={() => setDialog(null)}>Back to workspace</button></div></Modal>}
    {dialog === 'reset' && <Modal title="Reset workspace data?" subtitle="This clears samples you added and alert acknowledgements in this browser." onClose={() => setDialog(null)}><p className="reset-description">The original bundled records will remain. This action cannot be undone.</p><div className="modal-actions"><button className="button secondary" onClick={() => setDialog(null)}>Cancel</button><button className="button primary" onClick={() => { setAdded([]); setAcknowledged([]); setSearch(''); setStatus('All statuses'); changeLocation('all'); setDialog(null); setToast('Workspace restored to its original records.'); }}>Reset workspace</button></div></Modal>}
    {toast && <div className="toast" role="status"><span><Check size={17} /></span>{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15} /></button></div>}
  </div>;
}

function Metric({ title, value, suffix, icon: Icon, tone, note, bars }) {
  return <section className={`metric-card ${tone}`}><div className="metric-top"><span>{title}</span><span className="metric-icon"><Icon size={18} /></span></div><div className="metric-middle"><div className="metric-value">{value}<span>{suffix}</span></div>{bars ? <div className="spark-bars" aria-hidden="true">{bars.map((height, i) => <i key={i} style={{ height: `${height}%`, opacity: .2 + i * .07 }} />)}</div> : <span className="metric-decoration" aria-hidden="true">{tone === 'amber' ? <Activity size={59} strokeWidth={1} /> : <FlaskConical size={44} strokeWidth={1} />}</span>}</div><p className="metric-note"><span />{note}</p></section>;
}
