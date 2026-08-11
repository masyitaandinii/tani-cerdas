import React from "react";
import Image from "next/image";
import { Navbar } from "./components/Navbar";
import { StatsCards } from "./components/StatsCards";
import { ChatbotSection } from "./components/ChatbotSection";
import { DashboardClient } from "./components/DashboardClient";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] relative selection:bg-[#d6f837] selection:text-[#121e14]">
      <Navbar />

      <section
        id="hero"
        className="relative bg-[#132417] text-white min-h-[620px] lg:min-h-[680px] flex flex-col justify-between -mt-24 pt-28"
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/hero.jpg"
            alt="Terraced Rice Fields"
            width={1920}
            height={1080}
            className="w-full h-full object-cover object-center scale-105 filter brightness-90 contrast-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#132417]/85 via-[#132417]/75 to-[#132417]/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#d6f837]/15 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex-1 flex flex-col justify-between w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-stretch py-12 lg:py-16">
            <div className="lg:col-span-8 flex flex-col justify-end space-y-6">
              <div>
                <span className="badge-pill-dark inline-flex items-center">
                  <span className="badge-bullet"></span>
                  COMMUNITY & DASHBOARD PERTANIAN
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] font-sans">
                Wujudkan Pertanian Desa yang Cerdas & Berkelanjutan
              </h1>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-between space-y-6 lg:pl-6 h-fit">
              <div className="my-auto py-4">
                <p className="text-white/85 text-sm sm:text-base leading-relaxed font-medium">
                  Tani Cerdas membantu petani dan kelompok tani mengelola data
                  pertanian secara digital untuk meningkatkan produktivitas dan
                  kesejahteraan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main
        id="overview"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 animate-in fade-in duration-700"
      >
        <div className="space-y-4 pt-4 border-t border-[#e2e0d4] max-w-7xl">
          <span className="badge-pill-light">
            <span className="badge-bullet-dark"></span>
            DATA & ESTIMASI PANEN DESA
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#121e14] tracking-tight leading-[1.15]">
                Kami Hadir Untuk Mendukung Pertanian Desa. Perubahan Dimulai
                Dari Data Terpercaya.
              </h2>
            </div>
            <div className="lg:col-span-4 space-y-4">
              <p className="text-[#121e14]/70 text-lg leading-relaxed">
                Selamat datang di platform TaniCerdas. Pemantauan harga beras,
                gabah, dan distribusi hasil panen di tingkat Desa hingga Dusun
                secara real-time.
              </p>
            </div>
          </div>
        </div>

        <div id="stats">
          <StatsCards />
        </div>

        <DashboardClient />
      </main>

      <ChatbotSection />
    </div>
  );
}
