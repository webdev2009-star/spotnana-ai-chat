"use client";

import { useRef, useEffect, KeyboardEvent } from "react";
import { SendHorizonal } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled,
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) onSubmit();
    }
  };

  const canSubmit = !isLoading && !disabled && value.trim().length > 0;

  return (
    <div className="flex items-end gap-3 p-3 rounded-2xl bg-zinc-800 border border-zinc-700 focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-lg">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything… (Shift+Enter for new line)"
        disabled={isLoading || disabled}
        className="flex-1 resize-none bg-transparent text-zinc-100 placeholder:text-zinc-500 text-sm leading-relaxed outline-none disabled:opacity-50 min-h-[24px] max-h-[180px]"
      />
      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        aria-label="Send message"
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all
          bg-indigo-600 hover:bg-indigo-500 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <SendHorizonal size={16} className="text-white" />
      </button>
    </div>
  );
}
