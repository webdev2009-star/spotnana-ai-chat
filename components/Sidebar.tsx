"use client";

import { ChatSession } from "@/types";
import { MessageSquarePlus, Trash2, Bot, X } from "lucide-react";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(ts));
}

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearAll,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-30
          bg-zinc-900 border-r border-zinc-800
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Conversation history"
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <span className="font-semibold text-zinc-100 text-sm tracking-wide">AI Chat</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3 border-b border-zinc-800">
          <button
            onClick={onNewSession}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
              bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]
              text-white text-sm font-medium transition-all"
          >
            <MessageSquarePlus size={15} />
            New conversation
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <p className="text-center text-zinc-500 text-xs py-8 px-4">
              No conversations yet. Start one above!
            </p>
          ) : (
            <ul className="space-y-1" role="list">
              {sessions.map((session) => {
                const isActive = activeSessionId === session.id;
                return (
                  <li key={session.id} className="group flex items-center gap-1 rounded-xl">
                    <button
                      onClick={() => { onSelectSession(session.id); onClose(); }}
                      className={`
                        flex-1 min-w-0 text-left px-3 py-2.5 rounded-xl text-sm transition-all
                        ${isActive
                          ? "bg-indigo-600/20 border border-indigo-500/30 text-zinc-100"
                          : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-transparent"
                        }
                      `}
                    >
                      <p className="truncate font-medium text-xs leading-snug">
                        {session.title}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {formatDate(session.createdAt)} · {session.messages.length} msg
                        {session.messages.length !== 1 ? "s" : ""}
                      </p>
                    </button>
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      aria-label={`Delete "${session.title}"`}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                        hover:bg-red-900/40 hover:text-red-400 text-zinc-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        {sessions.length > 0 && (
          <div className="p-3 border-t border-zinc-800">
            <button
              onClick={onClearAll}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
                text-zinc-500 hover:text-red-400 hover:bg-red-900/20
                text-xs font-medium transition-all border border-transparent hover:border-red-900/30"
            >
              <Trash2 size={12} />
              Clear all history
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
