export const GOOGLE_CONFIG = {
  GA4_MEASUREMENT_ID: import.meta.env.VITE_GA4_MEASUREMENT_ID || "G-XXXXXXXXXX",
  GTM_CONTAINER_ID: import.meta.env.VITE_GTM_CONTAINER_ID || "GTM-XXXXXXX",
  SEARCH_CONSOLE_VERIFICATION: import.meta.env.VITE_SEARCH_CONSOLE_VERIFICATION || "PASTE_YOUR_GOOGLE_SITE_VERIFICATION_CODE_HERE",
};

// ─── HOW TO CONFIGURE ───
// All Google service IDs are configured via environment variables (VITE_ prefixed).
// Edit the .env file in artifacts/sai-rolotech/ to set your actual IDs:
//
//   VITE_GA4_MEASUREMENT_ID=G-YOUR_ACTUAL_ID
//   VITE_GTM_CONTAINER_ID=GTM-YOUR_ACTUAL_ID
//   VITE_SEARCH_CONSOLE_VERIFICATION=your_verification_code
//
// These env vars are used both here (for JS runtime) and in index.html (for static script tags).
// There is ONE source of truth: the .env file.
