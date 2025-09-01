import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

let db = null;
let auth = null;
let firebaseInitialized = false;

try {
    const {
        VITE_FIREBASE_API_KEY,
        VITE_FIREBASE_AUTH_DOMAIN,
        VITE_FIREBASE_PROJECT_ID,
        VITE_FIREBASE_STORAGE_BUCKET,
        VITE_FIREBASE_MESSAGING_SENDER_ID,
        VITE_FIREBASE_APP_ID
    } = import.meta.env;

    if (
        !VITE_FIREBASE_API_KEY ||
        !VITE_FIREBASE_AUTH_DOMAIN ||
        !VITE_FIREBASE_PROJECT_ID ||
        !VITE_FIREBASE_STORAGE_BUCKET ||
        !VITE_FIREBASE_MESSAGING_SENDER_ID ||
        !VITE_FIREBASE_APP_ID
    ) {
        throw new Error('Variables de entorno de Firebase no configuradas correctamente.');
    }

    const firebaseConfig = {
        apiKey: VITE_FIREBASE_API_KEY,
        authDomain: VITE_FIREBASE_AUTH_DOMAIN,
        projectId: VITE_FIREBASE_PROJECT_ID,
        storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: VITE_FIREBASE_APP_ID,
    };

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseInitialized = true;

} catch (error) {
    console.error('Error al inicializar Firebase:', error.message);
};

export { auth, db, firebaseInitialized };