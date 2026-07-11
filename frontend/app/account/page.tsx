"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL, saveToken } from "@/lib/auth";

export default function AccountPage() {
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setErrors({});
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch(`${API_URL}/api/auth/${signup ? "signup" : "login"}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
      const body = await response.json();
      if (!response.ok) { setErrors(Object.fromEntries(Object.entries(body.errors || {}).map(([key, value]) => [key, String((value as string[])[0])] ))); throw new Error(body.message); }
      saveToken(body.token);
      router.push(body.data.is_admin ? "/admin" : "/portal");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to sign in."); }
    finally { setBusy(false); }
  }

  return <section className="section container-pad"><div className="mx-auto max-w-xl"><div className="mb-7 text-center"><p className="eyebrow">Secure portal</p><h1 className="mt-3 text-4xl font-black text-navy">{signup ? "Create your student account" : "Sign in to your account"}</h1><p className="mt-3 text-slate-600">{signup ? "Register before submitting and tracking your application." : "Students and administrators use the same secure sign-in."}</p></div><form onSubmit={submit} className="card !p-8"><div className="grid gap-5">{signup&&<><label><span className="label">Full name *</span><input name="name" className="field"/>{errors.name&&<small className="text-red-600">{errors.name}</small>}</label><label><span className="label">Phone number</span><input name="phone" type="tel" className="field"/></label></>}<label><span className="label">Email address *</span><input name="email" type="email" className="field"/>{errors.email&&<small className="text-red-600">{errors.email}</small>}</label><label><span className="label">Password *</span><input name="password" type="password" className="field"/>{errors.password&&<small className="text-red-600">{errors.password}</small>}</label>{signup&&<label><span className="label">Confirm password *</span><input name="password_confirmation" type="password" className="field"/></label>}{message&&<div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</div>}<button disabled={busy} className="btn-primary !rounded-md">{busy?"Please wait…":signup?"Create Account":"Sign In"}</button></div></form><p className="mt-5 text-center text-sm text-slate-600">{signup?"Already registered? ":"New student? "}<button onClick={()=>{setSignup(!signup);setErrors({});setMessage("")}} className="font-bold text-teal">{signup?"Sign in":"Create an account"}</button></p><p className="mt-3 text-center text-sm"><Link href="/" className="text-slate-500 hover:text-navy">← Return to website</Link></p></div></section>;
}
