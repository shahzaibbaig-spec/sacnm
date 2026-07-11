"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Programs", "/programs"],
  ["Admissions", "/admissions"],
  ["Apply Online", "/apply"],
  ["Contact", "/contact"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="bg-navy-dark text-xs text-white">
        <div className="container-pad flex h-9 items-center justify-between">
          <p className="hidden sm:block">KORT, Mirpur, Azad Jammu & Kashmir</p>
          <div className="ml-auto flex items-center gap-5 font-semibold">
            <Link href="/admissions" className="hover:text-teal-200">Admissions</Link>
            <Link href="/portal" className="hover:text-teal-200">Student Portal</Link>
            <Link href="/admin" className="hover:text-teal-200">Admin</Link>
          </div>
        </div>
      </div>
      <div className="container-pad flex h-24 items-center justify-between">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden">
            <Image
              src="/images/kort-logo.png"
              alt="Kashmir Orphan Relief Trust logo"
              width={68}
              height={68}
              className="h-[68px] w-[68px] scale-[1.65] object-contain"
              priority
            />
          </span>
          <span className="hidden h-14 w-px bg-slate-200 sm:block" aria-hidden="true" />
          <Image
            src="/images/college-logo.jpg"
            alt="Shamim Akhtar College of Nursing and Midwifery logo"
            width={68}
            height={68}
            className="h-[68px] w-[68px] shrink-0 rounded-full object-cover"
            priority
          />
          <span className="hidden max-w-[280px] text-base font-black leading-tight text-navy sm:block sm:text-lg">
            SHAMIM AKHTAR
            <span className="mt-1 block text-[10px] font-bold tracking-[.08em] text-teal sm:text-xs">
              COLLEGE OF NURSING & MIDWIFERY
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {links.map(([name, href]) => (
            <Link
              key={href}
              href={href}
              className={`border-b-2 py-3 text-sm font-bold transition ${
                path === href ? "border-warm text-navy" : "border-transparent text-slate-600 hover:border-teal hover:text-navy"
              }`}
            >
              {name}
            </Link>
          ))}
          <Link href="/apply" className="btn-primary !rounded-md !px-5 !py-3">Apply Now</Link>
        </nav>
        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="rounded-md border border-slate-200 p-2 text-2xl text-navy lg:hidden"
        >
          ☰
        </button>
      </div>
      {open && (
        <nav className="container-pad grid gap-1 border-t py-3 lg:hidden">
          {links.map(([name, href]) => (
            <Link
              onClick={() => setOpen(false)}
              key={href}
              href={href}
              className={`rounded px-3 py-2 font-semibold ${path === href ? "bg-mint text-navy" : "hover:bg-slate-50"}`}
            >
              {name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
