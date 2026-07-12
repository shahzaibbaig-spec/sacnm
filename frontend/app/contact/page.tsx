import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import EnquiryForm from "@/components/EnquiryForm";

export const metadata = { title: "Contact" };

const mapUrl = "https://www.google.com/maps/search/?api=1&query=KORT%2C+Mirpur%2C+Azad+Jammu+and+Kashmir";

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="We’re here to answer your questions"
        text="Speak with our college office about admissions, programs or visiting the campus at KORT, Mirpur."
      />
      <section className="section container-pad">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <SectionHeading eyebrow="College office" title="Let’s connect" />
            <div className="space-y-5">
              <div className="card">
                <b className="text-navy">Address</b>
                <p className="mt-2 text-slate-600">KORT, Mirpur, Azad Jammu & Kashmir</p>
              </div>
              <div className="card">
                <b className="text-navy">Admissions enquiries</b>
                <a href="tel:05827404546" className="mt-2 block text-xl font-black text-teal hover:text-navy">
                  05827 404546
                </a>
                <p className="mt-2 text-slate-600">Call the college office or use the secure enquiry form.</p>
              </div>
              <div className="card">
                <b className="text-navy">Office timings</b>
                <p className="mt-2 text-slate-600">Monday–Friday, 9:00 AM–4:00 PM</p>
              </div>
            </div>
          </div>
          <EnquiryForm />
        </div>
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-12 grid min-h-80 place-items-center rounded-3xl bg-gradient-to-br from-teal to-navy text-center text-white transition hover:brightness-110"
        >
          <div>
            <p className="text-5xl" aria-hidden="true">⌖</p>
            <p className="mt-3 text-xl font-bold">Open KORT, Mirpur in Google Maps</p>
            <p className="mt-1 text-slate-200">Mirpur, Azad Jammu & Kashmir ↗</p>
          </div>
        </a>
      </section>
    </>
  );
}
