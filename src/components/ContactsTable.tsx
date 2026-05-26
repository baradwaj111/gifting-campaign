"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
export type ContactRow = {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  city: string | null;
  status: string;
  account: { name: string; tier: string; expectedAcv: number };
  interests: Array<{ id: string; category: string }>;
};

// ── Badge maps ─────────────────────────────────────────────────────────────
const RESEARCH_BADGE: Record<string, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-500",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700",
};
const TIER_BADGE: Record<string, string> = {
  STRATEGIC: "bg-violet-100 text-violet-700",
  ENTERPRISE: "bg-blue-100 text-blue-700",
  MID_MARKET: "bg-slate-100 text-slate-600",
};
const INTEREST_BADGE: Record<string, string> = {
  FITNESS: "bg-emerald-100 text-emerald-700",
  MUSIC: "bg-violet-100 text-violet-700",
  SPORTS: "bg-blue-100 text-blue-700",
  TRAVEL: "bg-sky-100 text-sky-700",
  FAMILY: "bg-rose-100 text-rose-700",
  FOOD: "bg-orange-100 text-orange-700",
  BOOKS: "bg-amber-100 text-amber-700",
  TECH: "bg-indigo-100 text-indigo-700",
  GAMING: "bg-purple-100 text-purple-700",
  ART: "bg-pink-100 text-pink-700",
};

function fmtAcv(n: number) {
  return `$${Math.round(n / 1000)}K`;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ContactsTable({ contacts }: { contacts: ContactRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const allSelected = contacts.length > 0 && selected.size === contacts.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(contacts.map((c) => c.id)));
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function researchSelected() {
    startTransition(async () => {
      const ids = Array.from(selected);
      // Research all selected contacts sequentially so each pipeline completes
      // before the next begins (avoids DB contention on a single connection pool).
      for (const id of ids) {
        await fetch(`/api/contacts/${id}/research`, { method: "POST" });
      }
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {/* ── Bulk action bar ── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-indigo-800">
            {selected.size} contact{selected.size !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={researchSelected}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending && (
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {isPending
              ? "Researching & generating gifts…"
              : `Research & Generate Gifts (${selected.size})`}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            disabled={isPending}
            className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors disabled:opacity-50"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {contacts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">No contacts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {/* Select-all checkbox */}
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  {["Contact", "Account", "City", "ACV", "Tier", "Interests", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((c) => {
                  const isSelected = selected.has(c.id);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => toggleOne(c.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/60 hover:bg-indigo-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {/* Row checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(c.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Contact name + title */}
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/contacts/${c.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="group"
                        >
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{c.title}</p>
                        </Link>
                      </td>

                      {/* Account */}
                      <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                        {c.account.name}
                      </td>

                      {/* City */}
                      <td className="px-5 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                        {c.city ?? "—"}
                      </td>

                      {/* ACV */}
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-700 whitespace-nowrap">
                        {fmtAcv(c.account.expectedAcv)}
                      </td>

                      {/* Tier */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${TIER_BADGE[c.account.tier]}`}
                        >
                          {c.account.tier.replace("_", " ")}
                        </span>
                      </td>

                      {/* Interests */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {c.interests.length > 0 ? (
                            c.interests.slice(0, 2).map((i) => (
                              <span
                                key={i.id}
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  INTEREST_BADGE[i.category] ?? "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {i.category.charAt(0) + i.category.slice(1).toLowerCase()}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Research status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${RESEARCH_BADGE[c.status]}`}
                        >
                          {c.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* View link */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Link
                          href={`/contacts/${c.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-slate-500 hover:text-indigo-600 transition-colors font-medium"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
