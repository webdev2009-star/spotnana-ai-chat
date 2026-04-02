"use client";

export function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 w-fit">
      <div className="flex gap-1 items-center">
        <span
          className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="text-xs text-zinc-400 font-medium tracking-wide">
        Thinking…
      </span>
    </div>
  );
}
