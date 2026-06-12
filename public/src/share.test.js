/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { buildShareUrl, buildShareMessage, renderShareButtons, copyShareLink } from './share.js';

describe('Share Module', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Reset share URL store
    delete window.__ecoShareUrl;
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://ecotrack.app' },
      writable: true,
    });
  });

  describe('buildShareUrl()', () => {
    it('should build a URL with encoded stats', () => {
      const stats = { total: 300, month: '2026-06', ecoScore: 100 };
      const url = buildShareUrl(stats);
      expect(url).toContain('https://ecotrack.app/share');
      expect(url).toContain('data=');
      // Decode and verify round-trip
      const encoded = url.split('data=')[1];
      const decoded = JSON.parse(atob(decodeURIComponent(encoded)));
      expect(decoded.total).toBe(300);
      expect(decoded.ecoScore).toBe(100);
    });
  });

  describe('buildShareMessage()', () => {
    it('should include the total CO2 and eco score', () => {
      const stats = { total: 250.7, ecoScore: 75 };
      const msg = buildShareMessage(stats);
      expect(msg).toContain('251 kg');
      expect(msg).toContain('75');
      expect(msg).toContain('#CarbonFootprint');
    });
  });

  describe('renderShareButtons()', () => {
    it('should render Twitter, WhatsApp and copy buttons', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const stats = { total: 300, month: '2026-06', ecoScore: 100 };
      renderShareButtons(container, stats);
      expect(container.querySelectorAll('.share-btn').length).toBe(3);
      expect(container.querySelector('.share-twitter')).not.toBeNull();
      expect(container.querySelector('.share-whatsapp')).not.toBeNull();
      expect(container.querySelector('.share-copy')).not.toBeNull();
    });

    it('should store the share URL on window.__ecoShareUrl', () => {
      const container = document.createElement('div');
      const stats = { total: 300, month: '2026-06', ecoScore: 100 };
      renderShareButtons(container, stats);
      expect(window.__ecoShareUrl).toContain('https://ecotrack.app/share');
    });
  });

  describe('copyShareLink()', () => {
    it('should return early if no share URL is set', async () => {
      // Should not throw
      await expect(copyShareLink()).resolves.toBeUndefined();
    });

    it('should call clipboard.writeText and update button text on success', async () => {
      window.__ecoShareUrl = 'https://ecotrack.app/share?data=abc';
      document.body.innerHTML = '<button id="shareCopyBtn">Copy Link</button>';

      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockResolvedValue(undefined) }
      });

      jest.useFakeTimers();
      await copyShareLink();
      jest.runAllTimers();
      jest.useRealTimers();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://ecotrack.app/share?data=abc');
    });

    it('should fallback gracefully when clipboard API fails', async () => {
      window.__ecoShareUrl = 'https://ecotrack.app/share?data=abc';
      document.body.innerHTML = '<p id="shareUrlDisplay">url</p>';

      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockRejectedValue(new Error('NotAllowed')) }
      });

      // Should not throw
      await expect(copyShareLink()).resolves.toBeUndefined();
    });

    it('should handle missing copy button gracefully', async () => {
      window.__ecoShareUrl = 'https://ecotrack.app/share?data=abc';
      document.body.innerHTML = ''; // no button

      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockResolvedValue(undefined) }
      });

      await expect(copyShareLink()).resolves.toBeUndefined();
    });
  });
});
