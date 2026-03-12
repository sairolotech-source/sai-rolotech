import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./hooks/use-theme";
import { UiStyleProvider } from "./hooks/use-ui-style";
import { initializeGoogleServices } from "./lib/google-analytics";
import { initializeFirebasePerformance, initializeRemoteConfig } from "./lib/firebase-services";
import "./index.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

initializeGoogleServices();
initializeFirebasePerformance();
initializeRemoteConfig().catch(() => {});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <UiStyleProvider>
      <App />
    </UiStyleProvider>
  </ThemeProvider>
);
