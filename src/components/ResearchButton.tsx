"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  contactId: string;
  currentStatus: string;
  size?: "sm" | "md";
}

export default function ResearchButton({ contactId, currentStatus, size = "md" }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isCompleted = currentStatus === "COMPLETED";
  const isRunning = currentStatus === "IN_PROGRESS";

  const label = isPending
    ? "Researching…"
    : isCompleted
    ? "Re-research"
    : isRunning
    ? "In Progress…"
    : "Research";

  const sizeClass = size === "sm"
    ? "px-3 py-1.5 text-xs"
    : "px-4 py-2 text-sm";

  function handleClick() {
    startTransition(async () => {
      await fetch(`/api/contacts/${contactId}/research`, { method: "POST" });
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || isRunning}
      className={`
        ${sizeClass} inline-flex items-center gap-1.5 rounded-lg font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${isCompleted
          ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
        }
      `}
    >
      {isPending && (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {label}
    </button>
  );
}
