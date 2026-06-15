// router.js – Simple hash-based router for SPA navigation

export class Router {
  constructor(routes, defaultRoute) {
    this.routes = routes;
    this.defaultRoute = defaultRoute;
    this.currentRoute = null;

    window.addEventListener('hashchange', () => this.handleRouteChange());
  }

  // Start the router
  init() {
    this.handleRouteChange();
  }

  // Parse the current hash and render the corresponding view
  handleRouteChange() {
    let hash = window.location.hash.slice(1);
    if (!hash) {
      hash = this.defaultRoute;
      window.location.hash = hash;
      return; // Will trigger another hashchange
    }

    const route = this.routes[hash];
    if (route) {
      if (this.currentRoute && this.currentRoute.onLeave) {
        this.currentRoute.onLeave();
      }
      this.currentRoute = route;
      const appRoot = document.getElementById('appRoot');
      appRoot.innerHTML = ''; // Clear current view safely
      
      // Update ARIA navigation attributes
      document.querySelectorAll('.site-nav .nav-btn').forEach(btn => {
        btn.setAttribute('aria-selected', btn.getAttribute('aria-controls') === hash ? 'true' : 'false');
      });

      // Render the new view
      const viewElement = route.onEnter();
      if (viewElement) {
        appRoot.appendChild(viewElement);
      }
    } else {
      // Fallback for unknown routes
      window.location.hash = this.defaultRoute;
    }
  }

  // Programmatically navigate
  navigate(path) {
    window.location.hash = path;
  }
}
