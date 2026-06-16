const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin (Only if credentials exist)
if (!process.env.FIREBASE_PROJECT_ID) {
  console.error("FIREBASE_PROJECT_ID not set. Please set environment variables to seed Firestore.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
});

const db = admin.firestore();

const seedData = async () => {
  console.log("Seeding Database for Judge Demo...");

  const activities = [
    { userId: "demo-judge", type: "transport", amount: 15, co2: 4.05, date: new Date(Date.now() - 86400000 * 1).toISOString() },
    { userId: "demo-judge", type: "energy", amount: 12, co2: 5.4, date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { userId: "demo-judge", type: "diet", amount: 2, co2: 6.4, date: new Date(Date.now() - 86400000 * 3).toISOString() }
  ];

  const goals = [
    { userId: "demo-judge", title: "Reduce transport emissions by 15%", progress: 8, target: 15, unit: "%", completed: false },
    { userId: "demo-judge", title: "Have 4 plant-based meals this week", progress: 4, target: 4, unit: "meals", completed: true }
  ];

  try {
    for (const act of activities) {
      await db.collection('activities').add(act);
    }
    for (const goal of goals) {
      await db.collection('goals').add(goal);
    }
    console.log("✅ Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

seedData();
