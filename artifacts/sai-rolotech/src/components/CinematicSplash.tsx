import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  bg: "#050810",
  blue: "#00d4ff",
  silver: "#c0c8d8",
  gold: "#ffd700",
  blueDim: "rgba(0,212,255,0.15)",
  blueGlow: "rgba(0,212,255,0.4)",
};

const TOTAL_DURATION = 5000;

function GridFloor() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: "600px" }}>
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: "60%",
          transform: "rotateX(60deg)",
          transformOrigin: "bottom center",
          backgroundImage: `
            linear-gradient(${COLORS.blueDim} 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.blueDim} 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          animation: "gridScroll 4s linear infinite",
        }}
      />
    </div>
  );
}

function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-[2px] top-0 will-change-transform"
      style={{
        background: `linear-gradient(90deg, transparent, ${COLORS.blue}, transparent)`,
        boxShadow: `0 0 20px ${COLORS.blue}, 0 0 60px ${COLORS.blueGlow}`,
      }}
      initial={{ y: "20vh" }}
      animate={{ y: "80vh" }}
      transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
    />
  );
}

function Scene1({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GridFloor />
      <ScanLine />
      <motion.p
        className="relative z-10 text-center text-sm tracking-[0.25em] uppercase font-light"
        style={{ color: COLORS.silver }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Engineering the Future of Roll Forming
      </motion.p>
    </motion.div>
  );
}

function EnergyLine({ d, delay }: { d: string; delay: number }) {
  return (
    <motion.path
      d={d}
      stroke={COLORS.blue}
      strokeWidth="1.5"
      fill="none"
      filter="url(#glow)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    />
  );
}

const ENERGY_PATHS = [
  "M0,50 Q80,50 160,100",
  "M320,0 Q160,60 160,100",
  "M320,200 Q240,140 160,100",
  "M0,200 Q80,140 160,100",
  "M0,0 Q80,50 160,100",
  "M320,100 Q240,100 160,100",
  "M160,0 Q160,50 160,100",
  "M160,200 Q160,150 160,100",
  "M60,0 Q110,50 160,100",
  "M260,200 Q210,150 160,100",
  "M40,200 Q100,150 160,100",
  "M280,0 Q220,50 160,100",
];

function Scene2({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg viewBox="0 0 320 200" className="w-[80%] max-w-[400px]" style={{ overflow: "visible" }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {ENERGY_PATHS.map((d, i) => (
          <EnergyLine key={i} d={d} delay={i * 0.05} />
        ))}
      </svg>
    </motion.div>
  );
}

function Scene3({ active }: { active: boolean }) {
  if (!active) return null;
  const parts = [
    { type: "rect", x: 60, y: 80, w: 200, h: 8, delay: 0, label: "frame" },
    { type: "circle", cx: 110, cy: 80, r: 18, delay: 0.15, label: "roller1" },
    { type: "circle", cx: 210, cy: 80, r: 18, delay: 0.3, label: "roller2" },
    { type: "line", x1: 50, y1: 60, x2: 270, y2: 60, delay: 0.45, label: "sheet" },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg viewBox="0 0 320 160" className="w-[80%] max-w-[400px]">
        <defs>
          <filter id="glow3">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {parts.map((p) => {
          if (p.type === "rect") {
            return (
              <motion.rect
                key={p.label}
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                rx={3}
                fill={COLORS.silver}
                filter="url(#glow3)"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: p.delay, duration: 0.25, type: "spring", stiffness: 300 }}
                style={{ transformOrigin: `${p.x!}px ${p.y!}px` }}
              />
            );
          }
          if (p.type === "circle") {
            return (
              <motion.circle
                key={p.label}
                cx={p.cx}
                cy={p.cy}
                r={p.r}
                fill="none"
                stroke={COLORS.blue}
                strokeWidth="2.5"
                filter="url(#glow3)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: p.delay, duration: 0.2, type: "spring", stiffness: 400 }}
                style={{ transformOrigin: `${p.cx}px ${p.cy}px` }}
              />
            );
          }
          return (
            <motion.line
              key={p.label}
              x1={p.x1}
              y1={p.y1}
              x2={p.x2}
              y2={p.y2}
              stroke={COLORS.gold}
              strokeWidth="2"
              strokeDasharray="6 4"
              filter="url(#glow3)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: p.delay, duration: 0.3 }}
            />
          );
        })}
      </svg>
    </motion.div>
  );
}

function Scene4({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg viewBox="0 0 320 80" className="w-[85%] max-w-[420px]">
        <defs>
          <linearGradient id="stripGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={COLORS.gold} />
            <stop offset="50%" stopColor={COLORS.blue} />
            <stop offset="100%" stopColor={COLORS.silver} />
          </linearGradient>
          <filter id="glow4">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.rect
          x="0"
          y="35"
          width="320"
          height="4"
          rx="2"
          fill="url(#stripGrad)"
          filter="url(#glow4)"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ transformOrigin: "0px 37px" }}
        />
        <motion.text
          x="160"
          y="48"
          textAnchor="middle"
          fill={COLORS.silver}
          fontSize="28"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
          letterSpacing="6"
          filter="url(#glow4)"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          SAI ROLOTECH
        </motion.text>
      </svg>
    </motion.div>
  );
}

function SparkBurst() {
  const sparks = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const dist = 60 + Math.random() * 40;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 0.15,
    };
  });

  return (
    <>
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: s.size,
            height: s.size,
            background: COLORS.gold,
            boxShadow: `0 0 6px ${COLORS.gold}`,
            left: "50%",
            top: "50%",
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: s.x, y: s.y, opacity: 0 }}
          transition={{ duration: 0.6, delay: s.delay, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

function Scene5({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SparkBurst />
      <motion.h1
        className="relative z-10 text-3xl sm:text-4xl font-extrabold tracking-[0.2em] text-center"
        style={{
          background: `linear-gradient(135deg, ${COLORS.silver}, #ffffff, ${COLORS.silver}, #8899bb)`,
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmerSweep 2s linear infinite",
          textShadow: "none",
          filter: `drop-shadow(0 0 12px ${COLORS.blueGlow})`,
        }}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
      >
        SAI ROLOTECH
      </motion.h1>
    </motion.div>
  );
}

