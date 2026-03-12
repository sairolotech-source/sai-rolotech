import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
  type UserCredential,
} from "firebase/auth";
import type { FirebaseApp } from "firebase/app";

export type { FirebaseUser, UserCredential };

export function initAuth(app: FirebaseApp): Auth {
  return getAuth(app);
}

export async function firebaseLogin(auth: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function firebaseRegister(auth: Auth, email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function firebaseLogout(auth: Auth): Promise<void> {
  return signOut(auth);
}

export function onFirebaseAuthChanged(auth: Auth, callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function getIdToken(user: FirebaseUser): Promise<string> {
  return user.getIdToken();
}
