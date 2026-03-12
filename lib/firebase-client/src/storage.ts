import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, type FirebaseStorage } from "firebase/storage";
import type { FirebaseApp } from "firebase/app";

export function initStorage(app: FirebaseApp): FirebaseStorage {
  return getStorage(app);
}

export async function uploadFile(
  storage: FirebaseStorage,
  path: string,
  data: Uint8Array | Blob | ArrayBuffer,
  contentType?: string,
): Promise<string> {
  const storageRef = ref(storage, path);
  const metadata = contentType ? { contentType } : undefined;
  await uploadBytes(storageRef, data, metadata);
  return getDownloadURL(storageRef);
}

export async function getFileUrl(storage: FirebaseStorage, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

export async function deleteFile(storage: FirebaseStorage, path: string): Promise<void> {
  const storageRef = ref(storage, path);
  return deleteObject(storageRef);
}

export { getStorage, ref, uploadBytes, getDownloadURL, deleteObject };
export type { FirebaseStorage };
