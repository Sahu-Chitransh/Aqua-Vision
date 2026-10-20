import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../src/App.jsx';
import * as workspaceData from '../src/data.js';

const selectLocation = async (user, id) => user.selectOptions(screen.getByRole('combobox', { name: 'Filter by monitoring location' }), id);
const navigate = async (user, name) => user.click(screen.getByRole('button', { name, exact: true }));

describe('frontend workflows without a browser or service', () => {
  it('opens the overview and renders workspace evidence boundaries', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Network overview');
    expect(screen.getByText('Team workspace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upper Lake inlet, Attention' })).toBeInTheDocument();
    expect(screen.getByText(/Routine sensors do not directly detect/)).toBeInTheDocument();
  });
  it('scopes nodes, sample records and metrics to the selected site', async () => {
    const user = userEvent.setup(); render(<App />);
    await selectLocation(user, 'AV-003');
    expect(screen.queryByRole('button', { name: 'Bairagarh intake, Online' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upper Lake inlet, Attention' })).toBeInTheDocument();
    expect(screen.getByText('Samples collected').closest('section')).toHaveTextContent('02');
    await navigate(user, 'Samples & tests');
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('AQ-2026-084')).toBeInTheDocument();
    expect(screen.queryByText('AQ-2026-083')).not.toBeInTheDocument();
  });
  it('validates registration, retains data and focuses the first invalid field', async () => {
    const user = userEvent.setup(); render(<App />);
    await navigate(user, 'New sample');
    await navigate(user, 'Register sample');
    expect(screen.getByLabelText('Collection site')).toHaveFocus();
    expect(screen.getByText('Choose a collection site.')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Collection site'), 'AV-001');
    await user.selectOptions(screen.getByLabelText('Intended test'), 'Microplastic screening');
    await user.selectOptions(screen.getByLabelText('Collected by'), 'Field team A');
    await user.clear(screen.getByLabelText('Volume (mL)'));
    await user.type(screen.getByLabelText('Volume (mL)'), '49');
    await navigate(user, 'Register sample');
    expect(screen.getByText('Enter a whole number from 50 to 5000 mL.')).toBeInTheDocument();
    expect(screen.getByLabelText('Collection site')).toHaveValue('AV-001');
    expect(screen.getByLabelText('Volume (mL)')).toHaveFocus();
  });
  it('registers a local sample with only a collection event and restores it after remount', async () => {
    const user = userEvent.setup(); const app = render(<App />);
    await selectLocation(user, 'AV-002');
    await navigate(user, 'New sample');
    expect(screen.getByLabelText('Collection site')).toHaveValue('AV-002');
    await user.selectOptions(screen.getByLabelText('Intended test'), 'PFAS laboratory assay');
    await user.selectOptions(screen.getByLabelText('Collected by'), 'Field team B');
    await navigate(user, 'Register sample');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Samples & tests');
    const saved = JSON.parse(localStorage.getItem('aqua-vision-workspace-v1')).added[0];
    expect(saved.id).toMatch(/^AQ-\d{4}-[A-F0-9]{8}$/);
    expect(saved.stage).toBe('Collected');
    await navigate(user, saved.id);
    const modal = screen.getByRole('dialog');
    expect(within(modal).getAllByText('Not recorded')).toHaveLength(3);
    expect(within(modal).getByText(/No laboratory report available/)).toBeInTheDocument();
    app.unmount(); render(<App />);
    expect(screen.getByRole('button', { name: saved.id, exact: true })).toBeInTheDocument();
  });
  it('searches samples and distinguishes the empty state', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.type(screen.getByRole('textbox', { name: 'Search samples', exact: true }), '084');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Samples & tests');
    expect(screen.getAllByRole('row')).toHaveLength(2);
    await user.clear(screen.getByRole('textbox', { name: 'Search sample register' }));
    await user.type(screen.getByRole('textbox', { name: 'Search sample register' }), 'nonexistent');
    expect(screen.getByText('No samples match this search')).toBeInTheDocument();
  });
  it('acknowledges alerts without clearing the sensor anomaly', async () => {
    const user = userEvent.setup(); render(<App />);
    await navigate(user, 'Acknowledge: Turbidity needs attention');
    expect(screen.getByRole('button', { name: 'Acknowledged: Turbidity needs attention' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Upper Lake inlet, Attention' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('aqua-vision-workspace-v1')).acknowledged).toEqual(['A1']);
    expect(screen.queryByText('Resolved')).not.toBeInTheDocument();
  });
  it('does not show synthetic historical readings for an offline site', async () => {
    const user = userEvent.setup(); render(<App />);
    await selectLocation(user, 'AV-008');
    expect(screen.getByText('No readings available')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Generated values/ })).not.toBeInTheDocument();
  });
  it('changes the plotted parameter and period accessibly', async () => {
    const user = userEvent.setup(); render(<App />);
    await navigate(user, 'Turbidity');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Trend period' }), '7 days');
    expect(screen.getByRole('img', { name: /Turbidity, 7 days, network average/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Turbidity', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });
  it('keeps report availability and location filtering consistent', async () => {
    const user = userEvent.setup(); render(<App />);
    await navigate(user, 'Reports');
    expect(screen.getAllByRole('button', { name: 'View report & sample trail' })).toHaveLength(3);
    await selectLocation(user, 'AV-003');
    expect(screen.getByText('No laboratory report available')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export data' })).toBeDisabled();
    await selectLocation(user, 'AV-007');
    await navigate(user, 'View report & sample trail');
    expect(within(screen.getByRole('dialog')).getByText('PFOA: 3.1 ng/L · PFOS: 2.4 ng/L')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByText('Local dataset')).toBeInTheDocument();
  });
  it('requires confirmation before resetting browser changes', async () => {
    const user = userEvent.setup(); render(<App />);
    await navigate(user, 'Acknowledge: Turbidity needs attention');
    await navigate(user, 'About AQUA-VISION');
    await navigate(user, 'Reset workspace data');
    expect(JSON.parse(localStorage.getItem('aqua-vision-workspace-v1')).acknowledged).toEqual(['A1']);
    await navigate(user, 'Reset workspace');
    expect(JSON.parse(localStorage.getItem('aqua-vision-workspace-v1')).acknowledged).toEqual([]);
  });
  it('dismisses a dialog on its native cancel event', async () => {
    const user = userEvent.setup(); render(<App />);
    await navigate(user, 'New sample');
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true, cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('keeps the app usable if browser persistence fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    render(<App />);
    expect(screen.getByText(/Changes will last until this page is closed/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Network overview');
  });
  it('exports exactly the records visible under location and status filters', async () => {
    const download = vi.spyOn(workspaceData, 'exportCsv').mockImplementation(() => {});
    const user = userEvent.setup(); render(<App />);
    await navigate(user, 'Samples & tests');
    await selectLocation(user, 'AV-003');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter sample status' }), 'At laboratory');
    expect(screen.getAllByRole('row')).toHaveLength(2);
    await navigate(user, 'Export data');
    expect(download).toHaveBeenCalledOnce();
    expect(download.mock.calls[0][0].map(record => record.id)).toEqual(['AQ-2026-077']);
  });
  it('excludes closed mobile navigation from keyboard interaction and closes on Escape', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} }));
    const user = userEvent.setup(); render(<App />);
    expect(screen.getByLabelText('Main navigation')).toHaveAttribute('inert');
    await navigate(user, 'Toggle navigation');
    expect(screen.getByRole('dialog', { name: 'Main navigation' })).not.toHaveAttribute('inert');
    expect(screen.getByRole('main').parentElement).toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: 'Close navigation menu' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Main navigation' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle navigation' })).toHaveFocus();
  });
});
