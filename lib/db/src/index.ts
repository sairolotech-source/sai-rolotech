import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

let serviceAccount: any = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON");
  }
}

if (getApps().length === 0) {
  if (serviceAccount) {
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET
      || process.env.VITE_FIREBASE_STORAGE_BUCKET
      || `${serviceAccount.project_id}.appspot.com`;
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket,
    });
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not set. Firebase will not be initialized.");
    initializeApp();
  }
}

export const firestore = getFirestore();
export const firebaseAuth = getAuth();
export const firebaseStorage = getStorage();

export const db = firestore;

export { FieldValue } from "firebase-admin/firestore";

export * from "./schema";
