import Link from "next/link";
import { prisma } from "@/lib/prisma";

function fmtAcv(n: number) {
  return `$${Math.round(n / 1000)}K`;
}

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

export default async function DashboardPage() {
  const [
    totalAccounts,
    totalContacts,
    researchedContacts,
    pendingJobs,
    totalGifts,
    approvedGifts,
    recentContacts,
    pendingGiftsList,
  ] = await Promise.all([
    prisma.account.count(),
    prisma.contact.count(),
    prisma.contact.count({ where: { status: "COMPLETED" } }),
    prisma.researchJob.count({ where: { status: { in: ["PENDING", "RUNNING"] } } }),
    prisma.giftRecommendation.count(),
    prisma.giftRecommendation.count({ where: { status: "APPROVED" } }),
    prisma.contact.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { account: { select: { name: true, tier: true, expectedAcv: true } } },
    }),
    prisma.giftRecommendation.findMany({
      where: { status: "DRAFT" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        contact: {
          select: {
            firstName: true,
            lastName: true,
            account: { select: { name: true, tier: true } },
          },
        },
      },
    }),
  ]);

  const stats = [
    { label: "Accounts", value: totalAccounts, href: "/contacts", color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Contacts", value: totalContacts, href: "/contacts", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Researched", value: researchedContacts, href: "/contacts?status=COMPLETED", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Jobs", value: pendingJobs, href: "/jobs", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Gift Drafts", value: totalGifts - approvedGifts, href: "/gifts?status=DRAFT", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Approved Gifts", value: approvedGifts, href: "/gifts?status=APPROVED", color: "text-teal-600", bg: "bg-teal-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Research contacts, detect interests, and recommend personalised gifts.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow group"
          >
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${s.bg} mb-3`}>
              <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent contacts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Recent Contacts</h2>
            <Link href="/contacts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </Link>
          </div>
          {recentContacts.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-400">
              No contacts yet — run{" "}
              <code className="bg-slate-100 px-1 rounded text-xs">npx prisma db seed</code>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentContacts.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/contacts/${c.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {c.account.name} · {fmtAcv(c.account.expectedAcv)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_BADGE[c.account.tier]}`}>
                        {c.account.tier.replace("_", " ")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RESEARCH_BADGE[c.status]}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Gifts awaiting approval */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Awaiting Approval</h2>
            <Link href="/gifts?status=DRAFT" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </Link>
          </div>
          {pendingGiftsList.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-400">
              No draft gifts — research a contact to generate recommendations.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pendingGiftsList.map((g) => (
                <li key={g.id} className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{g.title}</p>
                    <p className="text-xs text-slate-500">
                      {g.contact.firstName} {g.contact.lastName} · {g.contact.account.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">${g.estimatedCost}</span>
                    <Link
                      href="/gifts?status=DRAFT"
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick-start guide when DB is empty */}
      {totalContacts === 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-indigo-900 mb-2">🚀 Getting started</h3>
          <ol className="text-sm text-indigo-700 space-y-1 list-decimal list-inside">
            <li>
              Seed the database:{" "}
              <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs">npx prisma db seed</code>
            </li>
            <li>
              Optionally start the background worker:{" "}
              <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs">npm run worker</code>
            </li>
            <li>Go to Contacts and click Research on any contact.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
