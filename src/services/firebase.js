import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCYBv6Gg9Ji6qHLAqDPU5T_ydxgXgxJ65o",
  authDomain: "plc-bank-6e424.firebaseapp.com",
  projectId: "plc-bank-6e424",
  storageBucket: "plc-bank-6e424.firebasestorage.app",
  messagingSenderId: "70691237554",
  appId: "1:70691237554:web:ad2f60b856f10deb45e3ab"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 👇 THIS FIXES YOUR ERROR
export async function ensureFirebaseReady() {
  return db;
}

export { db };