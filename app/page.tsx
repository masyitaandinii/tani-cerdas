"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "./lib/store";
import { StatsCards } from "./components/StatsCards";
import { DashboardCharts } from "./components/DashboardCharts";
import { DusunDistributionCard } from "./components/DusunDistributionCard";
import { ChatbotSection } from "./components/ChatbotSection";
import {
  Filter,
  Users,
  Bot,
  ArrowUpRight,
  Menu,
  X,
  Lightbulb,
} from "lucide-react";

export default function Home() {
  const { setChatbotOpen } = useAppStore();
  const [filterLevel, setFilterLevel] = useState<"Desa" | "Dusun">("Desa");
  const [selectedDusun, setSelectedDusun] = useState<number>(1);
  const [selectedKuartal, setSelectedKuartal] = useState<string>("ALL");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    e.preventDefault();
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] relative selection:bg-[#d6f837] selection:text-[#121e14]">
      <header className="sticky top-4 z-50 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto floating-navbar px-5 h-16 sm:h-18 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <Image
              src="/Logo (3).svg"
              alt="TaniCerdas Logo"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              TaniCerdas
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-bold tracking-wider text-white/80 uppercase">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, "hero")}
              className="hover:text-[#d6f837] transition-colors"
            >
              Beranda
            </a>
            <a
              href="#overview"
              onClick={(e) => handleNavClick(e, "overview")}
              className="hover:text-[#d6f837] transition-colors"
            >
              Ringkasan
            </a>
            <a
              href="#stats"
              onClick={(e) => handleNavClick(e, "stats")}
              className="hover:text-[#d6f837] transition-colors"
            >
              Grafik & Tren
            </a>
            <a
              href="#grafik"
              onClick={(e) => handleNavClick(e, "grafik")}
              className="hover:text-[#d6f837] transition-colors"
            >
              Data Panen
            </a>
          </nav>

          {/* Header CTA / Login Link (Leaf Diagonal Shape) */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/admin"
              className="btn-neon text-xs font-bold uppercase tracking-wider py-2 px-5"
            >
              <Users className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Login</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden max-w-7xl mx-auto mt-2 bg-[#132417]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-top-2 pointer-events-auto">
            <nav className="flex flex-col gap-4 text-sm font-bold tracking-wider text-white/90 uppercase">
              <a
                href="#hero"
                onClick={(e) => handleNavClick(e, "hero")}
                className="text-[#d6f837]"
              >
                Beranda
              </a>
              <a
                href="#overview"
                onClick={(e) => handleNavClick(e, "overview")}
              >
                Ringkasan
              </a>
              <a href="#stats" onClick={(e) => handleNavClick(e, "stats")}>
                Grafik & Tren
              </a>
              <a href="#grafik" onClick={(e) => handleNavClick(e, "grafik")}>
                Data Panen
              </a>
            </nav>
            <div className="pt-2">
              <Link
                href="/admin"
                className="btn-neon w-full text-xs font-bold uppercase tracking-wider py-3 justify-center"
              >
                <Users className="w-4 h-4 stroke-[2.5]" />
                <span>Login</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        )}
      </header>

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
