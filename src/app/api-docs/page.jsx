import Link from "next/link";

export default function ApiDocsPage() {
  return (
    <main className="app-shell px-5 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
      <div className="ambient-orb one" />
      <div className="ambient-orb two" />
      <div className="ambient-orb three" />

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="glass-card glass-hero rounded-[34px] p-7 md:p-9">
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <p className="eyebrow text-sm">Swagger UI</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
                API documentation for reviewers.
              </h1>
              <p className="soft-text mt-4 max-w-2xl text-sm leading-7 md:text-base">
                This documentation includes endpoint details, request and
                response examples, and the JWT bearer authentication method
                needed to access protected routes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/api-spec.json"
                className="ghost-button rounded-full px-5 py-3 text-sm font-semibold transition"
              >
                Open JSON Spec
              </Link>
              <Link
                href="/dashboard"
                className="glow-button rounded-full px-5 py-3 text-sm font-semibold transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="swagger-shell overflow-hidden rounded-[32px] p-3 md:p-5">
          <iframe
            title="Swagger UI"
            src="/swagger-ui.html"
            className="h-[78vh] w-full rounded-[24px] border-0 bg-white"
          />
        </div>
      </div>
    </main>
  );
}
