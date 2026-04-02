"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { KeyRound, Eye, EyeOff, ExternalLink, X, Check, AlertTriangle } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose?: () => void;
  isUpdate?: boolean;
}

function validateKey(key: string): string | null {
  const trimmed = key.trim();
  if (!trimmed) return "API key cannot be empty.";
  if (!trimmed.startsWith("sk-")) return 'OpenAI keys start with "sk-". Double-check your key.';
  if (trimmed.length < 40) return "Key looks too short — please paste the full key.";
  return null;
}

export function ApiKeyModal({ isOpen, onSave, onClose, isUpdate = false }: ApiKeyModalProps) {
  const [value, setValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue("");
      setError(null);
      setSaved(false);
      setShowKey(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  const handleSave = () => {
    const validationError = validateKey(value);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaved(true);
    setTimeout(() => onSave(value.trim()), 500);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape" && onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="api-key-modal-title">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <KeyRound size={18} className="text-indigo-400" />
            </div>
            <div>
              <h2 id="api-key-modal-title" className="text-base font-semibold text-zinc-100">
                {isUpdate ? "Update API Key" : "Enter your OpenAI API Key"}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {isUpdate
                  ? "Replace the key stored in your browser."
                  : "Required to send messages. Stored locally in your browser only."}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="px-6 pb-6 space-y-4">
          {!isUpdate && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-700/30">
              <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-amber-300/80 leading-relaxed">
                No API key found in the server environment. Add your key below — it will be saved to{" "}
                <code className="font-mono bg-amber-950/50 px-1 rounded">localStorage</code> and sent securely with each request.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="api-key-input" className="text-xs font-medium text-zinc-400">
              OpenAI API Key
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <input
                id="api-key-input"
                ref={inputRef}
                type={showKey ? "text" : "password"}
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(null); }}
                onKeyDown={handleKeyDown}
                placeholder="sk-proj-..."
                className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-600 text-sm outline-none font-mono tracking-wider"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? "Hide key" : "Show key"}
                className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {error && (
              <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5 px-1">
                <AlertTriangle size={11} aria-hidden="true" />
                {error}
              </p>
            )}
          </div>

          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors w-fit"
          >
            <ExternalLink size={11} aria-hidden="true" />
            Get a free API key at platform.openai.com
          </a>

          <div className="flex gap-2 pt-1">
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition-all border border-zinc-700"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saved || !value.trim()}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${saved
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
            >
              {saved ? (
                <>
                  <Check size={15} />
                  Saved!
                </>
              ) : (
                isUpdate ? "Update Key" : "Save & Continue"
              )}
            </button>
          </div>

          <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
            Your key is stored only in your browser&apos;s localStorage and is never logged or shared.
          </p>
        </div>
      </div>
    </div>
  );
}
