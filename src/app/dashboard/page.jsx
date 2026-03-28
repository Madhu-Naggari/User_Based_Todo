import Link from "next/link";
import { redirect } from "next/navigation";

import DashboardClient from "@/components/dashboard-client";
import { getCurrentUserFromCookies } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUserFromCookies();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="app-shell px-5 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
      <div className="ambient-orb one" />
      <div className="ambient-orb two" />
      <div className="ambient-orb three" />

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="glass-card glass-hero rounded-[34px] p-7 md:p-9">
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <p className="eyebrow text-sm">Protected Dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
                Welcome back, {user.name}
              </h1>
              <p className="soft-text mt-4 max-w-2xl text-sm leading-7 md:text-base">
                Monitor active work, update task status, and review access by
                role from a single frosted control surface.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="glass-panel rounded-[24px] px-5 py-4">
                <p className="eyebrow text-[11px]">Signed In As</p>
                <p className="mt-2 text-lg font-semibold">{user.role}</p>
                <p className="muted-text mt-1 text-sm">{user.email}</p>
              </div>
              <Link
                href="/api-docs"
                className="ghost-button flex items-center rounded-[24px] px-5 py-4 text-sm font-semibold transition"
              >
                Swagger UI
              </Link>
            </div>
          </div>
        </div>

        <DashboardClient initialUser={user} />
      </div>
    </main>
  );
}
