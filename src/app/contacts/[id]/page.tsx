import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResearchButton from "@/components/ResearchButton";
import GiftActions from "@/components/GiftActions";

function fmtAcv(n: number) { return `$${Math.round(n / 1000)}K`; }
function fmtDate(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}
function fmtDuration(a: Date | null, b: Date | null) {
  if (!a || !b) return "—";
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
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
const JOB_BADGE: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-500",
  RUNNING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700",
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
  UNKNOWN: "bg-slate-100 text-slate-500",
};
const GIFT_STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-500",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  ORDERED: "bg-blue-100 text-blue-700",
  SENT: "bg-violet-100 text-violet-700",
  DELIVERED: "bg-teal-100 text-teal-700",
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      account: true,
      profiles: { orderBy: { createdAt: "asc" } },
      interests: { orderBy: { confidence: "desc" } },
      researchJobs: { orderBy: { createdAt: "desc" } },
      recommendations: { orderBy: { estimatedCost: "desc" } },
    },
  });

  if (!contact) notFound();

  const jobTypeLabel: Record<string, string> = {
    PROFILE_RESEARCH: "Profile Research",
    INTEREST_EXTRACTION: "Interest Extraction",
    GIFT_GENERATION: "Gift Generation",
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/contacts" className="text-slate-500 hover:text-indigo-600 transition-colors">
          Contacts
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">
          {contact.firstName} {contact.lastName}
        </span>
      </div>

      {/* Contact header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar placeholder */}
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold">
              {contact.firstName[0]}{contact.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {contact.firstName} {contact.lastName}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">{contact.title}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${RESEARCH_BADGE[contact.status]}`}>
                  {contact.status.replace(/_/g, " ")}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${TIER_BADGE[contact.account.tier]}`}>
                  {contact.account.tier.replace("_", " ")}
                </span>
                {contact.city && (
                  <span className="text-xs text-slate-400">📍 {contact.city}, {contact.country}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">Account ACV</p>
              <p className="text-lg font-bold text-slate-900">{fmtAcv(contact.account.expectedAcv)}</p>
            </div>
            <ResearchButton contactId={contact.id} currentStatus={contact.status} size="md" />
          </div>
        </div>
      </div>

      {/* Top grid: Account info + Social profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Account">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Company</dt>
              <dd className="font-medium text-slate-900">{contact.account.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Industry</dt>
              <dd className="text-slate-700">{contact.account.industry ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Location</dt>
              <dd className="text-slate-700">{contact.account.city}, {contact.account.country}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Domain</dt>
              <dd className="text-slate-700">{contact.account.domain ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Expected ACV</dt>
              <dd className="font-bold text-slate-900">{fmtAcv(contact.account.expectedAcv)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Tier</dt>
              <dd>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_BADGE[contact.account.tier]}`}>
                  {contact.account.tier.replace("_", " ")}
                </span>
              </dd>
            </div>
          </dl>
        </Card>

        <Card title={`Social Profiles (${contact.profiles.length})`}>
          {contact.profiles.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No social profiles.</p>
          ) : (
            <ul className="space-y-3">
              {contact.profiles.map((p) => (
                <li key={p.id} className="border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {p.platform}
                    </span>
                    {p.lastScrapedAt && (
                      <span className="text-xs text-slate-400">Scraped {fmtDate(p.lastScrapedAt)}</span>
                    )}
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline truncate block mb-2"
                  >
                    {p.url}
                  </a>
                  {p.rawText && (
                    <p className="text-xs text-slate-500 line-clamp-3 italic">"{p.rawText.slice(0, 180)}…"</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Detected interests */}
      <Card title={`Detected Interests (${contact.interests.length})`}>
        {contact.interests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">No interests detected yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click Research to run the interest extraction pipeline.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {contact.interests.map((i) => (
              <div key={i.id} className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INTEREST_BADGE[i.category]}`}>
                    {i.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {Math.round(i.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${i.confidence * 100}%` }}
                  />
                </div>
                {i.evidence && (
                  <p className="text-xs text-slate-500 italic line-clamp-2">"{i.evidence}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Gift recommendations */}
      <Card title={`Gift Recommendations (${contact.recommendations.length})`}>
        {contact.recommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">No gift recommendations yet.</p>
            <p className="text-xs text-slate-400 mt-1">Interests must be detected before gifts can be generated.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contact.recommendations.map((g) => (
              <div key={g.id} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">{g.title}</h4>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${GIFT_STATUS_BADGE[g.status]}`}>
                    {g.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{g.description}</p>
                {g.reasoning && (
                  <p className="text-xs text-slate-400 italic line-clamp-2">"{g.reasoning}"</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{g.category}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{g.giftType}</span>
                  {g.vendor && (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs">{g.vendor}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                  <span className="text-lg font-bold text-slate-900">
                    ${g.estimatedCost.toLocaleString()}
                  </span>
                  <GiftActions giftId={g.id} currentStatus={g.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Research jobs */}
      <Card title={`Research Jobs (${contact.researchJobs.length})`}>
        {contact.researchJobs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No jobs run yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-t border-slate-100">
                  {["Type", "Status", "Started", "Completed", "Duration", "Error"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contact.researchJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-slate-700 whitespace-nowrap">
                      {jobTypeLabel[j.jobType] ?? j.jobType}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${JOB_BADGE[j.status]}`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(j.startedAt)}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(j.completedAt)}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {fmtDuration(j.startedAt, j.completedAt)}
                    </td>
                    <td className="px-5 py-3 text-xs text-rose-500 max-w-[200px] truncate">
                      {j.errorMessage ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
