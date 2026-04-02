"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "spotnana_openai_api_key";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setApiKeyState(stored);
    setIsHydrated(true);
  }, []);

  const saveApiKey = (key: string) => {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setApiKeyState(trimmed);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState(null);
  };

  return { apiKey, saveApiKey, clearApiKey, isHydrated };
}
