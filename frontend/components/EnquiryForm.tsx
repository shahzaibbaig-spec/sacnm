"use client";

import { FormEvent, useState } from "react";
import { API_URL } from "@/lib/auth";

type Notice = { ok: boolean; text: string } | null;

export default function EnquiryForm() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    setBusy(true);
    setNotice(null);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/api/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (body.errors) {
          const validationErrors: Record<string, string> = {};
          Object.entries(body.errors).forEach(([key, value]) => {
            validationErrors[key] = Array.isArray(value) ? String(value[0]) : String(value);
          });
          setErrors(validationErrors);
        }
        throw new Error(body.message || "Please check your details and try again.");
      }

      form.reset();
      setNotice({ ok: true, text: body.message });
    } catch (error) {
      setNotice({
        ok: false,
        text: error instanceof Error ? error.message : "Unable to send your enquiry.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h2 className="text-2xl font-black text-navy">Send an enquiry</h2>
      <p className="mt-2 text-sm text-slate-600">Our admissions team will respond using the details you provide.</p>
      <div className="mt-6 grid gap-5">
        {[
          ["full_name", "Full name", "text"],
          ["email", "Email address", "email"],
          ["phone", "Phone number", "tel"],
        ].map(([name, label, type]) => (
          <label key={name}>
            <span className="label">{label}{name !== "phone" && " *"}</span>
            <input name={name} type={type} className="field" aria-invalid={!!errors[name]} />
            {errors[name] && <span className="mt-1 block text-sm text-red-600">{errors[name]}</span>}
          </label>
        ))}
        <label>
          <span className="label">Message *</span>
          <textarea name="message" rows={5} className="field" aria-invalid={!!errors.message} />
          {errors.message && <span className="mt-1 block text-sm text-red-600">{errors.message}</span>}
        </label>
        {notice && (
          <div role="alert" className={`rounded-xl p-4 ${notice.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
            {notice.text}
          </div>
        )}
        <button disabled={busy} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? "Sending…" : "Send Message →"}
        </button>
      </div>
    </form>
  );
}
