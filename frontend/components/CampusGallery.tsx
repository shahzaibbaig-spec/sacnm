"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export interface CampusSlide {
  id: string;
  image: string;
  alt: string;
  tag: string;
  badge: string;
  title: string;
  description: string;
}

const slides: CampusSlide[] = [
  {
    id: "building",
    image: "/images/campus-building.jpg",
    alt: "Shamim Akhtar College of Nursing and Midwifery exterior campus building at KORT, Mirpur, AJK",
    tag: "Campus Architecture",
    badge: "Main College Building",
    title: "Shamim Akhtar College of Nursing & Midwifery",
    description: "Purpose-built modern academic facility at KORT, Mirpur, Azad Jammu & Kashmir, equipped with state-of-the-art learning environments.",
  },
  {
    id: "lobby",
    image: "/images/campus-lobby.png",
    alt: "Spacious college hallway with Vision, Mission and Florence Nightingale mural",
    tag: "Academic Hallway",
    badge: "Vision & Inspiration Hall",
    title: "Guided by Vision, Mission & Florence Nightingale’s Legacy",
    description: "Our inspirational academic corridors honor the core nursing values of compassion, integrity, and ethical patient care.",
  },
];

export default function CampusGallery() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <div className="w-full">
      {/* Main Slideshow Container */}
      <div
        className="group relative h-[380px] sm:h-[480px] md:h-[540px] lg:h-[600px] w-full overflow-hidden rounded-[2rem] bg-navy shadow-soft transition-all duration-300"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        role="region"
        aria-label="Campus Building Gallery"
      >
        {/* Slides */}
        {slides.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={idx === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 95vw, 1200px"
                className={`object-cover object-center transition-transform duration-[6000ms] ease-out ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />
              {/* Cinematic Vignette & Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/35 to-transparent" />

              {/* Caption Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-12 text-white">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-kortgreen px-3.5 py-1 text-xs font-black uppercase tracking-wider text-navy shadow-sm">
                    {slide.tag}
                  </span>
                  <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-teal-100 border border-white/10">
                    {slide.badge}
                  </span>
                </div>
                <h3 className="mt-3 text-2xl font-black leading-tight text-white drop-shadow sm:text-3xl md:text-4xl max-w-3xl">
                  {slide.title}
                </h3>
                <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-slate-200 leading-relaxed drop-shadow">
                  {slide.description}
                </p>
              </div>
            </div>
          );
        })}

        {/* Top Status & Controls */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex items-center gap-2 rounded-full bg-navy/80 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white border border-white/15 shadow-md">
          <span className="tracking-widest">
            0{current + 1} / 0{slides.length}
          </span>
          <span className="text-white/40">|</span>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 text-teal-200 hover:text-white transition"
            title={isPaused ? "Resume auto rotation" : "Pause auto rotation"}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  isPaused ? "bg-amber-400" : "bg-emerald-400 animate-ping opacity-75"
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  isPaused ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
            </span>
            <span>{isPaused ? "Paused" : "Auto-rotating"}</span>
          </button>
        </div>

        {/* Previous Button */}
        <button
          onClick={prevSlide}
          aria-label="Previous campus photo"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-navy/70 text-white backdrop-blur-md transition-all hover:bg-navy hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal active:scale-95 border border-white/15"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          aria-label="Next campus photo"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-navy/70 text-white backdrop-blur-md transition-all hover:bg-navy hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal active:scale-95 border border-white/15"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Bottom Dot Indicators */}
        <div className="absolute bottom-6 right-6 sm:right-10 z-20 hidden sm:flex items-center gap-2 rounded-full bg-navy/60 backdrop-blur-md px-3 py-2 border border-white/10">
          {slides.map((slide, idx) => {
            const isActive = idx === current;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrent(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isActive ? "w-8 bg-warm shadow-sm" : "w-2.5 bg-white/50 hover:bg-white"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Interactive Thumbnail Selector Bar */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slides.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <button
              key={slide.id}
              onClick={() => setCurrent(idx)}
              className={`group flex items-center gap-4 rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                isActive
                  ? "border-teal bg-mint/50 ring-2 ring-teal/30 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-xs">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="96px"
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal">
                    {slide.tag}
                  </span>
                  {isActive && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal" />
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm font-black text-navy group-hover:text-teal transition-colors">
                  {slide.title}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {slide.badge}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