const INDIA_PATH =
  "M160,20 L175,25 L185,40 L190,55 L200,60 L205,70 L195,85 L200,100 L195,115 L185,125 L180,140 L170,155 L165,170 L155,175 L150,165 L140,170 L135,160 L130,145 L125,135 L120,125 L115,110 L110,95 L115,80 L120,65 L125,55 L130,45 L140,35 L150,25 Z";

const NODES = [
  { cx: 145, cy: 70, label: "Machine Owners" },
  { cx: 180, cy: 110, label: "Suppliers" },
  { cx: 125, cy: 130, label: "Technicians" },
];

function Scene6({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <svg viewBox="90 10 130 180" className="w-[200px] h-[240px]">
          <defs>
            <filter id="glow6">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <motion.path
            d={INDIA_PATH}
            fill="none"
            stroke={COLORS.blue}
            strokeWidth="1.5"
            filter="url(#glow6)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {NODES.map((n, i) => (
            <g key={i}>
              <motion.circle
                cx={n.cx}
                cy={n.cy}
                r="5"
                fill={COLORS.blue}
                filter="url(#glow6)"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.6 + i * 0.15, duration: 0.3 }}
                style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
              />
              <motion.text
                x={n.cx}
                y={n.cy + 14}
                textAnchor="middle"
                fill={COLORS.silver}
                fontSize="6"
                fontFamily="system-ui"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.15 }}
              >
                {n.label}
              </motion.text>
            </g>
          ))}
          {NODES.map((n, i) => {
            const next = NODES[(i + 1) % NODES.length];
            return (
              <motion.line
                key={`line-${i}`}
                x1={n.cx}
                y1={n.cy}
                x2={next.cx}
                y2={next.cy}
                stroke={COLORS.blue}
                strokeWidth="0.8"
                strokeDasharray="3 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1 + i * 0.1 }}
              />
            );
          })}
        </svg>
      </div>
      <motion.p
        className="text-xs tracking-[0.2em] uppercase"
        style={{ color: COLORS.silver }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        The Roll Forming Industry Ecosystem
      </motion.p>
    </motion.div>
  );
}

