import { describe, expect, it, vi } from 'vitest';
import { buildCsv, csvCell, initialSamples, loadWorkspace, saveWorkspace, validSample } from '../src/data.js';

const sample = { id: 'AQ-2026-ABCD1234', siteId: 'AV-001', type: 'Microplastic screening', volume: 500, collector: 'Field team A', stage: 'Collected', collectedAt: '2026-10-20T08:00:00Z' };

describe('workspace persistence and evidence boundaries', () => {
  it('round trips locally collected samples and acknowledged alerts', () => {
    expect(saveWorkspace([sample], ['A1'])).toBe(true);
    expect(loadWorkspace()).toEqual({ added: [sample], acknowledged: ['A1'], storageIssue: false });
  });
  it.each([
    { ...sample, volume: 49 }, { ...sample, volume: 5001 }, { ...sample, volume: 100.5 },
    { ...sample, siteId: 'missing' }, { ...sample, stage: 'Report available' },
    { ...sample, collector: 'Real person' }, { ...sample, collectedAt: 'not a date' },
  ])('rejects invalid persisted samples %#', invalid => { expect(validSample(invalid)).toBe(false); });
  it('recovers from malformed JSON', () => {
    localStorage.setItem('aqua-vision-workspace-v1', '{invalid');
    expect(loadWorkspace()).toEqual({ added: [], acknowledged: [], storageIssue: true });
  });
  it('rejects duplicate IDs and fixture collisions', () => {
    saveWorkspace([sample, sample], []);
    expect(loadWorkspace().storageIssue).toBe(true);
    saveWorkspace([{ ...sample, id: initialSamples[0].id }], []);
    expect(loadWorkspace().storageIssue).toBe(true);
  });
  it('drops injected report fields from otherwise valid local records', () => {
    saveWorkspace([{ ...sample, report: { result: 'Pretend confirmation' } }], []);
    expect(loadWorkspace().added[0]).not.toHaveProperty('report');
  });
  it('handles unavailable storage without throwing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(saveWorkspace([sample], [])).toBe(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(loadWorkspace().storageIssue).toBe(true);
  });
});

describe('CSV exports', () => {
  it('quotes embedded separators, quotes and newlines', () => {
    expect(csvCell('a,"b"\nc')).toBe('"a,""b""\nc"');
  });
  it.each(['=HYPERLINK("x")', '+123', '-123', '@SUM(1)', ' \t=2+2'])('neutralizes formula input %s', input => {
    expect(csvCell(input).startsWith('"\'')).toBe(true);
  });
  it('exports only the supplied subset and labels illustrative report values', () => {
    const csv = buildCsv([initialSamples[0]]);
    expect(csv).toContain('BUNDLED REPORT VALUES ARE ILLUSTRATIVE');
    expect(csv).toContain(initialSamples[0].id);
    expect(csv).not.toContain(initialSamples[1].id);
    expect(csv).toContain('No laboratory report available');
  });
});
