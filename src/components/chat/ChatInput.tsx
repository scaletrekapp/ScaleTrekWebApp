"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MilestoneCardComposer } from "./MilestoneCard";

interface ChatInputProps {
  onSend: (content: string) => void;
  onInsertMilestone: (milestone: { title: string; description: string; type: "dreamer" | "reality" }) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, onInsertMilestone, placeholder = "Type an encrypted message...", disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showMilestonePicker, setShowMilestonePicker] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  };

  return (
    <div className="border-t border-onyx-700/60 bg-onyx-900/95 backdrop-blur-xl px-4 sm:px-6 py-3">
      <AnimatePresence>
        {showMilestonePicker && (
          <motion.div
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-2"
          >
            <MilestoneCardComposer
              onInsert={(m) => {
                onInsertMilestone(m);
                setShowMilestonePicker(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <button
          onClick={() => setShowMilestonePicker(!showMilestonePicker)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
            showMilestonePicker
              ? "bg-violet/20 text-violet-light border border-violet/30"
              : "text-slate-muted hover:text-white hover:bg-onyx-700/40 border border-onyx-700/60"
          }`}
          title="Add milestone card"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); handleInput(); }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-2.5 rounded-xl bg-onyx-800 border border-onyx-700/60 text-white text-sm placeholder:text-slate-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-violet/30 transition-all min-h-[38px] max-h-[120px]"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
            input.trim() && !disabled
              ? "bg-violet text-white hover:brightness-110 shadow-lg shadow-violet/20"
              : "bg-onyx-800 text-slate-muted border border-onyx-700/60 cursor-not-allowed"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
