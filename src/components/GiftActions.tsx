"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  giftId: string;
  currentStatus: string;
}

export default function GiftActions({ giftId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (currentStatus !== "DRAFT") return null;

  function update(status: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      await fetch(`/api/gifts/${giftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => update("APPROVED")}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
          bg-emerald-50 text-emerald-700 border border-emerald-200
          hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
        </svg>
        Approve
      </button>
      <button
        onClick={() => update("REJECTED")}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
          bg-rose-50 text-rose-600 border border-rose-200
          hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
        Reject
      </button>
    </div>
  );
}
