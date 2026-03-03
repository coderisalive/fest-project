import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Prevent re-initialization in React Strict Mode / Vite HMR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Initialize Firestore and force long polling 
// (Bypasses ERR_BLOCKED_BY_CLIENT issues caused by browser extensions/adblockers intercepting WebSockets)
let dbInstance;
try {
    dbInstance = initializeFirestore(app, {
        experimentalForceLongPolling: true,
    });
} catch (e) {
    // If it was already initialized, get the existing instance
    dbInstance = getFirestore(app);
}

export const db = dbInstance;
