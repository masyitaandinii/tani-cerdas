"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  Tractor,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { TengkulakRecord, PriceBenchmark } from "@/types";
import { GOVERNMENT_PRICE_BENCHMARKS } from "../lib/constants";
import { fetchBenchmarkPrices } from "@/services/benchmarkService";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function StatsCards() {
  const [records, setRecords] = useState<TengkulakRecord[]>([]);
  const [benchmarks, setBenchmarks] = useState<PriceBenchmark>({
    beras: GOVERNMENT_PRICE_BENCHMARKS.beras,
    gabah: GOVERNMENT_PRICE_BENCHMARKS.gabah,
    updatedBy: "Bapanas",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [recRes, bmData] = await Promise.all([
          fetch("/api/records"),
          fetchBenchmarkPrices(),
        ]);

        if (recRes.ok) {
          const recData = await recRes.json();
          setRecords(Array.isArray(recData) ? recData : recData.data || []);
        }
        if (bmData) {
          setBenchmarks(bmData);
        }
      } catch (err) {
        console.error("Failed to fetch stats data:", err);
        setError("Terjadi kesalahan memuat data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentYear = new Date().getFullYear();
  const recordsThisYear = useMemo(() => {
    return records.filter(
      (r) => new Date(r.timestamp).getFullYear() === currentYear,
    );
  }, [records, currentYear]);

  const trendData = useMemo(() => {
    const kuartals = ["Q1", "Q2", "Q3", "Q4"];
    const labels: Record<string, string> = {
      Q1: "(Jan-Mar)",
      Q2: "(Apr-Jun)",
      Q3: "(Jul-Sep)",
      Q4: "(Okt-Des)",
    };

    return kuartals.map((k) => {
      const kRecords = recordsThisYear.filter((r) => r.kuartal === k);
      const count = kRecords.length;
      const avgB =
        count > 0
          ? kRecords.reduce((acc, r) => acc + r.hargaBeras, 0) / count
          : benchmarks.beras?.target || 13500;
      const avgG =
        count > 0
          ? kRecords.reduce((acc, r) => acc + r.hargaGabah, 0) / count
          : benchmarks.gabah?.target || 6500;
      const totalP =
        count > 0
          ? kRecords.reduce((acc, r) => acc + (r.totalPanen || 0), 0)
          : 0;

      return {
        kuartal: labels[k],
        "Harga Beras": Math.round(avgB),
        "Harga Gabah": Math.round(avgG),
        "Total Panen (Kg)": totalP,
      };
    });
  }, [recordsThisYear, benchmarks]);

  if (error && records.length === 0) {
    return (
      <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 text-sm font-semibold mb-8">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse h-48 bg-gray-200 rounded-[1.75rem] w-full mb-8"></div>
    );
  }

  const bapanasBerasAvg = benchmarks.beras?.target || GOVERNMENT_PRICE_BENCHMARKS.beras.target;
  const bapanasBerasMin = benchmarks.beras?.min || GOVERNMENT_PRICE_BENCHMARKS.beras.min;
  const bapanasBerasMax = benchmarks.beras?.max || GOVERNMENT_PRICE_BENCHMARKS.beras.max;

  const bapanasGabahAvg = benchmarks.gabah?.target || GOVERNMENT_PRICE_BENCHMARKS.gabah.target;
  const bapanasGabahMin = benchmarks.gabah?.min || GOVERNMENT_PRICE_BENCHMARKS.gabah.min;
  const bapanasGabahMax = benchmarks.gabah?.max || GOVERNMENT_PRICE_BENCHMARKS.gabah.max;

  const totalPanenSum = recordsThisYear.reduce(
    (acc, r) => acc + (r.totalPanen || 0),
    0,
  );

  return (
    <div className="flex flex-col gap-8 w-full mb-8">
      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Harga Rata-rata Beras (Bapanas) */}
        <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col justify-between h-full col-span-1 relative overflow-hidden group">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-[#15291b]/10 rounded-2xl flex items-center justify-center text-[#15291b]">
                <CircleDollarSign className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-[#15291b] text-[#d6f837] px-2.5 py-1 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                Bapanas
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#121e14]/60 mb-1">
              Harga Rata-rata Beras
            </p>
            <h3 className="text-3xl font-extrabold text-[#121e14] flex items-baseline gap-1">
              Rp {bapanasBerasAvg.toLocaleString("id-ID")}{" "}
              <span className="text-xs font-semibold text-[#121e14]/50">
                /kg
              </span>
            </h3>
            <div className="mt-3 pt-3 border-t border-[#e2e0d4]/80 flex items-center justify-between text-[11px] font-semibold text-[#121e14]/70">
              <span>HET Acuan Pemerintah:</span>
              <span className="text-[#15291b] font-bold">
                Rp {bapanasBerasMin.toLocaleString("id-ID")} - {bapanasBerasMax.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Harga Rata-rata Gabah (Bapanas) */}
        <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col justify-between h-full col-span-1 relative overflow-hidden group">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-700">
                <Tractor className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-800 text-[#fef08a] px-2.5 py-1 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                Bapanas
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#121e14]/60 mb-1">
              Harga Rata-rata Gabah
            </p>
            <h3 className="text-3xl font-extrabold text-[#121e14] flex items-baseline gap-1">
              Rp {bapanasGabahAvg.toLocaleString("id-ID")}{" "}
              <span className="text-xs font-semibold text-[#121e14]/50">
                /kg
              </span>
            </h3>
            <div className="mt-3 pt-3 border-t border-[#e2e0d4]/80 flex items-center justify-between text-[11px] font-semibold text-[#121e14]/70">
              <span>HPP Acuan Pemerintah:</span>
              <span className="text-amber-800 font-bold">
                Rp {bapanasGabahMin.toLocaleString("id-ID")} - {bapanasGabahMax.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Total Panen Desa (Kg / Ton) */}
        <div className="bg-[#15291b] p-6 sm:p-8 rounded-[1.75rem] border border-white/10 shadow-lg flex flex-col justify-between h-full lg:col-span-2 relative overflow-hidden text-white">
          <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-[#d6f837]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="badge-pill-dark">
                <span className="badge-bullet"></span>
                TOTAL PANEN DESA {currentYear}
              </span>
              <Link
                href="/detail"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#d6f837] hover:text-[#121e14] transition-all flex items-center justify-center text-[#d6f837]"
                title="Lihat Detail Statistik"
              >
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </Link>
            </div>

            <div>
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#d6f837] tracking-tight leading-none">
                {(totalPanenSum / 1000).toLocaleString("id-ID", {
                  maximumFractionDigits: 1,
                })}{" "}
                <span className="text-xl sm:text-2xl font-bold text-white/80">
                  Ton
                </span>
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
                <p className="text-white/70 text-xs sm:text-sm font-medium flex-1">
                  Estimasi akumulasi hasil panen gabah & beras seluruh dusun
                  yang diinputkan resmi oleh Pengelola / Admin Desa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Charts: Tren Harga & Total Panen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className="bg-white p-6 sm:p-8 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col relative overflow-hidden lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
              <span className="badge-pill-light mb-2">
                <span className="badge-bullet-dark"></span>
                TREN HARGA
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121e14]">
                Grafik Pergerakan Harga {currentYear}
              </h3>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 20, right: 25, left: 25, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={true}
                  horizontal={true}
                  stroke="#e2e0d4"
                />
                <XAxis
                  dataKey="kuartal"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#121e14",
                    opacity: 0.7,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  dy={10}
                  padding={{ left: 20, right: 20 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  hide={true}
                  domain={["dataMin - 500", "dataMax + 1000"]}
                />
                <Tooltip
                  cursor={{ fill: "#15291b", opacity: 0.05 }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e0d4",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                    backgroundColor: "#ffffff",
                  }}
                  formatter={(value: unknown) => [
                    `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`,
                    "",
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    paddingBottom: "20px",
                    marginTop: "-20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="Harga Beras"
                  name="Beras"
                  stroke="#15291b"
                  strokeWidth={3}
                  dot={{ fill: "#15291b", strokeWidth: 2, r: 5 }}
                  activeDot={{
                    r: 7,
                    fill: "#d6f837",
                    stroke: "#15291b",
                    strokeWidth: 3,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Harga Gabah"
                  name="Gabah"
                  stroke="#ca8a04"
                  strokeWidth={3}
                  dot={{ fill: "#ca8a04", strokeWidth: 2, r: 5 }}
                  activeDot={{
                    r: 7,
                    fill: "#fef08a",
                    stroke: "#ca8a04",
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col relative overflow-hidden lg:col-span-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
              <span className="badge-pill-light mb-2">
                <span className="badge-bullet-dark"></span>
                HASIL DESA
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#121e14]">
                Total Panen (Kg)
              </h3>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData}
                margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  horizontal={true}
                  stroke="#e2e0d4"
                />
                <XAxis
                  dataKey="kuartal"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#121e14",
                    opacity: 0.7,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  dy={10}
                />
                <YAxis hide={true} />
                <Tooltip
                  cursor={{ fill: "#15291b", opacity: 0.05 }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e0d4",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                    backgroundColor: "#ffffff",
                  }}
                  formatter={(value: unknown) => [
                    `${Math.round(Number(value) || 0).toLocaleString("id-ID")} Kg`,
                    "Panen",
                  ]}
                />
                <Bar
                  dataKey="Total Panen (Kg)"
                  name="Panen"
                  fill="#15291b"
                  radius={[6, 6, 0, 0]}
                  barSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
