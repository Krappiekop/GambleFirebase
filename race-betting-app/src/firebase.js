// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDRSsmM1lOYoCpXUosHbSZx0QFCNM-OdKs",
  authDomain: "zwaluwe-gamble.firebaseapp.com",
  databaseURL: "https://zwaluwe-gamble-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zwaluwe-gamble",
  storageBucket: "zwaluwe-gamble.appspot.com",
  messagingSenderId: "541875636547",
  appId: "1:541875636547:web:a4c11e0f7c367c7cfd07f6",
  measurementId: "G-E0NVV4J5FZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, firestore, analytics };
