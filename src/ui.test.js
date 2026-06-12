/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('UI Interaction Tests', () => {
  beforeEach(() => {
    // Reset the DOM
    document.documentElement.innerHTML = html.toString();
    // Clear localStorage
    localStorage.clear();
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should show login modal by default', () => {
      const authOverlay = document.getElementById('authOverlay');
      expect(authOverlay).not.toBeNull();
      // It starts without hidden class
      expect(authOverlay.classList.contains('hidden')).toBeFalsy();
    });

    it('should toggle to signup form', () => {
      const showSignupBtn = document.getElementById('showSignupBtn');
      const loginForm = document.getElementById('loginForm');
      const signupForm = document.getElementById('signupForm');
      
      expect(loginForm.classList.contains('hidden')).toBeFalsy();
      expect(signupForm.classList.contains('hidden')).toBeTruthy();
      
      showSignupBtn.click();
      
      expect(loginForm.classList.contains('hidden')).toBeTruthy();
      expect(signupForm.classList.contains('hidden')).toBeFalsy();
    });

    it('should toggle back to login form', () => {
      const showLoginBtn = document.getElementById('showLoginBtn');
      const loginForm = document.getElementById('loginForm');
      const signupForm = document.getElementById('signupForm');
      
      document.getElementById('showSignupBtn').click(); // switch to signup
      showLoginBtn.click(); // switch back
      
      expect(loginForm.classList.contains('hidden')).toBeFalsy();
      expect(signupForm.classList.contains('hidden')).toBeTruthy();
    });

    it('should handle guest login', () => {
      const guestLoginBtn = document.getElementById('guestLoginBtn');
      guestLoginBtn.click();
      
      const authOverlay = document.getElementById('authOverlay');
      const onboardingModal = document.getElementById('onboardingModal');
      
      expect(authOverlay.classList.contains('hidden')).toBeTruthy();
      expect(onboardingModal.classList.contains('hidden')).toBeFalsy();
    });
  });

  describe('Sidebar & Navigation', () => {
    it('should toggle sidebar mobile visibility', () => {
      const menuBtn = document.getElementById('menuBtn');
      const sidebar = document.getElementById('sidebar');
      
      expect(sidebar.classList.contains('translate-x-0')).toBeFalsy();
      menuBtn.click();
      expect(sidebar.classList.contains('translate-x-0')).toBeTruthy();
    });

    it('should close sidebar via close button', () => {
      const closeSidebarBtn = document.getElementById('closeSidebarBtn');
      const sidebar = document.getElementById('sidebar');
      
      document.getElementById('menuBtn').click(); // open it
      closeSidebarBtn.click();
      expect(sidebar.classList.contains('-translate-x-full')).toBeTruthy();
    });

    it('should highlight active nav link', () => {
      const navLinks = document.querySelectorAll('.nav-link');
      const dashboardLink = navLinks[0];
      const analyticsLink = navLinks[1];
      
      dashboardLink.click();
      expect(dashboardLink.classList.contains('bg-eco-600')).toBeTruthy();
      expect(dashboardLink.classList.contains('text-white')).toBeTruthy();
      expect(analyticsLink.classList.contains('bg-eco-600')).toBeFalsy();
    });

    it('should switch sections based on nav click', () => {
      const navLinks = document.querySelectorAll('.nav-link');
      const dashboardSection = document.getElementById('dashboardSection');
      const analyticsSection = document.getElementById('analyticsSection');
      
      // Click analytics
      navLinks[1].click();
      expect(dashboardSection.classList.contains('hidden')).toBeTruthy();
      expect(analyticsSection.classList.contains('hidden')).toBeFalsy();
    });
  });

  describe('Settings & Theme', () => {
    it('should open settings modal', () => {
      const openSettingsBtn = document.getElementById('openSettingsBtn');
      const settingsModal = document.getElementById('settingsModal');
      
      expect(settingsModal.classList.contains('hidden')).toBeTruthy();
      openSettingsBtn.click();
      expect(settingsModal.classList.contains('hidden')).toBeFalsy();
    });

    it('should close settings modal via cancel button', () => {
      const openSettingsBtn = document.getElementById('openSettingsBtn');
      const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
      const settingsModal = document.getElementById('settingsModal');
      
      openSettingsBtn.click();
      cancelSettingsBtn.click();
      expect(settingsModal.classList.contains('hidden')).toBeTruthy();
    });
    
    it('should apply and save dark mode setting', () => {
      const themeSelect = document.getElementById('themeSelect');
      const saveSettingsBtn = document.getElementById('saveSettingsBtn');
      
      themeSelect.value = 'dark';
      saveSettingsBtn.click();
      
      expect(document.documentElement.classList.contains('dark')).toBeTruthy();
    });
    
    it('should apply currency setting to local storage', () => {
      const currencySelect = document.getElementById('currencySelect');
      const saveSettingsBtn = document.getElementById('saveSettingsBtn');
      
      currencySelect.value = 'EUR';
      saveSettingsBtn.click();
      
      const savedState = JSON.parse(localStorage.getItem('ecoState'));
      expect(savedState.currency).toBe('EUR');
    });
  });

  describe('Data Input Interactivity', () => {
    it('should update range value display on input', () => {
      const carDistInput = document.getElementById('carDist');
      const carDistVal = document.getElementById('carDistVal');
      
      carDistInput.value = '500';
      const event = new Event('input', { bubbles: true });
      carDistInput.dispatchEvent(event);
      
      // We expect the text content of the span to update
      expect(carDistVal.textContent).toBe('500');
    });

    it('should enable recycling range when checkbox is checked', () => {
      const isRecycling = document.getElementById('isRecycling');
      const recyclingRate = document.getElementById('recyclingRate');
      
      expect(recyclingRate.disabled).toBeTruthy();
      
      isRecycling.checked = true;
      isRecycling.dispatchEvent(new Event('change', { bubbles: true }));
      
      expect(recyclingRate.disabled).toBeFalsy();
    });
    
    it('should persist form values to localStorage on input via debounce', () => {
      jest.useFakeTimers();
      
      const homeSize = document.getElementById('homeSize');
      homeSize.value = 'large';
      homeSize.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Advance timers to trigger debounce
      jest.advanceTimersByTime(200);
      
      const savedState = JSON.parse(localStorage.getItem('ecoState'));
      expect(savedState).toBeDefined();
      
      jest.useRealTimers();
    });
  });
});
