"use client";

import { Message } from "@/types";
import { AlertCircle, Bot, User } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

function formatTimestamp(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ts));
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let listItems: React.ReactNode[] = [];
  const elements: React.ReactNode[] = [];
  let keyIdx = 0;

  const flushCode = () => {
    if (codeLines.length === 0) return;
    elements.push(
      <pre
        key={keyIdx++}
        className="my-2 p-3 rounded-lg bg-zinc-950 border border-zinc-700 overflow-x-auto text-sm font-mono text-emerald-300"
      >
        {codeLines.join("\n")}
      </pre>
    );
    codeLines = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={keyIdx++} className="my-1 ml-4 space-y-0.5 list-disc">
        {listItems}
      </ul>
    );
    listItems = [];
  };

  const parseInline = (line: string, key: number): React.ReactNode => {
    const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={key}>
        {boldParts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          const codeParts = part.split(/(`[^`]+`)/g);
          return codeParts.map((cp, j) => {
            if (cp.startsWith("`") && cp.endsWith("`")) {
              return (
                <code
                  key={j}
                  className="px-1.5 py-0.5 rounded bg-zinc-950 text-emerald-300 font-mono text-sm border border-zinc-700"
                >
                  {cp.slice(1, -1)}
                </code>
              );
            }
            return cp;
          });
        })}
      </span>
    );
  };

  lines.forEach((line, idx) => {
    if (line.startsWith("```")) {
      flushList();
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(<li key={keyIdx++}>{parseInline(line.slice(2), idx)}</li>);
      return;
    }

    flushList();

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={keyIdx++} className="text-lg font-bold mt-2 mb-1">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={keyIdx++} className="text-base font-semibold mt-2 mb-1">
          {line.slice(3)}
        </h2>
      );
    } else if (line === "") {
      elements.push(<br key={keyIdx++} />);
    } else {
      elements.push(
        <p key={keyIdx++} className="leading-relaxed">
          {parseInline(line, idx)}
        </p>
      );
    }
  });

  flushList();
  if (inCodeBlock) flushCode();

  return elements;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 group">
        <div className="flex flex-col items-end max-w-[75%] gap-1">
          <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-indigo-600 text-white text-sm leading-relaxed shadow-lg">
            {message.content}
          </div>
          <span className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
          <User size={14} className="text-white" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-start gap-3 group" role="alert">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-900/50 border border-red-700/50 flex items-center justify-center">
          <AlertCircle size={14} className="text-red-400" aria-hidden="true" />
        </div>
        <div className="flex flex-col max-w-[75%] gap-1">
          <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-red-900/30 border border-red-700/40 text-red-300 text-sm leading-relaxed">
            {message.content}
          </div>
          <span className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 group">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
        <Bot size={14} className="text-white" aria-hidden="true" />
      </div>
      <div className="flex flex-col max-w-[75%] gap-1">
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-zinc-800 border border-zinc-700/50 text-zinc-100 text-sm shadow-sm">
          {renderMarkdown(message.content)}
        </div>
        <span className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity px-1">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
