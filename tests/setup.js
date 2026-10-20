import { createRequire } from 'node:module';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, expect } from 'vitest';

const require = createRequire(import.meta.url);
expect.extend(require('@testing-library/jest-dom/matchers'));

// JSDOM tests component behavior; native browser dialog focus/layout are not emulated.
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
window.matchMedia = query => ({
  matches: false, media: query, addEventListener() {}, removeEventListener() {},
});
beforeEach(() => { localStorage.clear(); window.history.replaceState(null, '', '/'); });
afterEach(() => { cleanup(); });
