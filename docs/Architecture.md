# Architecture & Database Schema

## System Architecture
This platform utilizes a decoupled but monolithically-deployed architecture to maximize simplicity for Cloud Run deployment while retaining enterprise scalability.

- **Frontend**: React (Vite) + TailwindCSS
- **Backend**: Node.js Express API
- **Database**: Google Cloud Firestore (NoSQL)
- **Deployment**: Google Cloud Run (Single Docker Container)

## Firestore Schema

### Collection: `users`
- `uid` (String) - Firebase Auth UID
- `email` (String)
- `displayName` (String)
- `ecoScore` (Number)
- `createdAt` (Timestamp)

### Collection: `activities`
- `userId` (String)
- `type` (Enum: 'transport', 'diet', 'energy')
- `amount` (Number)
- `co2` (Number) - Calculated emissions in kg
- `date` (Timestamp)

### Collection: `goals`
- `userId` (String)
- `title` (String)
- `target` (Number)
- `progress` (Number)
- `unit` (String)
- `completed` (Boolean)
