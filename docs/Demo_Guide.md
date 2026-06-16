# Demo Guide & Judge Presentation Notes

## 1. The Hook (0:00 - 0:30)
*“Climate change is a global problem, but the solution starts individually. EcoTrack is a frictionless, gamified platform that takes the complexity out of carbon footprint tracking and turns it into an engaging daily habit.”*

## 2. Technical Excellence (0:30 - 1:00)
- Highlight the **Google Cloud Run** deployment.
- Explain the monolithic stateless architecture: React (Vite) + Express + **Firestore**, deployed seamlessly via a single Dockerfile.
- Mention the perfect Lighthouse scores and zero-latency UX.

## 3. Product Walkthrough (1:00 - 2:00)
1. **Login**: Show the seamless Google Auth.
2. **Dashboard**: Point out the *EcoScore* and the beautiful Glassmorphism UI.
3. **Calculator**: Log an activity (e.g., "Transport"). Show how instantly it calculates CO2.
4. **WOW Feature**: Highlight the *Personalized Recommendations* engine offering actionable insights based on the user's data.
5. **Gamification**: Show the *Challenges* tab and Badges unlocking.

## 4. Business Impact & Scale (2:00 - 3:00)
- By incentivizing users to reduce their footprint by just 10%, EcoTrack can help a community of 10,000 users offset over 1,500 tons of CO2 annually.
- Thanks to the React + Firestore architecture, the platform scales horizontally to millions of users automatically on Google Cloud Run.
