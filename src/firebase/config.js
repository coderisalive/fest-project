import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 🔥 HARD FAIL if env vars are missing
if (!firebaseConfig.apiKey) {
    throw new Error(
        'Firebase API key is missing. Check Vercel environment variables.'
    );
}

// Always initialize once in production
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Firestore with long polling
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});
