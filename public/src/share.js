import DOMPurify from 'dompurify';
/**
 * @module share
 * @description Social sharing module for EcoTrack.
 * Generates shareable links and renders share buttons
 * (Twitter, WhatsApp, Copy Link) for the awareness goal.
 */

/**
 * Build a shareable URL encoding the user's current eco stats.
 * @param {{ total: number, month: string, ecoScore: number }} stats
 * @returns {string} Full share URL
 */
export function buildShareUrl(stats) {
  const data = btoa(JSON.stringify(stats));
  const base = `${window.location.origin}/share`;
  return `${base}?data=${encodeURIComponent(data)}`;
}

/**
 * Generate a share message.
 * @param {{ total: number, ecoScore: number }} stats
 * @returns {string}
 */
export function buildShareMessage(stats) {
  return `🌍 I tracked my carbon footprint this month: ${stats.total.toFixed(0)} kg CO₂. My eco-score is ${stats.ecoScore}! Join me on EcoTrack and let's fight climate change together. #CarbonFootprint #EcoChallenge #ClimateAction`;
}

/**
 * Render share buttons into a container element.
 * @param {HTMLElement} container
 * @param {{ total: number, month: string, ecoScore: number }} stats
 */
export function renderShareButtons(container, stats) {
  const url = buildShareUrl(stats);
  const msg = buildShareMessage(stats);
  const encodedMsg = encodeURIComponent(msg);
  const encodedUrl = encodeURIComponent(url);

  container.innerHTML = DOMPurify.sanitize(`
    <div class="share-panel" role="region" aria-label="Share your eco stats">
      <h4 class="share-title">📣 Spread the word — inspire others!</h4>
      <div class="share-buttons">
        <a
          href="https://twitter.com/intent/tweet?text=${encodedMsg}&url=${encodedUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="share-btn share-twitter"
          aria-label="Share on Twitter/X"
          id="shareTwitterBtn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Share on X
        </a>
        <a
          href="https://wa.me/?text=${encodedMsg}%20${encodedUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="share-btn share-whatsapp"
          aria-label="Share on WhatsApp"
          id="shareWhatsappBtn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
          </svg>
          WhatsApp
        </a>
        <button
          class="share-btn share-copy"
          onclick="copyShareLink()"
          aria-label="Copy share link to clipboard"
          id="shareCopyBtn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy Link
        </button>
      </div>
      <p class="share-url" id="shareUrlDisplay" style="word-break:break-all;opacity:0.6;font-size:0.75rem;margin-top:0.5rem;">${url}</p>
    </div>
  `);

  // Store URL for copy function
  window.__ecoShareUrl = url;
}

/**
 * Copy the current share URL to clipboard and show feedback.
 * Exposed to window from app.js.
 */
export async function copyShareLink() {
  const url = window.__ecoShareUrl;
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    const btn = document.getElementById('shareCopyBtn');
    if (btn) {
      btn.textContent = '✅ Copied!';
      setTimeout(() => {
        btn.innerHTML = DOMPurify.sanitize(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy Link`);
      }, 2000);
    }
  } catch {
    // Fallback for browsers without clipboard API
    const el = document.getElementById('shareUrlDisplay');
    if (el) el.select?.();
  }
}
