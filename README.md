# 🌍 EcoTrack — Carbon Footprint Awareness Platform

> A full-stack, production-grade web application to help individuals track, understand, and actively reduce their personal carbon footprint through personalized insights, interactive analytics, and science-backed eco-challenges.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://carbon-footprint-platform-726932717634.us-central1.run.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-blue)](https://github.com/Ndheeraj906/Carbon-Footprint-Awareness-Platform)
[![Cloud Run](https://img.shields.io/badge/Deployed-Cloud%20Run-orange)](https://console.cloud.google.com/run)
[![Tests](https://img.shields.io/badge/Tests-Passing-success)](./calculator.test.js)

---

## 🎯 Problem Statement

Climate change is the defining challenge of our time. The average global citizen emits **4.8 tonnes of CO₂ per year**, while the Paris Agreement 1.5°C target requires reducing this to **2.3 tonnes**. Most people are **unaware** of their personal contribution to climate change and **lack actionable tools** to measure and reduce it.

**EcoTrack solves this by:**
- Providing a precise, science-backed carbon footprint calculator across Transport, Energy, Food, and Waste.
- Delivering personalized, data-driven reduction recommendations.
- Gamifying the reduction journey with eco-levels, streaks, and achievement badges.
- Educating users with curated climate science content and quick-win tips.

---

## ✨ Features

### 🧮 Multi-Category Carbon Calculator
- **Transport**: Car travel (Petrol/Diesel/Hybrid/EV), short/long-haul flights, public transit, cycling.
- **Energy**: Electricity (Grid/Partial Renewable/100% Renewable), natural gas, heating oil, home size.
- **Food**: Beef, poultry, fish, dairy, vegetables — with diet style modifiers (vegan, vegetarian, omnivore, heavy meat).
- **Waste**: General waste with recycling rate, clothing purchases, online shopping.

### 📊 Real-Time Analytics Dashboard
- Live CO₂ calculation as you type.
- Monthly trend charts with Chart.js.
- Category breakdown (Transport, Energy, Food, Waste).
- Global comparison against USA, World Average, and 1.5°C target.

### 🏆 Gamification System
- **Eco Levels**: Seedling → Sapling → Leaf → Tree → Forest → Forest Guardian.
- Daily activity **streaks** with flame badges.
- **Eco Score** based on cumulative reductions.
- 6 unlockable achievement badges.

### 💡 Education & Action Hub
- 30+ climate facts from IPCC, NASA, and IEA.
- Category-specific eco-tips (Transport, Energy, Food, Waste, Lifestyle).
- "Quick Wins" — high-impact, low-effort actions.
- Personalized goal-setting with slider.

### 🔐 Secure Authentication
- SHA-256 password hashing via SubtleCrypto Web API.
- XSS prevention with HTML escaping on all inputs.
- Content Security Policy headers.
- Session persistence via localStorage.

---

## 🏗️ Architecture

```
├── index.html          # Semantic HTML5 — WCAG 2.1 AA compliant
├── styles.css          # Vanilla CSS with CSS custom properties
├── app.js              # Main app — modular ES6 with JSDoc
├── src/
│   └── calculator.js   # Pure calculation logic (ES Module)
├── calculator.test.js  # Jest unit tests — 100% function coverage
├── Dockerfile          # Production Node.js container
├── package.json        # ESM, Jest, ESLint, Prettier
├── .eslintrc.json      # ESLint config
└── .prettierrc         # Prettier config
```

---

## 🧪 Testing

```bash
npm test              # Run Jest unit tests
npm run test:coverage # Run with code coverage report
```

**Test Coverage:**
- `calculateTransportCO2()` — petrol, electric vehicles, flights, transit
- `calculateEnergyCO2()` — grid, partial, and renewable energy sources
- `calculateFoodCO2()` — meat-heavy and plant-based diets
- `calculateWasteCO2()` — recycling rates, clothing, online shopping

---

## 🔒 Security

| Feature | Implementation |
|--------|---------------|
| Password Hashing | SHA-256 via SubtleCrypto (Web Crypto API) |
| XSS Prevention | `escapeHtml()` on all user inputs |
| Content Security Policy | `default-src 'self'` with explicit allowlist |
| Security Headers | `X-Content-Type-Options: nosniff` |
| Input Validation | Min-length, type, and format checks |

---

## ♿ Accessibility (WCAG 2.1 AA)

- All `<label>` elements properly linked with `for` attributes.
- `aria-label` on all icon buttons and controls.
- `aria-hidden="true"` on decorative icons.
- Semantic HTML5: `<main>`, `<nav>`, `<header>`, `<section>`, `<article>`.
- Skip-to-content link for keyboard users.
- Keyboard navigable throughout.
- High-contrast colour palette.

---

## ⚡ Performance

- External scripts loaded with `defer`.
- Google Fonts loaded with `preconnect`.
- CSS custom properties for efficient theming.
- No blocking resources in `<head>`.

---

## 🌐 Deployment

Deployed to **Google Cloud Run** (serverless, auto-scaling):

```bash
gcloud run deploy carbon-footprint-platform \
  --source=. \
  --region=us-central1 \
  --allow-unauthenticated \
  --project=carbon-footprint-awareness
```

**Live URL:** https://carbon-footprint-platform-726932717634.us-central1.run.app

---

## 🚀 Local Development

```bash
npm install
npm run dev     # Starts http-server on port 3000
```

> [!NOTE]
> **Data Persistence & Authentication Note:**
> This application is built as a highly responsive client-side experience for demonstration purposes. It utilizes local web storage (`localStorage`) to manage user profiles, calculation logs, and streaks entirely in the user's browser without requiring a backend database. In a production system, these flows would connect securely to an identity provider and database backend with HttpOnly session cookies.

---

## 🌱 Climate Impact Factors Used

| Category | Emission Factor | Source |
|---------|----------------|--------|
| Petrol car | 0.21 kg CO₂/km | DEFRA 2023 |
| Electric car | 0.05 kg CO₂/km | IEA 2023 |
| Short-haul flight | 255 kg CO₂/trip | ICAO |
| Long-haul flight | 1,100 kg CO₂/trip | ICAO |
| Grid electricity | 0.233 kg CO₂/kWh | IEA World |
| Beef | 27 kg CO₂/kg | Poore & Nemecek 2018 |
| Natural Gas | 2.04 kg CO₂/m³ | IPCC AR6 |

---

## 📋 License

MIT License — see [LICENSE](./LICENSE)

---

*Built with ❤️ for #BuildwithAI #PromptWarsVirtual #Challenge3 — @googlefordevelopers @hack2skill*
