import { useTheme, type ThemeOption } from "@/hooks/use-theme";
import { Check, Palette } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div data-testid="theme-switcher">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-primary" />
        <p className="text-xs font-semibold">App Theme</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {themes.map((t: ThemeOption) => {
          const isActive = theme === t.id;
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(t.id)}
              className="flex flex-col items-center gap-1.5 group"
              data-testid={`theme-option-${t.id}`}
            >
              <div
                className={`w-11 h-11 rounded-full relative overflow-hidden border-2 transition-all ${
                  isActive
                    ? "border-primary ring-2 ring-primary/30 scale-110"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${t.previewColors[0]} 50%, ${t.previewColors[1]} 50%)`,
                  }}
                />
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/25"
                  >
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  </motion.div>
                )}
              </div>
              <span
                className={`text-[10px] font-medium leading-tight text-center max-w-[52px] ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {t.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
