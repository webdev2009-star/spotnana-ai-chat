"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useApiKey } from "@/hooks/useApiKey";
import { MessageBubble } from "@/components/MessageBubble";
import { PromptInput } from "@/components/PromptInput";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Sidebar } from "@/components/Sidebar";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { Message } from "@/types";
import { Menu, Eraser, Sparkles, KeyRound } from "lucide-react";

const SUGGESTIONS = [
  "Explain React Server Components",
  "Write a TypeScript utility type",
  "Best practices for REST API design",
  "Summarize a complex topic for me",
] as const;

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { apiKey, saveApiKey, clearApiKey, isHydrated } = useApiKey();

  const {
    sessions,
    activeSession,
    activeSessionId,
    startNewSession,
    setActiveSessionId,
    addMessage,
    clearActiveSession,
    deleteSession,
    clearAllHistory,
  } = useChatHistory();

  const messages: Message[] = activeSession?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!activeSessionId && sessions.length === 0) {
      startNewSession();
    }
  }, [activeSessionId, sessions.length, startNewSession]);

  // Show key modal on first load if no key is present
  useEffect(() => {
    if (isHydrated && !apiKey) {
      setIsUpdatingKey(false);
      setKeyModalOpen(true);
    }
  }, [isHydrated, apiKey]);

  const handleSaveKey = useCallback((key: string) => {
    saveApiKey(key);
    setKeyModalOpen(false);
  }, [saveApiKey]);

  const handleOpenUpdateKey = useCallback(() => {
    setIsUpdatingKey(true);
    setKeyModalOpen(true);
  }, []);

  const handleNewSession = useCallback(() => {
    startNewSession();
    setSidebarOpen(false);
  }, [startNewSession]);

  const handleSubmit = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;

    if (!apiKey) {
      setIsUpdatingKey(false);
      setKeyModalOpen(true);
      return;
    }

    const sessionId = activeSessionId ?? startNewSession();

    const context: Message[] = [
      ...(activeSession?.messages.filter((m) => m.role !== "error") ?? []),
      { id: "temp", role: "user", content: trimmed, timestamp: Date.now() },
    ];

    setPrompt("");
    setIsLoading(true);
    addMessage(sessionId, { role: "user", content: trimmed });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openai-api-key": apiKey,
        },
        body: JSON.stringify({ messages: context }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (data.code === "invalid_api_key" || data.code === "missing_api_key") {
          clearApiKey();
          setIsUpdatingKey(false);
          setKeyModalOpen(true);
        }
        addMessage(sessionId, {
          role: "error",
          content: data.error ?? "An unexpected error occurred. Please try again.",
        });
      } else {
        addMessage(sessionId, { role: "assistant", content: data.reply });
      }
    } catch {
      addMessage(sessionId, {
        role: "error",
        content: "Network error — please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, apiKey, activeSessionId, activeSession, startNewSession, addMessage, clearApiKey]);

  const isEmpty = messages.length === 0;

  if (!isHydrated) {
    return (
      <div className="flex h-screen bg-zinc-950 items-center justify-center">
        <div className="flex gap-1" aria-label="Loading" role="status">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <ApiKeyModal
        isOpen={keyModalOpen}
        onSave={handleSaveKey}
        onClose={apiKey ? () => setKeyModalOpen(false) : undefined}
        isUpdate={isUpdatingKey}
      />

      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={deleteSession}
        onClearAll={clearAllHistory}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full">
        <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-zinc-100 truncate max-w-[200px] sm:max-w-none">
                {activeSession?.title ?? "New conversation"}
              </h1>
              <p className="text-[10px] text-zinc-500">
                {messages.length > 0
                  ? `${messages.length} message${messages.length !== 1 ? "s" : ""}`
                  : "No messages yet"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenUpdateKey}
              aria-label="Manage API key"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border
                ${apiKey
                  ? "text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/20 hover:border-emerald-700/60"
                  : "text-amber-400 border-amber-800/60 hover:bg-amber-900/20 hover:border-amber-700/60 animate-pulse"
                }`}
            >
              <KeyRound size={12} aria-hidden="true" />
              <span className="hidden sm:inline">
                {apiKey ? "API key set" : "Set API key"}
              </span>
            </button>

            {!isEmpty && (
              <button
                onClick={clearActiveSession}
                disabled={isLoading}
                aria-label="Clear current conversation"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800
                  text-xs font-medium transition-all border border-transparent hover:border-zinc-700
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Eraser size={13} aria-hidden="true" />
                Clear
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                <Sparkles size={28} className="text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-zinc-100 mb-2">
                  How can I help you today?
                </h2>
                <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
                  Ask me anything — I can help with coding, writing, analysis, math, and much more.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md" role="list" aria-label="Suggested prompts">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    role="listitem"
                    onClick={() => setPrompt(suggestion)}
                    className="px-3 py-2.5 rounded-xl text-left text-xs text-zinc-400
                      bg-zinc-800/60 border border-zinc-700/50 hover:border-indigo-500/40
                      hover:bg-zinc-800 hover:text-zinc-200 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5" role="log" aria-label="Conversation" aria-live="polite">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex items-start gap-3" role="status" aria-label="Waiting for response">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center opacity-80" aria-hidden="true" />
                  <LoadingSpinner />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm px-4 py-4">
          <div className="max-w-3xl mx-auto space-y-2">
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
            <p className="text-center text-[10px] text-zinc-600">
              Press{" "}
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              to send ·{" "}
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">
                Shift+Enter
              </kbd>{" "}
              for new line
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
