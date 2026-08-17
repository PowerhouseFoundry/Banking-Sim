import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

// The college/network connection is interrupting Firestore's normal
// WebChannel transport. Force long polling and use a shorter timeout
// so each request completes before the network's roughly 15 second cutoff.
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalLongPollingOptions: {
    timeoutSeconds: 10
  }
});

export async function ensureFirebaseReady() {
  return db;
}

export { db };
