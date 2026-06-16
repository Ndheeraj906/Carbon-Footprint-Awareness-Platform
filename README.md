# EcoTrack - Carbon Footprint Awareness Platform

## Final Hackathon Submission

EcoTrack is an enterprise-grade Carbon Footprint Awareness Platform built to solve the modern sustainability challenge. It features highly accurate carbon calculation algorithms, personalized AI-logic recommendations, and engaging gamification metrics (like the Sustainability EcoScore and Achievement Badges). 

Designed for **Google Cloud Run**, it boasts a stateless architecture using React, Express, and Firestore, delivering an exceptionally fast, responsive, and secure experience.

---

## 🏆 Key Achievements & Hackathon Criteria Met

- **100% Problem Statement Alignment**: Complete tracking, dashboarding, and goal-setting for Carbon Awareness.
- **WOW Features**: Sustainability Score Engine, Personalized Actionable Recommendations, and an Achievement/Badge System.
- **Technical Excellence**: Monolithic Docker container, Google Cloud Run ready, Firestore Integration.
- **User Experience (UX)**: Premium glass-morphism UI, Dark Mode, responsive design, and smooth animations (Lighthouse > 95 target).
- **Accessibility**: Keyboard navigable, ARIA compliant, WCAG 2.1 AA contrast ratios.

---

## 📁 Architecture & Deliverables

All required Hackathon deliverables are located in the `docs/` folder:

1. [Requirement Analysis & User Personas](./docs/Requirements.md)
2. [Architecture Diagram & Database Schema](./docs/Architecture.md)
3. [Security & Accessibility Documentation](./docs/Security_A11y.md)
4. [Judge Presentation Notes & Demo Guide](./docs/Demo_Guide.md)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v20+)
- Firebase Project with Firestore & Google Auth enabled

### Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```
3. Set up environment variables. Create `.env` files in `client/` and `server/` using the `.env.example` templates.
4. Run the full stack concurrently:
   ```bash
   npm run dev
   ```

### Seeding Data for Demo
Run the seed script to instantly populate Firestore with mock data for the Judges:
```bash
cd server
npm run start:seed
```

---

## ☁️ Deployment to Google Cloud Run

This application is built with a single monolithic `Dockerfile` that packages the built React app and serves it securely through the Express API, making Cloud Run deployment incredibly simple.

1. Ensure GitHub Secrets are set (`GCP_PROJECT_ID`, `GCP_CREDENTIALS`).
2. Push to the `main` branch.
3. The GitHub Action will automatically build and deploy the container to Cloud Run.
