import Link from "next/link";
import { prisma } from "@/lib/prisma";
import GiftActions from "@/components/GiftActions";

export const metadata = { title: "Gifts" };

const GIFT_STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-500",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  ORDERED: "bg-blue-100 text-blue-700",
  SENT: "bg-violet-100 text-violet-700",
  DELIVERED: "bg-teal-100 text-teal-700",
};
const TIER_BADGE: Record<string, string> = {
  STRATEGIC: "bg-violet-100 text-violet-700",
  ENTERPRISE: "bg-blue-100 text-blue-700",
  MID_MARKET: "bg-slate-100 text-slate-600",
};
const CATEGORY_BADGE: Record<string, string> = {
  SUBSCRIPTION: "bg-indigo-100 text-indigo-700",
  EVENT: "bg-violet-100 text-violet-700",
  MERCHANDISE: "bg-blue-100 text-blue-700",
  EXPERIENCE: "bg-amber-100 text-amber-700",
  PHYSICAL_PRODUCT: "bg-teal-100 text-teal-700",
  CHARITY: "bg-rose-100 text-rose-700",
  GIFT_CARD: "bg-slate-100 text-slate-600",
};

const GIFT_TYPES = ["PHYSICAL", "VIRTUAL", "EXPERIENCE"];
const GIFT_STATUSES = ["DRAFT", "APPROVED", "REJECTED", "ORDERED", "SENT", "DELIVERED"];
const GIFT_CATEGORIES = [
  "SUBSCRIPTION", "EVENT", "MERCHANDISE", "EXPERIENCE",
  "PHYSICAL_PRODUCT", "CHARITY", "GIFT_CARD",
];

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Newest first" },
  { value: "cost_desc", label: "Cost: High → Low" },
  { value: "cost_asc", label: "Cost: Low → High" },
  { value: "status", label: "Status" },
];

function buildOrderBy(sortBy: string) {
  switch (sortBy) {
    case "cost_desc": return { estimatedCost: "desc" as const };
    case "cost_asc":  return { estimatedCost: "asc" as const };
    case "status":    return { status: "asc" as const };
    default:          return { createdAt: "desc" as const };
  }
}

export default async function GiftsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const status    = typeof sp.status    === "string" ? sp.status    : "";
  const category  = typeof sp.category  === "string" ? sp.category  : "";
  const giftType  = typeof sp.giftType  === "string" ? sp.giftType  : "";
  const sortBy    = typeof sp.sortBy    === "string" ? sp.sortBy    : "createdAt_desc";
  const minBudget = sp.minBudget ? Number(sp.minBudget) : undefined;
  const maxBudget = sp.maxBudget ? Number(sp.maxBudget) : undefined;

  const gifts = await prisma.giftRecommendation.findMany({
    where: {
      ...(status   && { status:   status   as never }),
      ...(category && { category: category as never }),
      ...(giftType && { giftType: giftType as never }),
      ...((minBudget !== undefined || maxBudget !== undefined) && {
        estimatedCost: {
          ...(minBudget !== undefined && { gte: minBudget }),
          ...(maxBudget !== undefined && { lte: maxBudget }),
        },
      }),
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          title: true,
          account: { select: { name: true, tier: true } },
        },
      },
    },
    orderBy: buildOrderBy(sortBy),
  });

  const hasFilters = status || category || giftType || minBudget || maxBudget;
  const draftCount    = gifts.filter((g) => g.status === "DRAFT").length;
  const approvedCount = gifts.filter((g) => g.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gift Recommendations</h1>
        <p className="mt-1 text-sm text-slate-500">
          {gifts.length} gift{gifts.length !== 1 ? "s" : ""}
          {hasFilters ? " matching filters" : " total"}
          {!hasFilters && draftCount > 0 && (
            <> · <span className="text-amber-600 font-medium">{draftCount} awaiting approval</span></>
          )}
          {!hasFilters && approvedCount > 0 && (
            <> · <span className="text-emerald-600 font-medium">{approvedCount} approved</span></>
          )}
        </p>
      </div>

      {/* Filters + Sort */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <form method="GET" action="/gifts" className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-xs font-medium text-slate-500">Status</label>
            <select name="status" defaultValue={status}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All statuses</option>
              {GIFT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-medium text-slate-500">Category</label>
            <select name="category" defaultValue={category}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All categories</option>
              {GIFT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, " ").toLowerCase().replace(/^\w/, (l) => l.toUpperCase())}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-xs font-medium text-slate-500">Type</label>
            <select name="giftType" defaultValue={giftType}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All types</option>
              {GIFT_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 w-[100px]">
            <label className="text-xs font-medium text-slate-500">Min ($)</label>
            <input type="number" name="minBudget" defaultValue={minBudget} placeholder="0"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="flex flex-col gap-1 w-[100px]">
            <label className="text-xs font-medium text-slate-500">Max ($)</label>
            <input type="number" name="maxBudget" defaultValue={maxBudget} placeholder="500"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* ── Sort ── */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-medium text-slate-500">Sort by</label>
            <select name="sortBy" defaultValue={sortBy}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              Apply
            </button>
            {(hasFilters || sortBy !== "createdAt_desc") && (
              <Link href="/gifts"
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Gift cards */}
      {gifts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center">
          <p className="text-slate-400 text-sm">No gift recommendations found.</p>
          {hasFilters ? (
            <Link href="/gifts" className="mt-2 inline-block text-xs text-indigo-600 hover:underline">Clear filters</Link>
          ) : (
            <p className="text-xs text-slate-400 mt-1">
              Research contacts to generate recommendations.{" "}
              <Link href="/contacts" className="text-indigo-600 hover:underline">Go to Contacts →</Link>
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {gifts.map((g) => (
            <div key={g.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              {/* Category + Status */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_BADGE[g.category] ?? "bg-slate-100 text-slate-500"}`}>
                  {g.category.replace(/_/g, " ")}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${GIFT_STATUS_BADGE[g.status]}`}>
                  {g.status}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{g.title}</h3>

              {/* Contact */}
              <Link href={`/contacts/${g.contact.id}`} className="flex items-center gap-2 group">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                  {g.contact.firstName[0]}{g.contact.lastName[0]}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                    {g.contact.firstName} {g.contact.lastName}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    {g.contact.account.name}
                    <span className={`px-1.5 py-0 rounded-full font-medium ${TIER_BADGE[g.contact.account.tier]}`}>
                      {g.contact.account.tier.replace("_", " ")}
                    </span>
                  </p>
                </div>
              </Link>

              {/* Description */}
              <p className="text-xs text-slate-500 line-clamp-2 flex-1">{g.description}</p>

              {/* Reasoning */}
              {g.reasoning && (
                <p className="text-xs text-slate-400 italic line-clamp-2 border-l-2 border-slate-200 pl-2">
                  {g.reasoning}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">{g.giftType}</span>
                {g.vendor && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs">{g.vendor}</span>
                )}
              </div>

              {/* Cost + Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                <div>
                  <span className="text-xl font-bold text-slate-900">${g.estimatedCost.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 ml-1">USD</span>
                </div>
                <GiftActions giftId={g.id} currentStatus={g.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
