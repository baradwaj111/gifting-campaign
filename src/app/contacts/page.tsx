import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ContactsTable from "@/components/ContactsTable";

export const metadata = { title: "Contacts" };

const INTEREST_CATEGORIES = [
  "FITNESS", "MUSIC", "SPORTS", "TRAVEL", "FAMILY",
  "FOOD", "BOOKS", "TECH", "GAMING", "ART",
];

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const tier = typeof sp.tier === "string" ? sp.tier : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const city = typeof sp.city === "string" ? sp.city : "";
  const interestCategory = typeof sp.interestCategory === "string" ? sp.interestCategory : "";
  const minAcv = sp.minAcv ? Number(sp.minAcv) : undefined;
  const maxAcv = sp.maxAcv ? Number(sp.maxAcv) : undefined;

  const contacts = await prisma.contact.findMany({
    where: {
      ...(status && { status: status as never }),
      ...(city && { city: { contains: city, mode: "insensitive" } }),
      ...(interestCategory && {
        interests: { some: { category: interestCategory as never } },
      }),
      account: {
        ...(tier && { tier: tier as never }),
        ...((minAcv !== undefined || maxAcv !== undefined) && {
          expectedAcv: {
            ...(minAcv !== undefined && { gte: minAcv }),
            ...(maxAcv !== undefined && { lte: maxAcv }),
          },
        }),
      },
    },
    include: {
      account: { select: { name: true, tier: true, expectedAcv: true } },
      interests: {
        orderBy: { confidence: "desc" },
        take: 3,
        select: { id: true, category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const hasFilters = tier || status || city || interestCategory || minAcv || maxAcv;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
        <p className="mt-1 text-sm text-slate-500">
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          {hasFilters ? " matching filters" : " total"} · Select contacts and click{" "}
          <span className="font-medium text-indigo-600">Research &amp; Generate Gifts</span> to run the pipeline.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <form method="GET" action="/contacts" className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-xs font-medium text-slate-500">Tier</label>
            <select
              name="tier"
              defaultValue={tier}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All tiers</option>
              <option value="STRATEGIC">Strategic</option>
              <option value="ENTERPRISE">Enterprise</option>
              <option value="MID_MARKET">Mid-Market</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-medium text-slate-500">Research Status</label>
            <select
              name="status"
              defaultValue={status}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-medium text-slate-500">Interest</label>
            <select
              name="interestCategory"
              defaultValue={interestCategory}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All interests</option>
              {INTEREST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[120px]">
            <label className="text-xs font-medium text-slate-500">City</label>
            <input
              type="text"
              name="city"
              defaultValue={city}
              placeholder="e.g. London"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1 w-[100px]">
            <label className="text-xs font-medium text-slate-500">Min ACV ($)</label>
            <input
              type="number"
              name="minAcv"
              defaultValue={minAcv}
              placeholder="75000"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1 w-[100px]">
            <label className="text-xs font-medium text-slate-500">Max ACV ($)</label>
            <input
              type="number"
              name="maxAcv"
              defaultValue={maxAcv}
              placeholder="400000"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Apply
            </button>
            {hasFilters && (
              <Link
                href="/contacts"
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Multi-select table */}
      <ContactsTable contacts={contacts} />

      {contacts.length === 0 && hasFilters && (
        <div className="text-center">
          <Link href="/contacts" className="text-xs text-indigo-600 hover:underline">
            Clear all filters
          </Link>
        </div>
      )}
    </div>
  );
}