const PANELS = [
  { icon: "⚙️", label: "Machines" },
  { icon: "📋", label: "Orders" },
  { icon: "🔔", label: "Service Alerts" },
];

function Scene7({ active, onEnter }: { active: boolean; onEnter: () => void }) {
  if (!active) return null;
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-3 sm:gap-4">
        {PANELS.map((p, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-5 sm:px-6 sm:py-6"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
              minWidth: 80,
            }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.12, type: "spring", stiffness: 200, damping: 18 }}
          >
            <span className="text-2xl">{p.icon}</span>
            <span className="text-[10px] sm:text-xs tracking-wider uppercase" style={{ color: COLORS.silver }}>
              {p.label}
            </span>
          </motion.div>
        ))}
      </div>

      <svg viewBox="0 0 40 40" className="w-8 h-8 mt-2" style={{ animation: "spinSlow 6s linear infinite" }}>
        <circle cx="20" cy="20" r="14" fill="none" stroke={COLORS.silver} strokeWidth="1.5" opacity="0.4" />
        <circle cx="20" cy="12" r="3" fill={COLORS.blue} opacity="0.7" />
        <circle cx="20" cy="28" r="3" fill={COLORS.blue} opacity="0.7" />
      </svg>

      <motion.button
        className="mt-2 px-8 py-3 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${COLORS.blue}, #0088cc)`,
          color: "#fff",
          border: "none",
          boxShadow: `0 0 20px ${COLORS.blueGlow}, 0 4px 15px rgba(0,0,0,0.3)`,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${COLORS.blue}` }}
        whileTap={{ scale: 0.97 }}
        onClick={(e) => {
          e.stopPropagation();
          onEnter();
        }}
      >
        Enter SAI ROLOTECH
      </motion.button>
    </motion.div>
  );
}

export default function CinematicSplash({ onComplete }: { onComplete: () => void }) {
  const [scene, setScene] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const dismiss = useCallback(() => {
    if (!dismissed) {
      setDismissed(true);
      onComplete();
    }
  }, [dismissed, onComplete]);

  useEffect(() => {
    const timings = [800, 1500, 2200, 2900, 3500, 4200, TOTAL_DURATION];
    const timers = timings.map((t, i) =>
      setTimeout(() => setScene(i + 1), t)
    );
    const autoEnd = setTimeout(dismiss, TOTAL_DURATION + 1000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(autoEnd);
    };
  }, [dismiss]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden cursor-pointer"
      style={{ background: COLORS.bg }}
      onClick={dismiss}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Cinematic splash animation, tap to skip"
      data-testid="splash-screen"
    >
      <style>{`
        @keyframes gridScroll {
          0% { background-position: 0 0; }
          100% { background-position: 0 60px; }
        }
        @keyframes shimmerSweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <AnimatePresence mode="wait">
        {scene === 0 && <Scene1 key="s1" active />}
        {scene === 1 && <Scene2 key="s2" active />}
        {scene === 2 && <Scene3 key="s3" active />}
        {scene === 3 && <Scene4 key="s4" active />}
        {scene === 4 && <Scene5 key="s5" active />}
        {scene === 5 && <Scene6 key="s6" active />}
        {scene >= 6 && <Scene7 key="s7" active onEnter={dismiss} />}
      </AnimatePresence>
    </motion.div>
  );
}
