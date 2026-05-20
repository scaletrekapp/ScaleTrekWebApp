"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterState {
  momentumVelocity: [number, number];
  industrySectors: string[];
  tractionRange: [number, number];
}

interface StartupResult {
  id: string;
  name: string;
  handle: string;
  momentumScore: number;
  sector: string;
  traction: number;
  headline: string;
}

const SECTORS = ["Fintech", "HealthTech", "CleanTech", "EdTech", "SaaS", "E-Commerce", "AgriTech", "DeepTech"];

const MOCK_RESULTS: StartupResult[] = [
  { id: "s1", name: "Youssef Kamal", handle: "youssef_k", momentumScore: 78, sector: "Fintech", traction: 72, headline: "Building Africa's first neobank for SMEs" },
  { id: "s2", name: "Amina Rami", handle: "amina_r", momentumScore: 62, sector: "HealthTech", traction: 45, headline: "Telemedicine platform for rural Morocco" },
  { id: "s3", name: "Karim Ouali", handle: "karim_o", momentumScore: 44, sector: "SaaS", traction: 38, headline: "B2B procurement automation" },
  { id: "s4", name: "Sara Benali", handle: "sara_b", momentumScore: 91, sector: "CleanTech", traction: 88, headline: "Solar microgrids for off-grid communities" },
  { id: "s5", name: "Mehdi Alaoui", handle: "mehdi_a", momentumScore: 55, sector: "EdTech", traction: 51, headline: "AI-powered Arabic literacy platform" },
  { id: "s6", name: "Leila Mansouri", handle: "leila_m", momentumScore: 83, sector: "Fintech", traction: 79, headline: "Islamic fintech for cross-border payments" },
];

function getPulseColor(score: number): string {
  if (score >= 80) return "rgba(52,211,153,0.4)";
  if (score >= 60) return "rgba(6,182,212,0.3)";
  if (score >= 40) return "rgba(245,158,11,0.25)";
  return "rgba(107,114,128,0.2)";
}

function getPulseBorder(score: number): string {
  if (score >= 80) return "border-emerald/40";
  if (score >= 60) return "border-cyan/30";
  if (score >= 40) return "border-amber/30";
  return "border-onyx-700/60";
}

export function FilterMatrix() {
  const [velocity, setVelocity] = useState<[number, number]>([0, 100]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [tractionRange, setTractionRange] = useState<[number, number]>([0, 100]);

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const filtered = MOCK_RESULTS.filter((s) => {
    if (s.momentumScore < velocity[0] || s.momentumScore > velocity[1]) return false;
    if (selectedSectors.length > 0 && !selectedSectors.includes(s.sector)) return false;
    if (s.traction < tractionRange[0] || s.traction > tractionRange[1]) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Multi-axis filter controls */}
      <div className="panel p-4 space-y-4">
        {/* Axis 1: Momentum Velocity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-executive">Momentum Velocity</span>
            <span className="text-[10px] font-mono text-slate-muted">{velocity[0]} – {velocity[1]}</span>
          </div>
          <div className="relative h-8 flex items-center">
            <div className="absolute left-0 right-0 h-1.5 rounded-full bg-gradient-to-r from-slate-subtle via-amber to-emerald" />
            <input
              type="range"
              min={0}
              max={100}
              value={velocity[0]}
              onChange={(e) => setVelocity([Math.min(Number(e.target.value), velocity[1] - 5), velocity[1]])}
              className="absolute left-0 w-full h-1.5 appearance-none bg-transparent pointer-events-auto z-10 cursor-pointer"
              style={{ accentColor: "#6366f1" }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={velocity[1]}
              onChange={(e) => setVelocity([velocity[0], Math.max(Number(e.target.value), velocity[0] + 5)])}
              className="absolute left-0 w-full h-1.5 appearance-none bg-transparent pointer-events-auto z-10 cursor-pointer"
              style={{ accentColor: "#6366f1" }}
            />
          </div>
        </div>

        {/* Axis 2: Industry Sector */}
        <div>
          <p className="text-executive mb-2">Industry Sector</p>
          <div className="flex flex-wrap gap-1.5">
            {SECTORS.map((sector) => {
              const active = selectedSectors.includes(sector);
              return (
                <button
                  key={sector}
                  onClick={() => toggleSector(sector)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    active
                      ? "bg-violet/15 text-violet-light border border-violet/30"
                      : "text-slate-muted border border-onyx-700/60 hover:border-violet/20 hover:text-white"
                  }`}
                >
                  {sector}
                </button>
              );
            })}
          </div>
        </div>

        {/* Axis 3: Verifiable Traction Range */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-executive">Traction Range</span>
            <span className="text-[10px] font-mono text-slate-muted">{tractionRange[0]}% – {tractionRange[1]}%</span>
          </div>
          <div className="relative h-8 flex items-center">
            <div className="absolute left-0 right-0 h-1.5 rounded-full bg-gradient-to-r from-slate-subtle via-cyan to-emerald" />
            <input
              type="range"
              min={0}
              max={100}
              value={tractionRange[0]}
              onChange={(e) => setTractionRange([Math.min(Number(e.target.value), tractionRange[1] - 5), tractionRange[1]])}
              className="absolute left-0 w-full h-1.5 appearance-none bg-transparent pointer-events-auto z-10 cursor-pointer"
              style={{ accentColor: "#14b8a6" }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={tractionRange[1]}
              onChange={(e) => setTractionRange([tractionRange[0], Math.max(Number(e.target.value), tractionRange[0] + 5)])}
              className="absolute left-0 w-full h-1.5 appearance-none bg-transparent pointer-events-auto z-10 cursor-pointer"
              style={{ accentColor: "#14b8a6" }}
            />
          </div>
        </div>
      </div>

      {/* Heatmap grid results */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="panel p-8 text-center"
          >
            <svg className="w-8 h-8 text-slate-subtle mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-xs text-slate-muted">No matching startups</p>
            <p className="text-[10px] text-slate-subtle mt-1">Adjust your filters to discover opportunities</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((startup) => (
              <motion.div
                key={startup.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`panel p-4 border-l-2 ${getPulseBorder(startup.momentumScore)} hover:bg-onyx-700/30 transition-colors cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{startup.name}</h4>
                    <p className="text-[11px] text-slate-muted truncate">@{startup.handle}</p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold font-mono"
                    style={{ backgroundColor: getPulseColor(startup.momentumScore), color: startup.momentumScore >= 80 ? "#34d399" : startup.momentumScore >= 60 ? "#06b6d4" : startup.momentumScore >= 40 ? "#f59e0b" : "#6b7280" }}
                  >
                    {startup.momentumScore}
                  </div>
                </div>
                <p className="text-xs text-slate-muted leading-relaxed line-clamp-2 mb-2">{startup.headline}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-onyx-700/40 text-slate-muted">{startup.sector}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-subtle">Traction</span>
                    <div className="w-16 h-1.5 rounded-full bg-onyx-700/60 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${startup.traction}%`, backgroundColor: startup.traction >= 70 ? "#34d399" : startup.traction >= 40 ? "#06b6d4" : "#f59e0b" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
