import React, { useState, useEffect, useMemo } from "react";
import {
  CircleDollarSign,
  Tractor,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";
import { TengkulakRecord } from "../lib/data";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await fetch("/api/records");
        if (res.ok) {
          const data = await res.json();
          setRecords(data);
        } else {
          setError("Gagal memuat data statistik.");
        }
      } catch (error) {
        console.error("Failed to fetch records:", error);
        setError("Terjadi kesalahan koneksi.");
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, []);

  // Filter records to only include data from the current year
  const currentYear = new Date().getFullYear();
  const recordsThisYear = useMemo(() => {
    return records.filter(
      (r) => new Date(r.timestamp).getFullYear() === currentYear,
    );
  }, [records, currentYear]);

  // Time-series data for line chart (by Kuartal)
  const trendData = useMemo(() => {
    const kuartals = ["Q1", "Q2", "Q3", "Q4"];
    const labels: Record<string, string> = {
      Q1: "Q1 (Jan-Mar)",
      Q2: "Q2 (Apr-Jun)",
      Q3: "Q3 (Jul-Sep)",
      Q4: "Q4 (Okt-Des)",
    };

    return kuartals.map((k) => {
      const kRecords = recordsThisYear.filter((r) => r.kuartal === k);
      const count = kRecords.length;
      const avgB =
        count > 0
          ? kRecords.reduce((acc, r) => acc + r.hargaBeras, 0) / count
          : 0;
      const avgG =
        count > 0
          ? kRecords.reduce((acc, r) => acc + r.hargaGabah, 0) / count
          : 0;
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
  }, [recordsThisYear]);

  if (error)
    return (
      <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 text-sm font-semibold">
        {error}
      </div>
    );
  if (loading)
    return (
      <div className="animate-pulse h-32 bg-gray-200 rounded-[1.75rem] w-full mb-8"></div>
    );
  if (recordsThisYear.length === 0) {
    return (
      <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm mb-8 text-center text-[#121e14]/60 text-sm font-medium">
        Belum ada data untuk tahun {currentYear}.
      </div>
    );
  }

  const totalBeras = recordsThisYear.reduce((acc, r) => acc + r.hargaBeras, 0);
  const avgBeras = totalBeras / recordsThisYear.length;

  const totalGabah = recordsThisYear.reduce((acc, r) => acc + r.hargaGabah, 0);
  const avgGabah = totalGabah / recordsThisYear.length;

  const totalPanenSum = recordsThisYear.reduce(
    (acc, r) => acc + (r.totalPanen || 0),
    0,
  );

  return (
    <div className="flex flex-col gap-8 w-full mb-8">
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Harga Rata-rata Beras */}
        <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col justify-between h-full col-span-1">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-[#15291b]/10 rounded-2xl flex items-center justify-center text-[#15291b]">
                <CircleDollarSign className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#121e14]/60 mb-1">
              Harga Rata-rata Beras
            </p>
            <h3 className="text-3xl font-extrabold text-[#121e14] flex items-baseline gap-1">
              Rp{" "}
              {avgBeras.toLocaleString("id-ID", { maximumFractionDigits: 0 })}{" "}
              <span className="text-xs font-semibold text-[#121e14]/50">
                /kg
              </span>
            </h3>
          </div>
        </div>

        {/* Card 2: Harga Rata-rata Gabah */}
        <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col justify-between h-full col-span-1">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-700">
                <Tractor className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#121e14]/60 mb-1">
              Harga Rata-rata Gabah
            </p>
            <h3 className="text-3xl font-extrabold text-[#121e14] flex items-baseline gap-1">
              Rp{" "}
              {avgGabah.toLocaleString("id-ID", { maximumFractionDigits: 0 })}{" "}
              <span className="text-xs font-semibold text-[#121e14]/50">
                /kg
              </span>
            </h3>
          </div>
        </div>

        {/* Card 3: Total Estimasi Panen (HopeRoot Stat Highlight Card) */}
        <div className="bg-[#15291b] p-6 sm:p-8 rounded-[1.75rem] border border-white/10 shadow-lg flex flex-col justify-between h-full lg:col-span-2 relative overflow-hidden text-white">
          <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-[#d6f837]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="badge-pill-dark">
                <span className="badge-bullet"></span>
                TOTAL PANEN DESA {currentYear}
              </span>
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#d6f837]">
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </span>
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
              <p className="text-white/70 text-xs sm:text-sm mt-2 font-medium">
                Estimasi akumulasi hasil panen gabah & beras dari seluruh dusun
                pada kuartal berjalan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Chart 1: Tren Harga (Kiri, lebih lebar) */}
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
                margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
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
                  formatter={(value: any) => [
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

        {/* Chart 2: Volume Panen (Kanan) */}
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
                  formatter={(value: any) => [
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
