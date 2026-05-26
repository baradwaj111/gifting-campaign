import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AutoRefresh from "@/components/AutoRefresh";

export const metadata = { title: "Jobs" };

function fmtDate(d: Date | null | string) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(d));
}

function fmtDuration(a: Date | null, b: Date | null) {
  if (!a || !b) return "—";
  const ms = new Date(b).getTime() - new Date(a).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const JOB_BADGE: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-500",
  RUNNING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700",
};

const JOB_TYPE_LABEL: Record<string, string> = {
  PROFILE_RESEARCH: "Profile Research",
  INTEREST_EXTRACTION: "Interest Extraction",
  GIFT_GENERATION: "Gift Generation",
};

const JOB_TYPE_STEP: Record<string, number> = {
  PROFILE_RESEARCH: 1,
  INTEREST_EXTRACTION: 2,
  GIFT_GENERATION: 3,
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const statusFilter = typeof sp.status === "string" ? sp.status : "";
  const jobTypeFilter = typeof sp.jobType === "string" ? sp.jobType : "";

  const jobs = await prisma.researchJob.findMany({
    where: {
      ...(statusFilter && { status: statusFilter as never }),
      ...(jobTypeFilter && { jobType: jobTypeFilter as never }),
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          account: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    total: jobs.length,
    pending: jobs.filter((j) => j.status === "PENDING").length,
    running: jobs.filter((j) => j.status === "RUNNING").length,
    completed: jobs.filter((j) => j.status === "COMPLETED").length,
    failed: jobs.filter((j) => j.status === "FAILED").length,
  };

  const stats = [
    { label: "Total", value: counts.total, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
    { label: "Pending", value: counts.pending, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
    { label: "Running", value: counts.running, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    { label: "Completed", value: counts.completed, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    { label: "Failed", value: counts.failed, color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Research Jobs</h1>
          <p className="mt-1 text-sm text-slate-500">
            DB-backed background pipeline: Profile Research → Interest Extraction → Gift Generation
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <AutoRefresh intervalMs={5000} />
          <span className="text-xs text-slate-400">
            Start the worker: <code className="bg-slate-100 px-1.5 py-0.5 rounded">npm run worker</code>
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <form method="GET" action="/jobs" className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-xs font-medium text-slate-500">Status</label>
            <select
              name="status"
              defaultValue={statusFilter}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="RUNNING">Running</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-xs font-medium text-slate-500">Job Type</label>
            <select
              name="jobType"
              defaultValue={jobTypeFilter}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All types</option>
              <option value="PROFILE_RESEARCH">Profile Research</option>
              <option value="INTEREST_EXTRACTION">Interest Extraction</option>
              <option value="GIFT_GENERATION">Gift Generation</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Apply
            </button>
            {(statusFilter || jobTypeFilter) && (
              <Link
                href="/jobs"
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Jobs table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {jobs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">No jobs found.</p>
            <p className="text-xs text-slate-400 mt-1">
              Research a contact to start the pipeline.{" "}
              <Link href="/contacts" className="text-indigo-600 hover:underline">Go to Contacts →</Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["Step", "Type", "Contact", "Account", "Status", "Started", "Completed", "Duration", "Error"].map((h) => (
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
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                    {/* Step number */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                        {JOB_TYPE_STEP[j.jobType] ?? "?"}
                      </span>
                    </td>

                    {/* Job type */}
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-700 whitespace-nowrap">
                      {JOB_TYPE_LABEL[j.jobType] ?? j.jobType}
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Link
                        href={`/contacts/${j.contact.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        {j.contact.firstName} {j.contact.lastName}
                      </Link>
                    </td>

                    {/* Account */}
                    <td className="px-5 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                      {j.contact.account.name}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${JOB_BADGE[j.status]}`}>
                        {j.status === "RUNNING" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        {j.status}
                      </span>
                    </td>

                    {/* Timestamps */}
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{fmtDate(j.startedAt)}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{fmtDate(j.completedAt)}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {fmtDuration(j.startedAt, j.completedAt)}
                    </td>

                    {/* Error */}
                    <td className="px-5 py-3.5 text-xs text-rose-500 max-w-[180px]">
                      <span className="truncate block" title={j.errorMessage ?? ""}>
                        {j.errorMessage ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
