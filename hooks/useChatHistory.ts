"use client";

import { useState, useEffect, useCallback } from "react";
import { Message, ChatSession } from "@/types";

const STORAGE_KEY = "spotnana_chat_history";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function deriveTitle(content: string): string {
  return content.length > 40 ? content.slice(0, 40).trimEnd() + "…" : content;
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        setSessions(parsed);
        if (parsed.length > 0) setActiveSessionId(parsed[0].id);
      }
    } catch {
      // Corrupt storage — start fresh
    }
  }, []);

  useEffect(() => {
    if (sessions.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // localStorage quota exceeded — skip persistence silently
    }
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  const startNewSession = useCallback((): string => {
    const id = generateId();
    const session: ChatSession = {
      id,
      messages: [],
      createdAt: Date.now(),
      title: "New conversation",
    };
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(id);
    return id;
  }, []);

  const addMessage = useCallback(
    (sessionId: string, message: Omit<Message, "id" | "timestamp">) => {
      const newMessage: Message = {
        ...message,
        id: generateId(),
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const updatedMessages = [...s.messages, newMessage];
          const title =
            s.messages.length === 0 && message.role === "user"
              ? deriveTitle(message.content)
              : s.title;
          return { ...s, messages: updatedMessages, title };
        })
      );
      return newMessage;
    },
    []
  );

  const clearActiveSession = useCallback(() => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [], title: "New conversation" }
          : s
      )
    );
  }, [activeSessionId]);

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== sessionId);
        if (activeSessionId === sessionId) {
          setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
        }
        if (remaining.length === 0) {
          localStorage.removeItem(STORAGE_KEY);
        }
        return remaining;
      });
    },
    [activeSessionId]
  );

  const clearAllHistory = useCallback(() => {
    setSessions([]);
    setActiveSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    sessions,
    activeSession,
    activeSessionId,
    startNewSession,
    setActiveSessionId,
    addMessage,
    clearActiveSession,
    deleteSession,
    clearAllHistory,
  };
}
