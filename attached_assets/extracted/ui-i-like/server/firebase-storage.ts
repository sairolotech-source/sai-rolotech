import * as admin from "firebase-admin";

let firebaseApp: admin.app.App;

function getApp() {
  if (firebaseApp) return firebaseApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT not configured");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
  });

  console.log(`Firebase initialized for project: ${serviceAccount.project_id}`);
  return firebaseApp;
}

export function getBucket() {
  return getApp().storage().bucket();
}

export const FOLDERS = {
  PRODUCTS: "products",
  POSTS: "posts",
  BANNERS: "banners",
  DOCUMENTS: "documents",
};

export async function uploadFile(
  folder: string,
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const bucket = getBucket();
  const filePath = `${folder}/${fileName}`;
  const file = bucket.file(filePath);

  await file.save(buffer, {
    metadata: { contentType },
    public: true,
  });

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  return publicUrl;
}

export async function deleteFile(folder: string, fileName: string): Promise<void> {
  const bucket = getBucket();
  const filePath = `${folder}/${fileName}`;
  await bucket.file(filePath).delete().catch(() => {});
}

export function initFirebase() {
  try {
    getApp();
    console.log("Firebase Storage ready");
  } catch (e: any) {
    console.warn("Firebase init warning:", e.message);
  }
}
