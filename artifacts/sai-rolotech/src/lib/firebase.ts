import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "placeholder.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "placeholder.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "0",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "0:0:web:0",
};

const app = initializeApp(firebaseConfig);

let auth: Auth;
let clientFirestore: Firestore;
let clientStorage: FirebaseStorage;

try {
  auth = getAuth(app);
  clientFirestore = getFirestore(app);
  clientStorage = getStorage(app);
} catch (err) {
  console.warn("Firebase client initialization failed:", err);
  auth = getAuth(app);
  clientFirestore = getFirestore(app);
  clientStorage = getStorage(app);
}

export { auth, clientFirestore, clientStorage };
export default app;
