"use client";

import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { toast } from "sonner";

const emptyTask = {
  title: "",
  description: "",
  status: "TODO",
};

function statusClasses(status) {
  if (status === "DONE") {
    return "bg-emerald-400/14 text-emerald-200 border border-emerald-300/18";
  }

  if (status === "IN_PROGRESS") {
    return "bg-amber-300/14 text-amber-100 border border-amber-200/18";
  }

  return "bg-slate-200/10 text-slate-100 border border-white/10";
}

function extractError(payload) {
  if (!payload) {
    return "Request failed.";
  }

  if (payload.details?.fieldErrors) {
    const errors = Object.values(payload.details.fieldErrors).flat();

    if (errors.length > 0) {
      return errors[0];
    }
  }

  return payload.message || "Request failed.";
}

async function requestTasks(scope) {
  const response = await fetch(`/api/v1/tasks?scope=${scope}`, {
    cache: "no-store",
    credentials: "include",
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(extractError(payload));
  }

  return payload.data.tasks;
}

async function requestAdminUsers() {
  const response = await fetch("/api/v1/admin/users", {
    cache: "no-store",
    credentials: "include",
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(extractError(payload));
  }

  return payload.data.users;
}

export default function DashboardClient({ initialUser }) {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("mine");
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(
    initialUser.role === "ADMIN"
  );

  const deferredSearch = useDeferredValue(search);
  const filteredTasks = tasks.filter((task) => {
    const haystack = `${task.title} ${task.description || ""}`.toLowerCase();
    return haystack.includes(deferredSearch.trim().toLowerCase());
  });

  async function loadTasks(activeScope = scope) {
    setLoadingTasks(true);
    try {
      const nextTasks = await requestTasks(activeScope);
      setTasks(nextTasks);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingTasks(false);
    }
  }

  async function loadAdminUsers() {
    if (initialUser.role !== "ADMIN") {
      return;
    }

    setLoadingAdminUsers(true);
    try {
      const users = await requestAdminUsers();
      setAdminUsers(users);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingAdminUsers(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function syncTasks() {
      setLoadingTasks(true);

      try {
        const nextTasks = await requestTasks(scope);

        if (isMounted) {
          setTasks(nextTasks);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.message);
        }
      } finally {
        if (isMounted) {
          setLoadingTasks(false);
        }
      }
    }

    syncTasks();

    return () => {
      isMounted = false;
    };
  }, [scope]);

  useEffect(() => {
    if (initialUser.role !== "ADMIN") {
      return undefined;
    }

    let isMounted = true;

    async function syncAdminUsers() {
      setLoadingAdminUsers(true);

      try {
        const users = await requestAdminUsers();

        if (isMounted) {
          setAdminUsers(users);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.message);
        }
      } finally {
        if (isMounted) {
          setLoadingAdminUsers(false);
        }
      }
    }

    syncAdminUsers();

    return () => {
      isMounted = false;
    };
  }, [initialUser.role]);

  function resetTaskForm() {
    setTaskForm(emptyTask);
    setEditingTaskId(null);
  }

  function handleTaskSubmit(event) {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch(
        editingTaskId ? `/api/v1/tasks/${editingTaskId}` : "/api/v1/tasks",
        {
          method: editingTaskId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskForm),
          credentials: "include",
        }
      );
      const payload = await response.json();

      if (!response.ok) {
        toast.error(extractError(payload));
        return;
      }

      toast.success(payload.message || "Task saved.");
      resetTaskForm();
      await loadTasks(scope);
      await loadAdminUsers();
    });
  }

  function handleDelete(taskId) {
    startTransition(async () => {
      const response = await fetch(`/api/v1/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(extractError(payload));
        return;
      }

      toast.success(payload.message || "Task deleted.");

      if (editingTaskId === taskId) {
        resetTaskForm();
      }

      await loadTasks(scope);
      await loadAdminUsers();
    });
  }

  function handleEdit(task) {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
    });
  }

  function handleLogout() {
    startTransition(async () => {
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Unable to log out.");
        return;
      }

      toast.success("Logged out.");
      router.push("/");
      router.refresh();
    });
  }

  const totalDone = tasks.filter((task) => task.status === "DONE").length;
  const totalOpen = tasks.length - totalDone;

  return (
    <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
      <div className="space-y-6">
        <div className="glass-card rounded-[32px] p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-[11px]">Session</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
                {initialUser.email}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="ghost-button rounded-full px-4 py-2 text-sm font-semibold transition"
            >
              Logout
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="stat-chip rounded-[24px] p-4">
              <p className="eyebrow text-[11px]">Role</p>
              <p className="metric-value mt-4 text-3xl font-semibold">
                {initialUser.role}
              </p>
            </div>
            <div className="stat-chip rounded-[24px] p-4">
              <p className="eyebrow text-[11px]">Open Tasks</p>
              <p className="metric-value mt-4 text-3xl font-semibold">{totalOpen}</p>
            </div>
            <div className="stat-chip rounded-[24px] p-4">
              <p className="eyebrow text-[11px]">Completed</p>
              <p className="metric-value mt-4 text-3xl font-semibold">{totalDone}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[32px] p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-[11px]">
                {editingTaskId ? "Edit Task" : "Create Task"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                {editingTaskId ? "Update your task" : "Add a new task"}
              </h2>
            </div>
            {editingTaskId ? (
              <button
                type="button"
                onClick={resetTaskForm}
                className="ghost-button rounded-full px-4 py-2 text-sm font-semibold transition"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleTaskSubmit}>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Title
              </span>
              <input
                type="text"
                required
                minLength={3}
                value={taskForm.title}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="glass-input w-full rounded-[20px] px-4 py-3"
                placeholder="Ship admin audit trail"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Description
              </span>
              <textarea
                rows={5}
                value={taskForm.description}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="glass-input w-full rounded-[20px] px-4 py-3"
                placeholder="Describe the work item or acceptance criteria."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Status
              </span>
              <select
                value={taskForm.status}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
                className="glass-input w-full rounded-[20px] px-4 py-3"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </label>

            <button
              type="submit"
              className="glow-button w-full rounded-full px-5 py-3 text-sm font-semibold transition"
            >
              {editingTaskId ? "Update Task" : "Create Task"}
            </button>
          </form>
        </div>

        {initialUser.role === "ADMIN" ? (
          <div className="glass-card rounded-[32px] p-6 md:p-8">
            <p className="eyebrow text-[11px]">Admin View</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <h2 className="text-3xl font-semibold tracking-[-0.04em]">
                Registered users
              </h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                {loadingAdminUsers ? "..." : adminUsers.length}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {adminUsers.map((user) => (
                <div key={user.id} className="glass-panel rounded-[22px] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="muted-text font-mono text-xs">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{user.role}</p>
                      <p className="muted-text text-xs">{user.taskCount} tasks</p>
                    </div>
                  </div>
                </div>
              ))}
              {!loadingAdminUsers && adminUsers.length === 0 ? (
                <p className="muted-text text-sm">No users found.</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="glass-card rounded-[32px] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-[11px]">Task Feed</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              {initialUser.role === "ADMIN" && scope === "all"
                ? "All platform tasks"
                : "Your current work"}
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {initialUser.role === "ADMIN" ? (
              <div className="flex rounded-full border border-[var(--line)] bg-white/5 p-1">
                {[
                  { label: "My tasks", value: "mine" },
                  { label: "All tasks", value: "all" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setScope(option.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      scope === option.value
                        ? "bg-white text-[#08111f]"
                        : "text-[var(--text-soft)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks"
              className="glass-input rounded-full px-4 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {loadingTasks ? (
            <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/5 p-8 text-center muted-text">
              Loading tasks...
            </div>
          ) : null}

          {!loadingTasks && filteredTasks.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/5 p-8 text-center muted-text">
              No tasks found for the current filter.
            </div>
          ) : null}

          {!loadingTasks
            ? filteredTasks.map((task) => (
                <article key={task.id} className="glass-panel rounded-[28px] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`status-pill rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                        {initialUser.role === "ADMIN" && scope === "all" ? (
                          <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-100">
                            {task.owner.name}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
                        {task.title}
                      </h3>
                      <p className="soft-text mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-7">
                        {task.description || "No description provided."}
                      </p>
                    </div>

                    <div className="text-right text-xs uppercase tracking-[0.18em] muted-text">
                      <p>Updated</p>
                      <p className="mt-2 font-mono text-[11px] tracking-normal text-[var(--foreground)]">
                        {new Date(task.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(task)}
                      className="glow-button rounded-full px-4 py-2 text-sm font-semibold transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      className="rounded-full border border-red-300/20 bg-red-300/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-300/15"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            : null}
        </div>
      </div>
    </section>
  );
}
