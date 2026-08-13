import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";
import { OMState } from "../types";

interface OMLivingSymbolProps {
  state?: OMState;
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  showTooltip?: boolean;
}

export const OMLivingSymbol: React.FC<OMLivingSymbolProps> = ({
  state = "ready",
  size = "md",
  onClick,
  showTooltip = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Dimension mapping for central symbol and container
  const containerSizes = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  }[size];

  const ringSizes = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  }[size];

  const dimensions = {
    sm: "w-8 h-8 text-base",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl",
    xl: "w-24 h-24 text-5xl",
  }[size];

  const particleRadius = {
    sm: 18,
    md: 28,
    lg: 36,
    xl: 56,
  }[size];

  // Config per state in state machine
  const stateConfig = {
    resting: {
      symbolColor: "text-amber-200/60",
      dropShadow: "drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]",
      auraClass: "bg-amber-600/20 blur-md opacity-30",
      badgeBg: "bg-slate-500 border-slate-400",
      badgeText: "Resting",
      tooltipText: "OM is resting — Click or say 'OM' to wake",
      particleCount: 1,
    },
    waking: {
      symbolColor: "text-amber-300 font-bold",
      dropShadow: "drop-shadow-[0_0_18px_rgba(245,158,11,0.95)]",
      auraClass: "bg-gradient-to-r from-amber-400 to-yellow-300 blur-xl opacity-80",
      badgeBg: "bg-amber-400 border-amber-300 shadow-amber-400/50",
      badgeText: "Waking",
      tooltipText: "OM is waking up...",
      particleCount: 3,
    },
    ready: {
      symbolColor: "text-amber-400",
      dropShadow: "drop-shadow-[0_0_12px_rgba(214,165,58,0.8)]",
      auraClass: "bg-amber-500/35 blur-lg opacity-60",
      badgeBg: "bg-emerald-500 border-emerald-400 shadow-emerald-500/40",
      badgeText: "Ready",
      tooltipText: "OM is ready — Ready for tasks",
      particleCount: 3,
    },
    thinking: {
      symbolColor: "text-purple-300 font-bold",
      dropShadow: "drop-shadow-[0_0_20px_rgba(168,85,247,0.9)]",
      auraClass: "bg-gradient-to-r from-purple-600 via-amber-500 to-cyan-500 blur-xl opacity-80",
      badgeBg: "bg-purple-500 border-purple-300 shadow-purple-500/50",
      badgeText: "Thinking",
      tooltipText: "OM is processing your request...",
      particleCount: 6,
    },
  }[state];

  // Motion Variants for State Transitions
  const auraVariants: Variants = {
    resting: {
      scale: [1, 1.05, 1],
      opacity: [0.3, 0.45, 0.3],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
    waking: {
      scale: [0.9, 1.3, 1],
      opacity: [0.5, 0.9, 0.6],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
    ready: {
      scale: [1, 1.08, 1],
      opacity: [0.4, 0.7, 0.4],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
    thinking: {
      scale: [1, 1.18, 1],
      opacity: [0.6, 0.9, 0.6],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const coreSymbolVariants: Variants = {
    resting: {
      scale: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    waking: {
      scale: [1, 1.25, 1.05],
      rotate: [0, -5, 5, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
    ready: {
      scale: [1, 1.06, 1],
      y: [0, -1.8, 0],
      transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
    },
    thinking: {
      scale: [1, 1.14, 1],
      y: [0, -2.5, 0],
      transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const outerRingVariants: Variants = {
    resting: { rotate: 360, transition: { duration: 28, repeat: Infinity, ease: "linear" } },
    waking: { rotate: 360, transition: { duration: 4, repeat: Infinity, ease: "linear" } },
    ready: { rotate: 360, transition: { duration: 14, repeat: Infinity, ease: "linear" } },
    thinking: { rotate: 360, transition: { duration: 2.5, repeat: Infinity, ease: "linear" } },
  };

  const innerRingVariants: Variants = {
    resting: { rotate: -360, transition: { duration: 32, repeat: Infinity, ease: "linear" } },
    waking: { rotate: -360, transition: { duration: 5, repeat: Infinity, ease: "linear" } },
    ready: { rotate: -360, transition: { duration: 18, repeat: Infinity, ease: "linear" } },
    thinking: { rotate: -360, transition: { duration: 3, repeat: Infinity, ease: "linear" } },
  };

  // Orbital particle angles
  const particleAngles = Array.from({ length: stateConfig.particleCount }).map(
    (_, i) => (360 / stateConfig.particleCount) * i
  );

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`OM living intelligence symbol. State: ${stateConfig.badgeText}`}
    >
      <div className={`relative flex items-center justify-center ${containerSizes}`}>
        {/* 1. Outer Ambient Aura Field */}
        <motion.div
          className={`absolute rounded-full pointer-events-none ${ringSizes} ${stateConfig.auraClass}`}
          variants={auraVariants}
          animate={shouldReduceMotion ? { scale: 1, opacity: 0.4 } : state}
        />

        {/* 2. Expanding Energy Flare Ring (for Waking state) */}
        {state === "waking" && !shouldReduceMotion && (
          <motion.div
            className={`absolute rounded-full border-2 border-amber-400 pointer-events-none ${ringSizes}`}
            initial={{ scale: 0.7, opacity: 0.9 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* 3. Outer Sacred Geometry Ring */}
        <motion.div
          className={`absolute rounded-full border border-amber-500/40 border-dashed pointer-events-none ${ringSizes}`}
          variants={outerRingVariants}
          animate={shouldReduceMotion ? { rotate: 0 } : state}
        />

        {/* 4. Inner Concentric Reverse Geometry Ring */}
        <motion.div
          className={`absolute rounded-full border border-amber-300/30 pointer-events-none ${ringSizes}`}
          style={{ scale: 0.82 }}
          variants={innerRingVariants}
          animate={shouldReduceMotion ? { rotate: 0 } : state}
        />

        {/* 5. Thinking Wave Geometry Ring */}
        {state === "thinking" && !shouldReduceMotion && (
          <motion.div
            className={`absolute rounded-full border border-purple-400/50 pointer-events-none ${ringSizes}`}
            animate={{
              scale: [0.85, 1.08, 0.85],
              rotate: [0, 180, 360],
              borderColor: ["rgba(168, 85, 247, 0.5)", "rgba(245, 158, 11, 0.6)", "rgba(168, 85, 247, 0.5)"],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* 6. Orbital Energy Particles */}
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{
              duration: state === "thinking" ? 3 : state === "waking" ? 5 : 18,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {particleAngles.map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * particleRadius;
              const y = Math.sin(rad) * particleRadius;

              return (
                <motion.div
                  key={idx}
                  className={`absolute w-1.5 h-1.5 rounded-full ${
                    state === "thinking"
                      ? "bg-purple-300 shadow-[0_0_8px_#c084fc]"
                      : state === "waking"
                      ? "bg-amber-300 shadow-[0_0_8px_#f59e0b]"
                      : "bg-amber-400/80 shadow-[0_0_6px_#fbbf24]"
                  }`}
                  style={{
                    left: `calc(50% + ${x}px - 3px)`,
                    top: `calc(50% + ${y}px - 3px)`,
                  }}
                  animate={
                    state === "thinking"
                      ? { scale: [0.8, 1.4, 0.8], opacity: [0.5, 1, 0.5] }
                      : { scale: [1, 1.2, 1] }
                  }
                  transition={{
                    duration: 1 + idx * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
          </motion.div>
        )}

        {/* 7. Central Living ॐ Glyph Core */}
        <motion.div
          className={`relative z-10 flex items-center justify-center font-serif ${dimensions} ${stateConfig.symbolColor} ${stateConfig.dropShadow}`}
          variants={coreSymbolVariants}
          animate={shouldReduceMotion ? { scale: 1 } : state}
        >
          ॐ
        </motion.div>

        {/* 8. State Status Badge Dot */}
        <motion.div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border shadow-md ${stateConfig.badgeBg}`}
          animate={
            shouldReduceMotion
              ? {}
              : state === "waking" || state === "thinking"
              ? { scale: [1, 1.3, 1] }
              : { scale: [1, 1.1, 1] }
          }
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          title={`Status: ${stateConfig.badgeText}`}
        />
      </div>

      {/* 9. Interactive Tooltip */}
      <AnimatePresence>
        {showTooltip && (isHovered || state === "ready" || state === "thinking") && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -bottom-10 -translate-x-1/2 px-3 py-1 bg-slate-900/95 text-slate-100 text-[11px] font-mono rounded-lg border border-amber-500/30 shadow-xl whitespace-nowrap z-50 pointer-events-none"
          >
            {stateConfig.tooltipText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

