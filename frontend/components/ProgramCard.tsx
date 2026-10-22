"use client";

import Link from "next/link";
import type { Program } from "@/lib/data";
import { useAdmissions } from "@/lib/admissions";

export default function ProgramCard({ program }: { program: Program }) {
  const { admissionsOpen } = useAdmissions();

  return (
    <article className="card flex h-full flex-col">
      <div className="mb-6 flex items-start justify-between gap-4">
        <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-teal">
          {program.duration}
        </span>
        <span className="text-2xl text-teal">✦</span>
      </div>
      <h3 className="text-2xl font-black text-navy">{program.name}</h3>
      <p className="mt-3 flex-1 leading-7 text-slate-600">{program.description}</p>
      <dl className="my-6 space-y-2 border-y border-slate-100 py-4 text-sm">
        <div>
          <dt className="font-bold text-navy">Eligibility</dt>
          <dd className="text-slate-600">{program.eligibility}</dd>
        </div>
        <div>
          <dt className="font-bold text-navy">Gender</dt>
          <dd className="text-slate-600">{program.gender}</dd>
        </div>
      </dl>
      {admissionsOpen ? (
        <Link
          href={`/apply?program=${encodeURIComponent(program.name)}`}
          className="font-bold text-teal hover:text-navy"
        >
          Apply Now →
        </Link>
      ) : (
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-400">Admissions Closed</span>
          <Link href="/contact" className="font-semibold text-teal hover:underline">
            Inquire →
          </Link>
        </div>
      )}
    </article>
  );
}
