import React, { useMemo, useState, useEffect } from "react"; // Added useEffect
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Zap,
  Thermometer,
  Activity,
  Droplets,
  Power,
  Bell,
} from "lucide-react";
import { useUserDataStore } from "@/stores/userDataStore";
import { toast } from "sonner";
import api from "@/services/api";

const COLORS = {
  bg: "bg-[#0b0e14]",
  card: "bg-[#151921]",
  border: "border-[#1f252e]",
  current: "#f59e0b",
  temp: "#ef4444",
  vibration: "#a855f7",
  flow: "#06b6d4",
  accent: "#10b981",
};

const MOTOR_DATA = [
  { time: "01:39 PM", current: 15, temp: 42, vibration: 2.1, flow: 120 },
  { time: "01:39:30", current: 18, temp: 45, vibration: 2.8, flow: 135 },
  { time: "01:40 PM", current: 19.5, temp: 46, vibration: 2.85, flow: 137.9 },
  { time: "01:40:30", current: 17, temp: 44, vibration: 2.4, flow: 130 },
  { time: "01:41 PM", current: 19, temp: 47, vibration: 2.9, flow: 140 },
  { time: "01:41:30", current: 20.2, temp: 48, vibration: 3.1, flow: 142 },
];

const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Custom Tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1f29] border border-gray-700 p-3 rounded-lg shadow-xl">
        <p className="text-gray-400 text-[10px] font-bold mb-2 uppercase">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Metric Card ──────────────────────────────────────────────
