import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirebaseConfig, type FirebaseClientConfig } from "./config.js";
import { initAuth } from "./auth.js";
import { initFirestore } from "./firestore.js";
import { initStorage } from "./storage.js";

export { getFirebaseConfig } from "./config.js";
export type { FirebaseClientConfig } from "./config.js";
export * from "./auth.js";
export * from "./firestore.js";
export * from "./storage.js";

let _app: FirebaseApp | null = null;

export function initFirebaseApp(config: FirebaseClientConfig): FirebaseApp {
  if (_app) return _app;
  _app = initializeApp(config);
  return _app;
}

export function createFirebaseServices(config: FirebaseClientConfig) {
  const app = initFirebaseApp(config);
  const auth = initAuth(app);
  const firestore = initFirestore(app);
  const storage = initStorage(app);
  return { app, auth, firestore, storage };
}
