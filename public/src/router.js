/**
 * @module router
 * @description Handles client-side navigation and lazy-loading of heavy dependencies.
 */
import { state, patchState } from './state.js';

let chartJsLoaded = false;
let lucideLoaded = false;

/**
 * Dynamically loads Lucide icons and initializes them on the page.
 */
export async function loadLucide() {
  if (lucideLoaded) return;
  try {
    const lucide = await import('lucide');
    lucide.createIcons();
    lucideLoaded = true;
  } catch (err) {
    console.error('Failed to load Lucide:', err);
  }
}

/**
 * Dynamically loads Chart.js and registers all components.
 * @returns {Promise<any>} The imported Chart object
 */
export async function loadChartJs() {
  if (chartJsLoaded) return window.Chart;
  try {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);
    window.Chart = Chart;
    chartJsLoaded = true;
    return Chart;
  } catch (err) {
    console.error('Failed to load Chart.js:', err);
  }
}

/**
 * Core navigation function. Hides all sections and shows the target.
 * Triggers lazy-loading for heavy assets if required by the page.
 * @param {string} page - Target page ID
 */
export async function navigate(page) {
  // Update state
  await patchState({ currentPage: page });

  // Hide all sections
  document.querySelectorAll('.section').forEach((sec) => {
    sec.classList.remove('active');
  });

  // Deactivate all nav links
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.remove('active');
  });

  // Activate target
  const targetSec = document.getElementById(page);
  if (targetSec) targetSec.classList.add('active');

  const targetLink = document.querySelector(`[data-page="${page}"]`);
  if (targetLink) targetLink.classList.add('active');

  // Keyboard Accessibility: push focus to the section's H2
  if (targetSec) {
    const heading = targetSec.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }

  // Lazy-load Lucide icons for all UI elements
  await loadLucide();

  // Lazy-load Chart.js specifically for the Analytics page
  if (page === 'analytics') {
    await loadChartJs();
    // Dispatch a custom event to notify charts.js that it can render
    window.dispatchEvent(new Event('chartjs-loaded'));
  }
}
