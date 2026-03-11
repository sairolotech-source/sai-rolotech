import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase credentials not configured. Storage features will be unavailable.");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const BUCKETS = {
  PRODUCTS: "products",
  POSTS: "posts",
  BANNERS: "banners",
  DOCUMENTS: "documents",
};

export async function ensureBuckets() {
  for (const bucket of Object.values(BUCKETS)) {
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
    });
    if (error && !error.message.includes("already exists")) {
      console.warn(`Bucket "${bucket}" creation warning:`, error.message);
    }
  }
  console.log("Supabase storage buckets verified");
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