const MetricCard = ({
  title,
  value,
  unit,
  status,
  trend,
  icon: Icon,
  colorHex,
  statusColor,
}) => (
  <div
    className={`${COLORS.card} ${COLORS.border} border rounded-2xl p-5 relative overflow-hidden group hover:border-gray-700 transition-colors`}
  >
    <div className="flex justify-between items-start mb-4">
      <div
        className="p-2.5 rounded-xl"
        style={{ backgroundColor: `${colorHex}15` }}
      >
        <Icon className="w-6 h-6" style={{ color: colorHex }} />
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-1 rounded-md bg-gray-800/50 ${
          trend >= 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        {trend >= 0 ? "↗" : "↘"} {Math.abs(trend)}%
      </span>
    </div>
    <div>
      <p className="text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-widest">
        {title}
      </p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-2xl font-bold text-white tracking-tight">
          {value}
        </h3>
        <span className="text-gray-600 text-xs font-medium">{unit}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-3">
        <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
          {status}
        </span>
      </div>
    </div>
  </div>
);

// ─── Chart Card (reusable) ────────────────────────────────────
const ChartCard = ({ title, legend, children }) => (
  <div className={`${COLORS.card} rounded-2xl p-5 border ${COLORS.border}`}>
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
        {title}
      </h4>
      {legend && (
        <div className="flex gap-4">
          {legend.map((l) => (
            <div key={l.n} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: l.c }}
              />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {l.n}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
    {children}
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────
const DashboardContent = () => {
  const { hardwareData, chartData } = useUserDataStore();

  // 1. Initialize state using the incoming 'isRunning' from the database (hardwareData)
  // This ensures the button is correct upon refresh.
  const [isRunning, setIsRunning] = useState(hardwareData?.isRunning ?? false);

  // 2. Sync local state with server data (handles cases where data loads slightly after render)
  useEffect(() => {
    if (hardwareData && hardwareData.isRunning !== undefined) {
      setIsRunning(hardwareData.isRunning);
    }
  }, [hardwareData]);

  const safeHardwareData = hardwareData || {
    current: 19.5,
    temperature: 46,
    vibration: 2.85,
    flow: 137.9,
  };

  const transformedChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return MOTOR_DATA;
    }

    return chartData.map((item) => {
      const date = new Date(item.timestamp);
      const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

      return {
        time,
        current: item.current || item.nitrogen || 0,
        temp: item.temperature || item.temp || 0,
        vibration: item.vibration || 0,
        flow: item.flow || item.moisture || 0,
      };
    });
  }, [chartData]);

  const currentVal = safeHardwareData.current ?? 19.5;
  const tempVal = safeHardwareData.temperature ?? 46;
  const vibVal = safeHardwareData.vibration ?? 2.85;
  const flowVal = safeHardwareData.flow ?? 137.9;

  const tempWarning = tempVal >= 55;

  const handlePowerToggle = async () => {
    const newState = !isRunning;
    setIsRunning(newState); // Optimistic UI update

    try {
      await api.post("/user/toggle", { state: newState });
      toast.success(
        newState ? "Pump started successfully" : "Pump stopped successfully",
      );
    } catch {
      toast.error("Failed to toggle pump. Retrying...");
      setIsRunning(!newState); // Revert on error
    }
  };

  return (
    <div
      className={`min-h-screen ${COLORS.bg} p-6 text-gray-100 font-sans selection:bg-blue-500/30`}
    >
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
            MotoX
            <span className="h-4 w-px bg-gray-800" />
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Motor Intelligence v2.0
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-[#151921] px-4 py-2 rounded-xl border border-gray-800">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            System Online
          </span>
        </div>
      </div>

      {/* ── Warnings ── */}
      {tempWarning && (
        <div className="grid grid-cols-1 gap-3 mb-8">
          <div className="bg-[#1c160a] border border-amber-900/30 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 p-1.5 rounded-lg">
                <Bell className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs font-bold text-amber-200/80 uppercase tracking-wide">
                Temperature threshold alert ({tempVal}°C)
              </p>
            </div>
            <span className="text-[10px] font-bold text-amber-600 uppercase">
              Live
            </span>
          </div>
        </div>
      )}

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Current"
          value={currentVal.toFixed(1)}
          unit="A"
          status="Normal"
          trend={2.4}
          icon={Zap}
          colorHex={COLORS.current}
          statusColor="bg-green-500"
        />
        <MetricCard
          title="Temperature"
          value={tempVal.toFixed(0)}
          unit="°C"
          status={tempWarning ? "Warning" : "Normal"}
          trend={2.4}
          icon={Thermometer}
          colorHex={COLORS.temp}
          statusColor={tempWarning ? "bg-amber-500" : "bg-green-500"}
        />
        <MetricCard
          title="Vibration"
          value={vibVal.toFixed(2)}
          unit="mm/s"
          status="Normal"
          trend={0.0}
          icon={Activity}
          colorHex={COLORS.vibration}
          statusColor="bg-green-500"
        />
        <MetricCard
          title="Flow Rate"
          value={flowVal.toFixed(1)}
          unit="L/min"
          status="Normal"
          trend={-1.2}
          icon={Droplets}
          colorHex={COLORS.flow}
          statusColor="bg-green-500"
        />
      </div>

      {/* ── Main Chart + Power Control ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sensor Live Trends */}
        <div
          className={`lg:col-span-2 ${COLORS.card} rounded-3xl p-6 border ${COLORS.border} shadow-2xl`}
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-500">
              Sensor Live Trends
            </h3>
            <div className="flex gap-4">
              {[
                { n: "Current", c: COLORS.current },
                { n: "Temp", c: COLORS.temp },
                { n: "Flow", c: COLORS.flow },
              ].map((l) => (
                <div key={l.n} className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: l.c }}
                  />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {l.n}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transformedChartData}>
                <defs>
                  <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.flow}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.flow}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#1f252e"
                />
                <XAxis
                  dataKey="time"
                  stroke="#374151"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#374151"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="flow"
                  stroke={COLORS.flow}
                  fillOpacity={1}
                  fill="url(#colorFlow)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke={COLORS.current}
                  fill="transparent"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke={COLORS.temp}
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Power Control */}
        <div
          className={`${COLORS.card} rounded-3xl p-8 border ${COLORS.border} flex flex-col items-center justify-between shadow-2xl relative overflow-hidden`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="flex items-center gap-2 self-start mb-4">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="font-black text-[10px] uppercase tracking-widest text-gray-400">
              Power Logic
            </span>
          </div>

          <button
            onClick={handlePowerToggle}
            className={`group relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-700 cursor-pointer ${
              isRunning
                ? "bg-green-500/5 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]"
                : "bg-red-500/5 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)]"
            }`}
          >
            <div
              className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${
                isRunning
                  ? "border-green-500/40 animate-[spin_4s_linear_infinite]"
                  : "border-red-500/40"
              }`}
              style={{ borderStyle: "dashed" }}
            />
            <div
              className={`absolute inset-4 rounded-full border-[6px] ${
                isRunning
                  ? "border-green-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  : "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              } transition-colors duration-700`}
            />
            <Power
              className={`w-12 h-12 relative z-10 ${
                isRunning ? "text-green-500" : "text-red-500"
              } transition-colors duration-700`}
            />
          </button>

          <div className="mt-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic">
              {isRunning ? "Running" : "Stopped"}
            </h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase mt-1 tracking-widest">
              Mode: Standard Operation
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 w-full pt-6 border-t border-gray-800/50">
            <div className="text-center">
              <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">
                Uptime
              </span>
              <p className="text-sm font-mono font-bold text-blue-400 tracking-widest">
                02:34:12
              </p>
            </div>
            <div className="text-center">
              <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">
                Last Start
              </span>
              <p className="text-sm font-bold text-gray-300">08:15 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Thermal */}
        <ChartCard
          title="Thermal Dynamics"
          legend={[{ n: "Temp", c: COLORS.temp }]}
        >
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transformedChartData}>
                <Line
                  type="step"
                  dataKey="temp"
                  stroke={COLORS.temp}
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip content={<CustomTooltip />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Flow Consistency */}
        <ChartCard
          title="Flow Consistency"
          legend={[{ n: "Flow", c: COLORS.flow }]}
        >
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transformedChartData}>
                <Line
                  type="step"
                  dataKey="flow"
                  stroke={COLORS.flow}
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip content={<CustomTooltip />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Vibration */}
        <ChartCard
          title="Vibration Analysis"
          legend={[{ n: "Vibration", c: COLORS.vibration }]}
        >
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transformedChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#1f252e"
                />
                <XAxis
                  dataKey="time"
                  stroke="#374151"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="vibration" radius={[4, 4, 0, 0]}>
                  {transformedChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.vibration > 3.0 ? COLORS.temp : COLORS.vibration
                      }
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Current Draw Chart (full width) ── */}
      <ChartCard
        title="Current Draw Over Time"
        legend={[{ n: "Current", c: COLORS.current }]}
      >
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transformedChartData}>
              <defs>
                <linearGradient
                  id="colorCurrentGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={COLORS.current}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.current}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#1f252e"
              />
              <XAxis
                dataKey="time"
                stroke="#374151"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#374151"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="current"
                stroke={COLORS.current}
                strokeWidth={2.5}
                fill="url(#colorCurrentGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
};

export default DashboardContent;
