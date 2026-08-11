"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useAppStore } from "./lib/store";
import { Navbar } from "./components/Navbar";
import { StatsCards } from "./components/StatsCards";
import { DashboardCharts } from "./components/DashboardCharts";
import { DusunDistributionCard } from "./components/DusunDistributionCard";
import { ChatbotSection } from "./components/ChatbotSection";
import {
  Filter,
  Bot,
  ArrowUpRight,
  Lightbulb,
} from "lucide-react";

export default function Home() {
  const { setChatbotOpen } = useAppStore();
  const [filterLevel, setFilterLevel] = useState<"Desa" | "Dusun">("Desa");
  const [selectedDusun, setSelectedDusun] = useState<number>(1);
  const [selectedKuartal, setSelectedKuartal] = useState<string>("ALL");

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

        <div
          id="grafik"
          className="bg-white p-5 rounded-2xl border border-[#e2e0d4] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-28 z-30 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-[#121e14]/80">
            <div className="p-1.5 bg-[#15291b] text-[#d6f837] rounded-lg">
              <Filter className="w-4 h-4" />
            </div>
            <span>Filter Data Panen:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex bg-[#f4f3ea] p-1 border border-[#e2e0d4] rounded-xl overflow-hidden">
              <div
                className="absolute top-1 bottom-1 bg-[#15291b] rounded-lg shadow-sm transition-all duration-300 ease-out"
                style={{
                  left: filterLevel === "Desa" ? "4px" : "calc(50% + 2px)",
                  width: "calc(50% - 6px)",
                }}
              />

              <button
                onClick={() => setFilterLevel("Desa")}
                className={`relative z-10 px-4 py-2 text-xs font-bold transition-colors duration-300 ${
                  filterLevel === "Desa"
                    ? "text-[#d6f837]"
                    : "text-[#121e14]/70 hover:text-[#121e14]"
                }`}
              >
                Tingkat Desa
              </button>
              <button
                onClick={() => setFilterLevel("Dusun")}
                className={`relative z-10 px-4 py-2 text-xs font-bold transition-colors duration-300 ${
                  filterLevel === "Dusun"
                    ? "text-[#d6f837]"
                    : "text-[#121e14]/70 hover:text-[#121e14]"
                }`}
              >
                Tingkat Dusun
              </button>
            </div>

            <div
              className={`transition-all duration-300 ease-out overflow-hidden ${
                filterLevel === "Dusun"
                  ? "max-w-[160px] opacity-100 scale-100"
                  : "max-w-0 opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <select
                value={selectedDusun}
                onChange={(e) => setSelectedDusun(Number(e.target.value))}
                className="w-full px-4 py-2 bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl text-xs font-bold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
              >
                {[1, 2, 3, 4].map((d) => (
                  <option key={d} value={d}>
                    Dusun {d}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedKuartal}
              onChange={(e) => setSelectedKuartal(e.target.value)}
              className="px-4 py-2 bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl text-xs font-bold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
            >
              <option value="ALL">Semua Periode</option>
              <option value="Q1">Periode 1 (Jan-Mar)</option>
              <option value="Q2">Periode 2 (Apr-Jun)</option>
              <option value="Q3">Periode 3 (Jul-Sep)</option>
              <option value="Q4">Periode 4 (Okt-Des)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DashboardCharts
              filterLevel={filterLevel}
              selectedDusun={selectedDusun}
              selectedKuartal={selectedKuartal}
            />
          </div>
          <div className="lg:col-span-1">
            <DusunDistributionCard selectedKuartal={selectedKuartal} />
          </div>
        </div>
        <div
          id="bot"
          className="bg-[#15291b] p-8 sm:p-10 rounded-[2rem] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative border border-white/10"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#d6f837]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="relative z-10 flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#d6f837] rounded-xl text-[#121e14]">
                <Lightbulb className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Butuh Bantuan atau Informasi Terkini?
              </h3>
            </div>
            <p className="text-white/80 max-w-2xl text-base leading-relaxed">
              Tanya TaniBot AI tentang harga standar beras, perkiraan waktu
              panen, rekomendasi pupuk, hingga panduan pengelolaan hasil panen
              secara detail.
            </p>
          </div>
          <button
            onClick={() => setChatbotOpen(true)}
            className="btn-neon text-sm sm:text-base font-bold py-4 px-8 shrink-0 relative z-10 text-[#0f1a10]"
          >
            <Bot className="w-5 h-5 stroke-[2.5]" />
            <span>Tanya TaniBot AI</span>
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </main>

      <ChatbotSection />
    </div>
  );
}
