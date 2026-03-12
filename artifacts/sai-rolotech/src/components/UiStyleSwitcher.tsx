import { useUiStyle, type UiStyleOption } from "@/hooks/use-ui-style";
import { Check, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export default function UiStyleSwitcher() {
  const { uiStyle, setUiStyle, styles } = useUiStyle();

  return (
    <div data-testid="ui-style-switcher">
      <div className="flex items-center gap-2 mb-3">
        <Smartphone className="w-4 h-4 text-primary" />
        <p className="text-xs font-semibold">UI Style</p>
      </div>
      <div className="flex gap-3">
        {styles.map((s: UiStyleOption) => {
          const isActive = uiStyle === s.id;
          const Icon = s.id === "android" ? AndroidIcon : AppleIcon;
          return (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => setUiStyle(s.id)}
              className={`flex-1 relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                isActive
                  ? "border-primary bg-primary/8 shadow-sm"
                  : "border-border hover:border-primary/30 bg-card/50"
              }`}
              data-testid={`ui-style-option-${s.id}`}
            >
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-primary" />
                </motion.div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className={`text-xs font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                  {s.name}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{s.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
