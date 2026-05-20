"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MomentumRing } from "./MomentumRing";
import { MomentumDrawer } from "./MomentumDrawer";
import { DeltaPill } from "./DeltaPill";

interface FounderCardProps {
  id: string;
  name: string;
  handle: string;
  headline: string;
  avatar?: string;
  momentumScore: number;
  revenueDelta?: string;
  userDelta?: string;
  tractionDelta?: string;
  sparklineData?: number[];
  tags?: string[];
  type: "dreamer" | "reality";
  onInvest?: () => void;
  onMessage?: () => void;
}

export function FounderCard({
  name, handle, headline, avatar, momentumScore, revenueDelta, userDelta, tractionDelta,
  sparklineData, tags, type, onInvest, onMessage,
}: FounderCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="surface-elevated"
      >
        <div className="p-5">
          {/* Row 1: Avatar, name, momentum ring */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-violet/40 via-emerald/30 to-cyan/30">
                  <div className="w-full h-full rounded-full bg-onyx-900 flex items-center justify-center overflow-hidden">
                    {avatar && !imgError ? (
                      <img src={avatar} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                    ) : (
                      <span className="text-sm font-bold" style={{ color: type === "reality" ? "#34d399" : "#a5b4fc" }}>
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-subhead text-white truncate">{name}</h3>
                  <span className="text-caption text-muted">@{handle}</span>
                  <span className={`text-micro px-1.5 py-0.5 rounded font-semibold uppercase ${
                    type === "reality" ? "bg-emerald-muted text-emerald" : "bg-violet-muted text-violet-light"
                  }`}>
                    {type}
                  </span>
                </div>
                <p className="text-body text-muted truncate mt-0.5">{headline}</p>
              </div>
            </div>
            <MomentumRing score={momentumScore} size="sm" onClick={() => setDrawerOpen(true)} />
          </div>

          {/* Row 2: Delta pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {revenueDelta && (
              <DeltaPill label="Revenue" delta={revenueDelta} trend="up" sparklineData={sparklineData || [0.2, 0.4, 0.3, 0.6, 0.8, 0.7, 0.9]} />
            )}
            {userDelta && (
              <DeltaPill label="Users" delta={userDelta} trend="up" sparklineData={[0.1, 0.3, 0.5, 0.4, 0.7, 0.6, 0.85]} />
            )}
            {tractionDelta && (
              <DeltaPill label="Traction" delta={tractionDelta} trend="up" sparklineColor="#a5b4fc" />
            )}
          </div>

          {/* Row 3: Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.map((tag) => (
                <span key={tag} className="text-micro px-2 py-0.5 rounded-full bg-onyx-700/40 text-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Row 4: Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-onyx-700/50">
            <button
              onClick={onMessage}
              className="btn-secondary btn-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              Message
            </button>
            <button
              onClick={onInvest}
              className="btn-primary btn-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Invest
            </button>
            <button className="btn-ghost btn-icon ml-auto">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      <MomentumDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} score={momentumScore} />
    </>
  );
}
