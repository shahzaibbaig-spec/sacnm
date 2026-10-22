"use client";

import Link from "next/link";
import { useAdmissions } from "@/lib/admissions";

export default function CTASection() {
  const { admissionsOpen } = useAdmissions();

  return (
    <section className="section container-pad">
      <div className="overflow-hidden rounded-[2rem] bg-navy px-7 py-12 text-white shadow-soft md:px-14 md:py-16">
        <p className="eyebrow !text-teal-200">Your future in healthcare starts here</p>
        <div className="mt-3 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <h2 className="max-w-2xl text-3xl font-black md:text-5xl">
              Turn compassion into a meaningful career.
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              {admissionsOpen
                ? "Applications are now open for our nursing and midwifery programs."
                : "Admissions for the current session are currently closed. Inquire with our office for future intake."}
            </p>
          </div>
          {admissionsOpen ? (
            <Link href="/apply" className="btn-primary shrink-0">
              Start Application →
            </Link>
          ) : (
            <Link
              href="/contact"
              className="rounded-xl border border-white/30 px-6 py-4 font-bold text-white transition hover:bg-white hover:text-navy shrink-0"
            >
              Contact Admissions →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
