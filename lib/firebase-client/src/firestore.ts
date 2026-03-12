import { getFirestore, type Firestore } from "firebase/firestore";
import type { FirebaseApp } from "firebase/app";

export function initFirestore(app: FirebaseApp): Firestore {
  return getFirestore(app);
}

export { getFirestore };
export type { Firestore };
