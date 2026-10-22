"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL, api, clearToken, token } from "@/lib/auth";
import { useAdmissions } from "@/lib/admissions";

type Application = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  cnic_bform: string;
  program: string;
  status: string;
  created_at: string;
  percentage: string;
  previous_qualification: string;
  address: string;
  notes?: string;
  messages_count: number;
  messages?: { id: number; message: string; created_at: string; sender?: { name: string } }[];
};

const statuses = [
  ["pending", "Pending"],
  ["under_review", "Under review"],
  ["documents_required", "Documents required"],
  ["test_scheduled", "Test scheduled"],
  ["accepted", "Accepted"],
  ["rejected", "Rejected"],
];

export default function AdminPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const router = useRouter();
  const { admissionsOpen, hideAdmissionsTab, updateSettings, saving } = useAdmissions();

  const load = useCallback(async () => {
    try {
      const result = await api("/api/admin/applications");
      setApps(result.data);
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 401 || err.status === 403) router.replace("/account");
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function open(id: number) {
    const result = await api(`/api/admin/applications/${id}`);
    setSelected(result.data);
  }

  async function updateStatus(value: string) {
    if (!selected) return;
    await api(`/api/admin/applications/${selected.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    await open(selected.id);
    await load();
  }

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const form = e.currentTarget;
    const message = String(new FormData(form).get("message") || "");
    await api(`/api/admin/applications/${selected.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    form.reset();
    await open(selected.id);
    await load();
  }

  async function download(path: string, name: string) {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!response.ok) {
      setError("Download could not be prepared.");
      return;
    }
    const url = URL.createObjectURL(await response.blob());
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearToken();
    router.push("/account");
  }

  async function handleToggleAdmissions() {
    const next = !admissionsOpen;
    const ok = await updateSettings({ admissions_open: next });
    if (ok) {
      setNotice(
        next
          ? "Admissions OPEN: 'Apply Now' buttons and 'Admissions Open' tabs are now active across the website."
          : "Admissions CLOSED: 'Apply Now' buttons and 'Admissions Open' tabs are now hidden from the website."
      );
    } else {
      setNotice(
        next
          ? "Admissions set to OPEN (local mode)."
          : "Admissions set to CLOSED (local mode)."
      );
    }
    setTimeout(() => setNotice(null), 5000);
  }

  async function handleToggleHideTab(e: React.ChangeEvent<HTMLInputElement>) {
    const nextVal = e.target.checked;
    await updateSettings({ hide_admissions_tab: nextVal });
    setNotice(
      nextVal
        ? "'Admissions' navigation tab is now hidden when admissions are closed."
        : "'Admissions' navigation tab is visible."
    );
    setTimeout(() => setNotice(null), 5000);
  }

  const filtered = apps.filter((a) =>
    `${a.full_name} ${a.email} ${a.cnic_bform} ${a.program}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="min-h-screen bg-slate-100 py-10">
      <div className="container-pad">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 rounded-xl bg-navy p-7 text-white md:flex-row md:items-center shadow-md">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-200">
              Secure Administration
            </p>
            <h1 className="mt-2 text-3xl font-black">Admissions Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="rounded-md border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              View Site ↗
            </Link>
            <button
              onClick={logout}
              className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-bold hover:bg-white hover:text-navy transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Admissions Control / Flip Switch Card */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-black text-navy">
                  Admissions Status &amp; Visibility Control
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                    admissionsOpen
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      admissionsOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                    }`}
                  />
                  {admissionsOpen ? "Admissions OPEN" : "Admissions CLOSED"}
                </span>
              </div>
              <p className="text-sm text-slate-600 max-w-2xl">
                {admissionsOpen ? (
                  <span>
                    Admissions are <strong>active</strong>. The <em>Apply Now</em> buttons,{" "}
                    <em>Admissions Open</em> tabs, and online application form are visible to all visitors.
                  </span>
                ) : (
                  <span>
                    Admissions are <strong>closed</strong>. The <em>Apply Now</em> buttons and{" "}
                    <em>Admissions Open</em> tabs/banners are turned off and hidden across the website.
                  </span>
                )}
              </p>
            </div>

            {/* Flip Button Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-2 border border-slate-200">
                <span
                  className={`text-xs font-bold uppercase tracking-wider transition ${
                    !admissionsOpen ? "text-rose-600 font-black" : "text-slate-400"
                  }`}
                >
                  Closed
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={admissionsOpen}
                  aria-label="Toggle admissions open or closed"
                  disabled={saving}
                  onClick={handleToggleAdmissions}
                  className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 ${
                    admissionsOpen ? "bg-emerald-600" : "bg-slate-300"
                  } ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                      admissionsOpen ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>

                <span
                  className={`text-xs font-bold uppercase tracking-wider transition ${
                    admissionsOpen ? "text-emerald-700 font-black" : "text-slate-400"
                  }`}
                >
                  Open
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleAdmissions}
                disabled={saving}
                className={`rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition shadow-sm ${
                  admissionsOpen
                    ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                {admissionsOpen ? "Close Admissions Now" : "Open Admissions Now"}
              </button>
            </div>
          </div>

          {/* Sub-controls & Feedback */}
          <div className="mt-4 border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideAdmissionsTab}
                onChange={handleToggleHideTab}
                className="h-4 w-4 rounded border-slate-300 text-teal focus:ring-teal"
              />
              <span>Also hide the &quot;Admissions&quot; navigation tab when closed</span>
            </label>

            <div>
              {saving ? (
                <span className="font-semibold text-teal">Saving changes…</span>
              ) : notice ? (
                <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">
                  {notice}
                </span>
              ) : (
                <span className="text-slate-400">Controls apply immediately to the website.</span>
              )}
            </div>
          </div>
        </div>

        {error && <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

        {/* Applications List & Review */}
        <div className="mt-7 grid gap-7 xl:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-navy">Applications ({apps.length})</h2>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="field max-w-52"
              />
            </div>
            {busy ? (
              <p className="py-12 text-center text-slate-500">Loading…</p>
            ) : (
              <div className="mt-5 max-h-[720px] space-y-2 overflow-auto">
                {filtered.map((item) => (
                  <button
                    onClick={() => open(item.id)}
                    key={item.id}
                    className={`w-full rounded-lg border p-4 text-left transition hover:border-teal ${
                      selected?.id === item.id ? "border-teal bg-mint" : "border-slate-100"
                    }`}
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-black text-navy">{item.full_name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.program} · #{item.id}
                        </p>
                      </div>
                      <span className="text-xs font-bold uppercase text-teal">
                        {item.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()} · {item.messages_count} messages
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            {!selected ? (
              <div className="grid min-h-96 place-items-center text-center text-slate-500">
                Select an application to review it.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-warm">APPLICATION #{selected.id}</p>
                    <h2 className="mt-1 text-3xl font-black text-navy">{selected.full_name}</h2>
                    <p className="mt-1 text-slate-600">{selected.program}</p>
                  </div>
                  <button
                    onClick={() =>
                      download(`/api/admin/applications/${selected.id}/pdf`, `application-${selected.id}.pdf`)
                    }
                    className="btn-primary !rounded-md"
                  >
                    Download PDF
                  </button>
                </div>

                <div className="mt-6 grid gap-3 rounded-lg bg-slate-50 p-5 text-sm sm:grid-cols-2">
                  <p>
                    <b>Email:</b> {selected.email}
                  </p>
                  <p>
                    <b>Phone:</b> {selected.phone}
                  </p>
                  <p>
                    <b>CNIC/B-form:</b> {selected.cnic_bform}
                  </p>
                  <p>
                    <b>Qualification:</b> {selected.previous_qualification}
                  </p>
                  <p>
                    <b>Percentage:</b> {selected.percentage}%
                  </p>
                  <p>
                    <b>Submitted:</b> {new Date(selected.created_at).toLocaleDateString()}
                  </p>
                  <p className="sm:col-span-2">
                    <b>Address:</b> {selected.address}
                  </p>
                </div>

                <div className="mt-6">
                  <label className="label">Application status</label>
                  <select
                    value={selected.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="field"
                  >
                    {statuses.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6">
                  <p className="label">Submitted documents</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ["cnic", "CNIC / B-form"],
                      ["education", "Educational documents"],
                      ["photo", "Photo"],
                    ].map(([type, label]) => (
                      <button
                        key={type}
                        onClick={() =>
                          download(
                            `/api/admin/applications/${selected.id}/documents/${type}`,
                            `${type}-${selected.id}`
                          )
                        }
                        className="rounded-md border px-4 py-2 text-sm font-bold text-navy hover:bg-mint"
                      >
                        {label} ↓
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-7 border-t pt-6">
                  <h3 className="text-lg font-black text-navy">Messages to student</h3>
                  <div className="mt-3 max-h-52 space-y-2 overflow-auto">
                    {selected.messages?.length ? (
                      selected.messages.map((msg) => (
                        <div key={msg.id} className="rounded-lg bg-mint p-3 text-sm">
                          <p>{msg.message}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {msg.sender?.name || "Admin"} · {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No messages sent yet.</p>
                    )}
                  </div>
                  <form onSubmit={sendMessage} className="mt-4">
                    <textarea
                      name="message"
                      required
                      minLength={3}
                      rows={3}
                      className="field"
                      placeholder="Test schedule, missing documents, interview details…"
                    />
                    <button className="btn-primary mt-3 !rounded-md">Send Message</button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
