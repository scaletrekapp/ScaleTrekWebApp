"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CleanRoomStatus = "none" | "requested" | "granted";

interface CleanRoomTriggerProps {
  status: CleanRoomStatus;
  onRequest?: () => void;
  onGrant?: () => void;
  onRevoke?: () => void;
}

export function CleanRoomTrigger({ status, onRequest, onGrant, onRevoke }: CleanRoomTriggerProps) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    setAnimating(true);
    if (status === "granted") {
      onRevoke?.();
    } else if (status === "requested") {
      onGrant?.();
    } else {
      onRequest?.();
    }
    setTimeout(() => setAnimating(false), 800);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.97 }}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all overflow-hidden ${
          status === "granted"
            ? "bg-emerald/10 border border-emerald/20 text-emerald hover:bg-emerald/15"
            : status === "requested"
            ? "bg-amber/10 border border-amber/20 text-amber hover:bg-amber/15"
            : "bg-violet/10 border border-violet/20 text-violet-light hover:bg-violet/15"
        }`}
      >
        <AnimatePresence mode="wait">
          {animating ? (
            <motion.div
              key="anim"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {status === "granted" ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="static"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {status === "granted" ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ) : status === "requested" ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.5A11.96 11.96 0 016.75 5 11.96 11.96 0 0112 2.25 11.96 11.96 0 0117.25 5 11.96 11.96 0 0112 7.5 11.96 11.96 0 016.75 5zm0 0v.375c0 2.09.852 3.977 2.223 5.328M12 16.5a5.25 5.25 0 015.25 5.25H6.75A5.25 5.25 0 0112 16.5z" />
                </svg>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <span>
          {status === "granted" ? "Clean Room Active" : status === "requested" ? "Access Requested" : "Request Clean Room Access"}
        </span>
      </motion.button>

      {/* Unlock micro-animation overlay */}
      <AnimatePresence>
        {animating && status === "granted" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.15, 0], scale: [0.5, 1.3, 1.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 rounded-xl bg-emerald pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
