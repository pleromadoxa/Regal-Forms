
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBiSJBegzB8cPTFzMX6eGC1rBqLSUhIoB8",
  authDomain: "regal-forms.firebaseapp.com",
  projectId: "regal-forms",
  storageBucket: "regal-forms.firebasestorage.app",
  messagingSenderId: "316221096420",
  appId: "1:316221096420:web:5beb9b3e6e7e32a57447f1",
  measurementId: "G-G76J2BXD14"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// Increase max upload retry time to prevent "Max retry time for operation exceeded" errors
// on slow connections or large files.
storage.maxUploadRetryTime = 600000; // 10 minutes

// Initialize Firestore with settings to ignore undefined properties
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
});

const googleProvider = new GoogleAuthProvider();

let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
    console.warn("Analytics not supported:", err);
});

export { app, auth, googleProvider, analytics, db, storage };
