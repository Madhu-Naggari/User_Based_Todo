"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const initialRegister = {
  name: "",
  email: "",
  password: "",
};

const initialLogin = {
  email: "",
  password: "",
};

function extractError(payload) {
  if (!payload) {
    return "Request failed.";
  }

  if (payload.details?.fieldErrors) {
    const fieldErrors = Object.values(payload.details.fieldErrors).flat();

    if (fieldErrors.length > 0) {
      return fieldErrors[0];
    }
  }

  if (Array.isArray(payload.details) && payload.details.length > 0) {
    return payload.details[0]?.message || payload.message || "Request failed.";
  }

  return payload.message || "Request failed.";
}

export default function AuthPanel({ initialUser }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [isPending, startTransition] = useTransition();

  function handleRegisterSubmit(event) {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
        credentials: "include",
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(extractError(payload));
        return;
      }

      toast.success("Account created. Redirecting to your dashboard.");
      setRegisterForm(initialRegister);
      router.push("/dashboard");
      router.refresh();
    });
  }

  function handleLoginSubmit(event) {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
        credentials: "include",
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(extractError(payload));
        return;
      }

      toast.success("Login successful.");
      setLoginForm(initialLogin);
      router.push("/dashboard");
      router.refresh();
    });
  }

  async function handleLogout() {
    const response = await fetch("/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      toast.error("Unable to log out right now.");
      return;
    }

    toast.success("Logged out.");
    router.refresh();
  }

  if (initialUser) {
    return (
      <aside className="glass-card rounded-[36px] p-6 md:p-8">
        <div className="glass-panel rounded-[28px] p-6">
          <p className="eyebrow text-[11px]">Session Active</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
            You are already signed in.
          </h2>
          <p className="soft-text mt-4 text-sm leading-7">
            Continue to the dashboard to manage tasks with your current session,
            or log out and switch accounts.
          </p>
        </div>

        <div className="mt-5 space-y-4 rounded-[28px] border border-[var(--line)] bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow text-[11px]">Role</span>
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              {initialUser.role}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow text-[11px]">Email</span>
            <span className="font-mono text-sm text-[var(--foreground)]">
              {initialUser.email}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="glow-button rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            Open Dashboard
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="ghost-button rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="glass-card rounded-[36px] p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-[11px]">Secure Access</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
            Sign in to your workspace.
          </h2>
        </div>
        <div className="rounded-full border border-[var(--line)] bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--accent)] whitespace-nowrap">
          Live API
        </div>
      </div>

      <p className="soft-text mt-4 text-sm leading-7">
        The frontend talks to the same protected REST APIs used by the app, and
        every auth result is surfaced through toasts.
      </p>

      <div className="mt-7 flex rounded-full border border-[var(--line)] bg-white/5 p-1">
        {["login", "register"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize transition cursor-pointer ${
              activeTab === tab
                ? "bg-white text-[#08111f]"
                : "text-[var(--text-soft)] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "login" ? (
        <form className="mt-7 space-y-4" onSubmit={handleLoginSubmit}>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Email
            </span>
            <input
              type="email"
              required
              value={loginForm.email}
              onChange={(event) =>
                setLoginForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="glass-input w-full rounded-[20px] px-4 py-3"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Password
            </span>
            <input
              type="password"
              required
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className="glass-input w-full rounded-[20px] px-4 py-3"
              placeholder="Enter your password"
            />
          </label>

          <div className="glass-panel rounded-[24px] p-4">
            <p className="eyebrow text-[11px]">Reviewer Shortcut</p>
            <p className="mt-3 font-mono text-sm">admin@primetrade.local</p>
            <p className="mt-1 font-mono text-sm">Admin@123</p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="glow-button w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-60"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      ) : (
        <form className="mt-7 space-y-4" onSubmit={handleRegisterSubmit}>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Full Name
            </span>
            <input
              type="text"
              required
              value={registerForm.name}
              onChange={(event) =>
                setRegisterForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="glass-input w-full rounded-[20px] px-4 py-3"
              placeholder="Prime Trade Candidate"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Email
            </span>
            <input
              type="email"
              required
              value={registerForm.email}
              onChange={(event) =>
                setRegisterForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="glass-input w-full rounded-[20px] px-4 py-3"
              placeholder="candidate@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Password
            </span>
            <input
              type="password"
              required
              minLength={8}
              value={registerForm.password}
              onChange={(event) =>
                setRegisterForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className="glass-input w-full rounded-[20px] px-4 py-3"
              placeholder="Minimum 8 characters"
            />
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="glow-button w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-60"
          >
            {isPending ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="glass-panel rounded-[22px] p-4">
          <p className="eyebrow text-[11px]">Session Style</p>
          <p className="soft-text mt-3 text-sm leading-7">
            JWT-backed access with role-aware dashboard controls.
          </p>
        </div>
        <div className="glass-panel rounded-[22px] p-4">
          <p className="eyebrow text-[11px]">UX Feedback</p>
          <p className="soft-text mt-3 text-sm leading-7">
            Toast responses for sign-in, sign-up, errors, and task actions.
          </p>
        </div>
      </div>
    </aside>
  );
}
