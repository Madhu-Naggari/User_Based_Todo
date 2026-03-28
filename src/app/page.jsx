import Link from "next/link";

import AuthPanel from "@/components/auth-panel";
import { getCurrentUserFromCookies } from "@/lib/auth";

const featureCards = [
  {
    title: "JWT Session",
    body: "Password hashing, login, logout, and protected routes backed by secure token checks.",
  },
  {
    title: "RBAC Access",
    body: "Users manage personal tasks while admins get a broader control view across accounts.",
  },
  {
    title: "Task Control",
    body: "Create, update, delete, and track work from a dashboard that stays fast and readable.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUserFromCookies();

  return (
    <main className="app-shell px-5 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
      <div className="ambient-orb one" />
      <div className="ambient-orb two" />
      <div className="ambient-orb three" />

      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card glass-hero hero-grid rounded-[36px] p-7 md:p-10 lg:p-12">
          <div className="relative z-10">
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-[var(--line)] bg-white/6 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-[var(--accent)]">
                <span className="ring-dot text-[var(--accent)]" />
                Backend Developer Assignment
              </div>

              <div className="rounded-full border border-[var(--line)] bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] muted-text">
                Next.js • Prisma • JWT
              </div>
            </div>

            <div className="max-w-4xl">
              <p className="eyebrow mb-4 text-sm">Auth + RBAC + CRUD</p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.05em] text-balance md:text-7xl lg:text-[5.5rem]">
                Frosted UI for a role-based task platform.
              </h1>
              <p className="soft-text mt-7 max-w-2xl text-base leading-8 md:text-lg">
                A focused full-stack assignment with authentication, protected
                APIs, role-aware task management, and a dashboard built to feel
                polished during review instead of looking like a starter kit.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="feature-tile rounded-[26px] p-5">
                <p className="eyebrow text-[11px]">API Version</p>
                <p className="metric-value mt-4 text-3xl font-semibold">v1</p>
                <p className="soft-text mt-3 text-sm leading-7">
                  Clean route grouping for auth, tasks, and admin actions.
                </p>
              </div>
              <div className="feature-tile rounded-[26px] p-5">
                <p className="eyebrow text-[11px]">Demo Admin</p>
                <p className="mt-4 font-mono text-sm text-[var(--foreground)]">
                  admin@primetrade.local
                </p>
                <p className="soft-text mt-3 text-sm leading-7">
                  Seeded access for reviewing admin-specific behavior quickly.
                </p>
              </div>
              <div className="feature-tile rounded-[26px] p-5">
                <p className="eyebrow text-[11px]">Protected Flow</p>
                <p className="metric-value mt-4 text-3xl font-semibold">JWT</p>
                <p className="soft-text mt-3 text-sm leading-7">
                  Session-aware UI with toast feedback on every auth action.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="glow-button rounded-full px-6 py-3 text-sm font-semibold transition"
                  >
                    Continue as {user.name}
                  </Link>
                  <Link
                    href="/api-docs"
                    className="ghost-button rounded-full px-6 py-3 text-sm font-semibold transition"
                  >
                    Open Swagger UI
                  </Link>
                </>
              ) : (
                <>
                  <div className="ghost-button rounded-full px-6 py-3 text-sm font-semibold muted-text">
                    Sign in on the right to continue
                  </div>
                  <Link
                    href="/api-docs"
                    className="ghost-button rounded-full px-6 py-3 text-sm font-semibold transition"
                  >
                    View API Docs
                  </Link>
                </>
              )}
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {featureCards.map((card) => (
                <article key={card.title} className="feature-tile rounded-[24px] p-5">
                  <p className="eyebrow text-[11px]">{card.title}</p>
                  <p className="soft-text mt-4 text-sm leading-7">{card.body}</p>
                </article>
              ))}
            </div>

            <div className="surface-dark mt-12 rounded-[30px] border border-[var(--line)] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-[11px]">Seeded Admin Access</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                    Reviewer-friendly credentials
                  </h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
                  Ready to test
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="glass-panel rounded-[22px] p-4">
                  <p className="eyebrow text-[11px]">Email</p>
                  <p className="mt-3 font-mono text-sm">admin@primetrade.local</p>
                </div>
                <div className="glass-panel rounded-[22px] p-4">
                  <p className="eyebrow text-[11px]">Password</p>
                  <p className="mt-3 font-mono text-sm">Admin@123</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AuthPanel initialUser={user} />
      </section>
    </main>
  );
}
