// import React, { useMemo, useState, useEffect } from "react"; // Added useEffect
// import {
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   Cell,
// } from "recharts";
// import {
//   Zap,
//   Thermometer,
//   Activity,
//   Droplets,
//   Power,
//   Bell,
// } from "lucide-react";
// import { useUserDataStore } from "@/stores/userDataStore";
// import { toast } from "sonner";
// import api from "@/services/api";

// const COLORS = {
//   bg: "bg-[#0b0e14]",
//   card: "bg-[#151921]",
//   border: "border-[#1f252e]",
//   current: "#f59e0b",
//   temp: "#ef4444",
//   vibration: "#a855f7",
//   flow: "#06b6d4",
//   accent: "#10b981",
// };

// const CURRENT_LIMIT = 25;

// // ─── Maximum data points to display per chart ─────────────────
// const MAX_DATA_POINTS = 20;

// const MOTOR_DATA = [
//   { time: "01:39 PM", current: 15, temp: 42, vibration: 2.1, flow: 35 },
//   { time: "01:39:30", current: 18, temp: 45, vibration: 2.8, flow: 40 },
//   { time: "01:40 PM", current: 19.5, temp: 46, vibration: 2.85, flow: 23.5 },
//   { time: "01:40:30", current: 17, temp: 44, vibration: 2.4, flow: 20 },
//   { time: "01:41 PM", current: 19, temp: 47, vibration: 2.9, flow: 10 },
//   { time: "01:41:30", current: 20.2, temp: 48, vibration: 3.1, flow: 28 },
// ];



// const cn = (...classes) => classes.filter(Boolean).join(" ");

// // ─── Custom Tooltip ───────────────────────────────────────────
// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-[#1a1f29] border border-gray-700 p-3 rounded-lg shadow-xl">
//         <p className="text-gray-400 text-[10px] font-bold mb-2 uppercase">
//           {label}
//         </p>
//         {payload.map((entry, index) => (
//           <div
//             key={index}
//             className="flex items-center gap-2 text-sm font-medium"
//           >
//             <div
//               className="w-2 h-2 rounded-full"
//               style={{ backgroundColor: entry.color }}
//             />
//             <span className="text-gray-300">{entry.name}:</span>
//             <span className="text-white">{entry.value}</span>
//           </div>
//         ))}
//       </div>
//     );
//   }
//   return null;
// };

// // ─── Metric Card ──────────────────────────────────────────────
// const MetricCard = ({
//   title,
//   value,
//   unit,
//   status,
//   trend,
//   icon: Icon,
//   colorHex,
//   statusColor,
// }) => (
//   <div
//     className={`${COLORS.card} ${COLORS.border} border rounded-2xl p-5 relative overflow-hidden group hover:border-gray-700 transition-colors`}
//   >
//     <div className="flex justify-between items-start mb-4">
//       <div
//         className="p-2.5 rounded-xl"
//         style={{ backgroundColor: `${colorHex}15` }}
//       >
//         <Icon className="w-6 h-6" style={{ color: colorHex }} />
//       </div>
//       <span
//         className={`text-[10px] font-bold px-2 py-1 rounded-md bg-gray-800/50 ${
//           trend >= 0 ? "text-green-400" : "text-red-400"
//         }`}
//       >
//         {trend >= 0 ? "↗" : "↘"} {Math.abs(trend)}%
//       </span>
//     </div>
//     <div>
//       <p className="text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-widest">
//         {title}
//       </p>
//       <div className="flex items-baseline gap-1">
//         <h3 className="text-2xl font-bold text-white tracking-tight">
//           {value}
//         </h3>
//         <span className="text-gray-600 text-xs font-medium">{unit}</span>
//       </div>
//       <div className="flex items-center gap-1.5 mt-3">
//         <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
//         <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
//           {status}
//         </span>
//       </div>
//     </div>
//   </div>
// );

// // ─── Chart Card (reusable) ────────────────────────────────────
// const ChartCard = ({ title, legend, children }) => (
//   <div className={`${COLORS.card} rounded-2xl p-5 border ${COLORS.border}`}>
//     <div className="flex items-center justify-between mb-6">
//       <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
//         {title}
//       </h4>
//       {legend && (
//         <div className="flex gap-4">
//           {legend.map((l) => (
//             <div key={l.n} className="flex items-center gap-2">
//               <div
//                 className="w-1.5 h-1.5 rounded-full"
//                 style={{ backgroundColor: l.c }}
//               />
//               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                 {l.n}
//               </span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//     {children}
//   </div>
// );

// // ─── Main Dashboard ───────────────────────────────────────────
// const DashboardContent = () => {
//   const { hardwareData, chartData } = useUserDataStore();

//   const [alerts, setAlerts] = useState({
//   current: false,
//   temp: false,
//   vibration: false,
//   flow: false,
// });

//   // 1. Initialize state using the incoming 'isRunning' from the database (hardwareData)
//   // This ensures the button is correct upon refresh.
//   const [isRunning, setIsRunning] = useState(hardwareData?.isRunning ?? false);

//   // 2. Sync local state with server data (handles cases where data loads slightly after render)
//   useEffect(() => {
//     if (hardwareData && hardwareData.isRunning !== undefined) {
//       setIsRunning(hardwareData.isRunning);
//     }
//   }, [hardwareData]);

//   const safeHardwareData = hardwareData || {
//     current: 19.5,
//     temperature: 46,
//     vibration: 2.85,
//     flow: 137.9,
//   };

//   const transformedChartData = useMemo(() => {
//     if (!chartData || chartData.length === 0) {
//       return MOTOR_DATA;
//     }

//     const processed = chartData.map((item) => {
//       const date = new Date(item.timestamp);
//       const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

//       return {
//         time,
//         current: item.current || item.nitrogen || 0,
//         temp: item.temperature || item.temp || 0,
//         vibration: item.vibration || 0,
//         flow: item.flow || item.moisture || 0,
//       };
//     });

//     // ─── Keep only the latest MAX_DATA_POINTS for readability ───
//     return processed.slice(-MAX_DATA_POINTS);
//   }, [chartData]);

//   const currentVal = safeHardwareData.current ?? 19.5;
//   const tempVal = safeHardwareData.temperature ?? 46;
//   const vibVal = safeHardwareData.vibration ?? 2.85;
//   const flowVal = safeHardwareData.flow ?? 137.9;

//   const currentWarning = currentVal > CURRENT_LIMIT;
//   const tempWarning = tempVal > 50;
//   const vibrationWarning = vibVal > 50;
//   const flowWarning = flowVal > 50;

// useEffect(() => {
//   if (currentVal > CURRENT_LIMIT && !alerts.current) {
//     toast.error(`⚠️ High Current Alert: ${currentVal.toFixed(1)}A`);
//     setAlerts((prev) => ({ ...prev, current: true }));
//   } else if (currentVal <= CURRENT_LIMIT && alerts.current) {
//     setAlerts((prev) => ({ ...prev, current: false }));
//   }

//   if (tempVal > 50 && !alerts.temp) {
//     toast.error(`🌡️ High Temperature Alert: ${tempVal.toFixed(1)}°C`);
//     setAlerts((prev) => ({ ...prev, temp: true }));
//   } else if (tempVal <= 50 && alerts.temp) {
//     setAlerts((prev) => ({ ...prev, temp: false }));
//   }

//   if (vibVal > 50 && !alerts.vibration) {
//     toast.error(`📳 High Vibration Alert: ${vibVal.toFixed(1)}`);
//     setAlerts((prev) => ({ ...prev, vibration: true }));
//   } else if (vibVal <= 50 && alerts.vibration) {
//     setAlerts((prev) => ({ ...prev, vibration: false }));
//   }

//   if (flowVal > 50 && !alerts.flow) {
//     toast.error(`💧 High Flow Alert: ${flowVal.toFixed(1)} L/min`);
//     setAlerts((prev) => ({ ...prev, flow: true }));
//   } else if (flowVal <= 50 && alerts.flow) {
//     setAlerts((prev) => ({ ...prev, flow: false }));
//   }
// },[currentVal, tempVal, vibVal, flowVal]);



//   const handlePowerToggle = async () => {
//     const newState = !isRunning;
//     setIsRunning(newState); // Optimistic UI update

//     try {
//       await api.post("/user/toggle", { state: newState });
//       toast.success(
//         newState ? "Pump started successfully" : "Pump stopped successfully",
//       );
//     } catch {
//       toast.error("Failed to toggle pump. Retrying...");
//       setIsRunning(!newState); // Revert on error
//     }
//   };

//   return (
//     <div
//       className={`min-h-screen ${COLORS.bg} p-6 text-gray-100 font-sans selection:bg-blue-500/30`}
//     >
//       {/* ── Header ── */}
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
//             MotoX
//             <span className="h-4 w-px bg-gray-800" />
//             <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
//               Motor Intelligence v2.0
//             </span>
//           </h1>
//         </div>
//         <div className="flex items-center gap-3 bg-[#151921] px-4 py-2 rounded-xl border border-gray-800">
//           <div className="relative flex h-2 w-2">
//             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//             <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
//           </div>
//           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
//             System Online
//           </span>
//         </div>
//       </div>

//       {/* ── Warnings ── */}
//       {(currentWarning ||
//   tempWarning ||
//   vibrationWarning ||
//   flowWarning) && (
//        <div className="grid grid-cols-1 gap-3 mb-8">
//       {currentWarning && (
//         <div className="bg-red-950/30 border border-red-700 p-3 rounded-xl flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <Bell className="w-4 h-4 text-red-500" />
//             <p className="text-xs font-bold text-red-300">
//              Current exceeded {CURRENT_LIMIT}A ({currentVal.toFixed(1)}A)
//             </p>
//           </div>
//         </div>
//       )}

//   {tempWarning && (
//     <div className="bg-amber-950/30 border border-amber-700 p-3 rounded-xl flex items-center justify-between">
//       <div className="flex items-center gap-3">
//         <Bell className="w-4 h-4 text-amber-500" />
//         <p className="text-xs font-bold text-amber-300">
//           Temperature exceeded 50°C ({tempVal.toFixed(1)}°C)
//         </p>
//       </div>
//     </div>
//   )}

//   {vibrationWarning && (
//     <div className="bg-purple-950/30 border border-purple-700 p-3 rounded-xl flex items-center justify-between">
//       <div className="flex items-center gap-3">
//         <Bell className="w-4 h-4 text-purple-500" />
//         <p className="text-xs font-bold text-purple-300">
//           Vibration exceeded 50 ({vibVal.toFixed(1)})
//         </p>
//       </div>
//     </div>
//   )}

//   {flowWarning && (
//     <div className="bg-cyan-950/30 border border-cyan-700 p-3 rounded-xl flex items-center justify-between">
//       <div className="flex items-center gap-3">
//         <Bell className="w-4 h-4 text-cyan-500" />
//         <p className="text-xs font-bold text-cyan-300">
//           Flow exceeded 50 ({flowVal.toFixed(1)})
//         </p>
//       </div>
//     </div>
//   )}
// </div>
// )}


//       {/* ── Metric Cards ── */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <MetricCard
//           title="Current"
//           value={currentVal.toFixed(1)}
//           status={currentWarning ? "Warning" : "Normal"}
//           statusColor={currentWarning ? "bg-red-500" : "bg-green-500"}
//           unit="A"      
//           trend={2.4}
//           icon={Zap}
//           colorHex={COLORS.current}

//         />
//         <MetricCard
//           title="Temperature"
//           value={tempVal.toFixed(0)}
//           unit="°C"     
//           status={tempWarning ? "Warning" : "Normal"}
//           statusColor={tempWarning ? "bg-red-500" : "bg-green-500"}
//           trend={2.4}
//           icon={Thermometer}
//           colorHex={COLORS.temp}
//         />
//         <MetricCard
//           title="Vibration"
//           value={vibVal.toFixed(2)}
//           unit="mm/s"
//           status={vibrationWarning ? "Warning" : "Normal"}
//           statusColor={vibrationWarning ? "bg-red-500" : "bg-green-500"}
//           trend={0.0}
//           icon={Activity}
//           colorHex={COLORS.vibration}
//         />
//         <MetricCard
//           title="Flow Rate"
//           value={flowVal.toFixed(1)}
//           unit="L/min"
//           status={flowWarning ? "Warning" : "Normal"}
//           statusColor={flowWarning ? "bg-red-500" : "bg-green-500"}
//           trend={-1.2}
//           icon={Droplets}
//           colorHex={COLORS.flow}
//         />
//       </div>

//       {/* ── Main Chart + Power Control ── */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//         {/* Sensor Live Trends */}
//         <div
//           className={`lg:col-span-2 ${COLORS.card} rounded-3xl p-6 border ${COLORS.border} shadow-2xl`}
//         >
//           <div className="flex justify-between items-center mb-8">
//             <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-500">
//               Sensor Live Trends
//             </h3>
//             <div className="flex gap-4">
//               {[
//                 { n: "Current", c: COLORS.current },
//                 { n: "Temp", c: COLORS.temp },
//                 { n: "Flow", c: COLORS.flow },
//               ].map((l) => (
//                 <div key={l.n} className="flex items-center gap-2">
//                   <div
//                     className="w-1.5 h-1.5 rounded-full"
//                     style={{ backgroundColor: l.c }}
//                   />
//                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                     {l.n}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="h-72 w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={transformedChartData}>
//                 <defs>
//                   <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
//                     <stop
//                       offset="5%"
//                       stopColor={COLORS.flow}
//                       stopOpacity={0.3}
//                     />
//                     <stop
//                       offset="95%"
//                       stopColor={COLORS.flow}
//                       stopOpacity={0}
//                     />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   vertical={false}
//                   stroke="#1f252e"
//                 />
//                 <XAxis
//                   dataKey="time"
//                   stroke="#374151"
//                   fontSize={10}
//                   tickLine={false}
//                   axisLine={false}
//                 />
//                 <YAxis
//                   stroke="#374151"
//                   fontSize={10}
//                   tickLine={false}
//                   axisLine={false}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Area
//                   type="monotone"
//                   dataKey="flow"
//                   stroke={COLORS.flow}
//                   fillOpacity={1}
//                   fill="url(#colorFlow)"
//                   strokeWidth={3}
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="current"
//                   stroke={COLORS.current}
//                   fill="transparent"
//                   strokeWidth={2}
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="temp"
//                   stroke={COLORS.temp}
//                   fill="transparent"
//                   strokeWidth={2}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Power Control */}
//         <div
//           className={`${COLORS.card} rounded-3xl p-8 border ${COLORS.border} flex flex-col items-center justify-between shadow-2xl relative overflow-hidden`}
//         >
//           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
//           <div className="flex items-center gap-2 self-start mb-4">
//             <Activity className="w-4 h-4 text-blue-500" />
//             <span className="font-black text-[10px] uppercase tracking-widest text-gray-400">
//               Power Logic
//             </span>
//           </div>

//           <button
//             onClick={handlePowerToggle}
//             className={`group relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-700 cursor-pointer ${
//               isRunning
//                 ? "bg-green-500/5 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]"
//                 : "bg-red-500/5 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)]"
//             }`}
//           >
//             <div
//               className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${
//                 isRunning
//                   ? "border-green-500/40 animate-[spin_4s_linear_infinite]"
//                   : "border-red-500/40"
//               }`}
//               style={{ borderStyle: "dashed" }}
//             />
//             <div
//               className={`absolute inset-4 rounded-full border-[6px] ${
//                 isRunning
//                   ? "border-green-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
//                   : "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
//               } transition-colors duration-700`}
//             />
//             <Power
//               className={`w-12 h-12 relative z-10 ${
//                 isRunning ? "text-green-500" : "text-red-500"
//               } transition-colors duration-700`}
//             />
//           </button>

//           <div className="mt-8">
//             <h2 className="text-3xl font-black uppercase tracking-tighter italic">
//               {isRunning ? "Running" : "Stopped"}
//             </h2>
//             <p className="text-gray-500 text-[10px] font-bold uppercase mt-1 tracking-widest">
//               Mode: Standard Operation
//             </p>
//           </div>

//           <div className="grid grid-cols-2 gap-4 mt-8 w-full pt-6 border-t border-gray-800/50">
//             <div className="text-center">
//               <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">
//                 Uptime
//               </span>
//               <p className="text-sm font-mono font-bold text-blue-400 tracking-widest">
//                 02:34:12
//               </p>
//             </div>
//             <div className="text-center">
//               <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">
//                 Last Start
//               </span>
//               <p className="text-sm font-bold text-gray-300">08:15 AM</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Footer Charts ── */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         {/* Thermal */}
//         <ChartCard
//           title="Thermal Dynamics"
//           legend={[{ n: "Temp", c: COLORS.temp }]}
//         >
//           <div className="h-32">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={transformedChartData}>
//                 <Line
//                   type="step"
//                   dataKey="temp"
//                   stroke={COLORS.temp}
//                   strokeWidth={2}
//                   dot={false}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </ChartCard>

//         {/* Flow Consistency */}
//         <ChartCard
//           title="Flow Consistency"
//           legend={[{ n: "Flow", c: COLORS.flow }]}
//         >
//           <div className="h-32">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={transformedChartData}>
//                 <Line
//                   type="step"
//                   dataKey="flow"
//                   stroke={COLORS.flow}
//                   strokeWidth={2}
//                   dot={false}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </ChartCard>

//         {/* Vibration */}
//         <ChartCard
//           title="Vibration Analysis"
//           legend={[{ n: "Vibration", c: COLORS.vibration }]}
//         >
//           <div className="h-32">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={transformedChartData}>
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   vertical={false}
//                   stroke="#1f252e"
//                 />
//                 <XAxis
//                   dataKey="time"
//                   stroke="#374151"
//                   fontSize={10}
//                   tickLine={false}
//                   axisLine={false}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Bar dataKey="vibration" radius={[4, 4, 0, 0]}>
//                   {transformedChartData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={
//                         entry.vibration > 3.0 ? COLORS.temp : COLORS.vibration
//                       }
//                       fillOpacity={0.7}
//                     />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </ChartCard>
//       </div>

//       {/* ── Current Draw Chart (full width) ── */}
//       <ChartCard
//         title="Current Draw Over Time"
//         legend={[{ n: "Current", c: COLORS.current }]}
//       >
//         <div className="h-40">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart data={transformedChartData}>
//               <defs>
//                 <linearGradient
//                   id="colorCurrentGrad"
//                   x1="0"
//                   y1="0"
//                   x2="0"
//                   y2="1"
//                 >
//                   <stop
//                     offset="5%"
//                     stopColor={COLORS.current}
//                     stopOpacity={0.25}
//                   />
//                   <stop
//                     offset="95%"
//                     stopColor={COLORS.current}
//                     stopOpacity={0}
//                   />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid
//                 strokeDasharray="3 3"
//                 vertical={false}
//                 stroke="#1f252e"
//               />
//               <XAxis
//                 dataKey="time"
//                 stroke="#374151"
//                 fontSize={10}
//                 tickLine={false}
//                 axisLine={false}
//               />
//               <YAxis
//                 stroke="#374151"
//                 fontSize={10}
//                 tickLine={false}
//                 axisLine={false}
//               />
//               <Tooltip content={<CustomTooltip />} />
//               <Area
//                 type="monotone"
//                 dataKey="current"
//                 stroke={COLORS.current}
//                 strokeWidth={2.5}
//                 fill="url(#colorCurrentGrad)"
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       </ChartCard>
//     </div>
//   );
// };

// export default DashboardContent;









import React, { useMemo, useState, useEffect } from "react";
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

// ─── Maximum data points to display per chart ─────────────────
const MAX_DATA_POINTS = 20;

const MOTOR_DATA = [
  { time: "01:39 PM", current: 15, temp: 42, vibration: 2.1, flow: 35 },
  { time: "01:39:30", current: 18, temp: 45, vibration: 2.8, flow: 40 },
  { time: "01:40 PM", current: 19.5, temp: 46, vibration: 2.85, flow: 23.5 },
  { time: "01:40:30", current: 17, temp: 44, vibration: 2.4, flow: 20 },
  { time: "01:41 PM", current: 19, temp: 47, vibration: 2.9, flow: 10 },
  { time: "01:41:30", current: 20.2, temp: 48, vibration: 3.1, flow: 28 },
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
  maxValue,
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
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
            {status}
          </span>
        </div>
        {maxValue !== undefined && (
          <span className="text-[9px] font-bold text-gray-600">
            MAX: {maxValue}
          </span>
        )}
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

  // ─── Alert state to prevent spam ─────────────────────────
  const [alerts, setAlerts] = useState({
    current: false,
    temp: false,
    vibration: false,
    flow: false,
  });

  // ─── Shutdown lock to prevent multiple API calls ──────────
  const [isShuttingDown, setIsShuttingDown] = useState(false);

  // ─── Initialize state using the incoming 'isRunning' from the database
  const [isRunning, setIsRunning] = useState(hardwareData?.isRunning ?? false);

  // ─── Sync local state with server data
  useEffect(() => {
    if (hardwareData && hardwareData.isRunning !== undefined) {
      setIsRunning(hardwareData.isRunning);
    }
  }, [hardwareData]);

  // ─── Safe hardware data with fallback ─────────────────────
  const safeHardwareData = hardwareData || {
    current: 19.5,
    temperature: 46,
    vibration: 2.85,
    flow: 137.9,
    isRunning: false,
    maxCurrent: 38,
    maxFlow: 60,
    maxTemperature: 70,
    maxVibration: 25,
  };

  // ─── Extract dynamic thresholds from backend ──────────────
  const thresholds = useMemo(() => ({
    current: safeHardwareData.maxCurrent ?? 38,
    temperature: safeHardwareData.maxTemperature ?? 70,
    vibration: safeHardwareData.maxVibration ?? 25,
    flow: safeHardwareData.maxFlow ?? 60,
  }), [safeHardwareData.maxCurrent, safeHardwareData.maxTemperature, safeHardwareData.maxVibration, safeHardwareData.maxFlow]);

  const transformedChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return MOTOR_DATA;
    }

    const processed = chartData.map((item) => {
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

    return processed.slice(-MAX_DATA_POINTS);
  }, [chartData]);

  const currentVal = safeHardwareData.current ?? 19.5;
  const tempVal = safeHardwareData.temperature ?? 46;
  const vibVal = safeHardwareData.vibration ?? 2.85;
  const flowVal = safeHardwareData.flow ?? 137.9;

  // ─── Dynamic warnings based on backend thresholds ─────────
  const currentWarning = currentVal > thresholds.current;
  const tempWarning = tempVal > thresholds.temperature;
  const vibrationWarning = vibVal > thresholds.vibration;
  const flowWarning = flowVal > thresholds.flow;

  // ─── ANY critical condition ───────────────────────────────
  const anyCritical = currentWarning || tempWarning || vibrationWarning || flowWarning;

  // ─── Auto-shutdown effect ─────────────────────────────────
  useEffect(() => {
    if (!anyCritical || !isRunning || isShuttingDown) return;

    const shutdownPump = async () => {
      setIsShuttingDown(true);
      toast.error("🚨 CRITICAL: Threshold exceeded! Emergency shutdown initiated...", { duration: 5000 });

      try {
        await api.post("/user/toggle", { state: false });
        setIsRunning(false);
        toast.success("Pump emergency stopped successfully");
      } catch (err) {
        toast.error("Emergency shutdown failed! Please stop manually.");
        setIsRunning((prev) => prev); // Revert if needed
      } finally {
        setIsShuttingDown(false);
      }
    };

    shutdownPump();
  }, [anyCritical, isRunning, isShuttingDown]);

  // ─── Alert toast effect ────────────────────────────────────
  useEffect(() => {
    if (currentVal > thresholds.current && !alerts.current) {
      toast.error(`⚠️ High Current Alert: ${currentVal.toFixed(1)}A (Max: ${thresholds.current}A)`);
      setAlerts((prev) => ({ ...prev, current: true }));
    } else if (currentVal <= thresholds.current && alerts.current) {
      setAlerts((prev) => ({ ...prev, current: false }));
    }

    if (tempVal > thresholds.temperature && !alerts.temp) {
      toast.error(`🌡️ High Temperature Alert: ${tempVal.toFixed(1)}°C (Max: ${thresholds.temperature}°C)`);
      setAlerts((prev) => ({ ...prev, temp: true }));
    } else if (tempVal <= thresholds.temperature && alerts.temp) {
      setAlerts((prev) => ({ ...prev, temp: false }));
    }

    if (vibVal > thresholds.vibration && !alerts.vibration) {
      toast.error(`📳 High Vibration Alert: ${vibVal.toFixed(1)} (Max: ${thresholds.vibration})`);
      setAlerts((prev) => ({ ...prev, vibration: true }));
    } else if (vibVal <= thresholds.vibration && alerts.vibration) {
      setAlerts((prev) => ({ ...prev, vibration: false }));
    }

    if (flowVal > thresholds.flow && !alerts.flow) {
      toast.error(`💧 High Flow Alert: ${flowVal.toFixed(1)} L/min (Max: ${thresholds.flow})`);
      setAlerts((prev) => ({ ...prev, flow: true }));
    } else if (flowVal <= thresholds.flow && alerts.flow) {
      setAlerts((prev) => ({ ...prev, flow: false }));
    }
  }, [currentVal, tempVal, vibVal, flowVal, thresholds, alerts]);

  const handlePowerToggle = async () => {
    // ─── Prevent manual start if critical ───────────────────
    if (!isRunning && anyCritical) {
      toast.error("Cannot start pump: Critical thresholds exceeded!");
      return;
    }

    const newState = !isRunning;
    setIsRunning(newState);

    try {
      await api.post("/user/toggle", { state: newState });
      toast.success(
        newState ? "Pump started successfully" : "Pump stopped successfully",
      );
    } catch {
      toast.error("Failed to toggle pump. Retrying...");
      setIsRunning(!newState);
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
      {(currentWarning || tempWarning || vibrationWarning || flowWarning) && (
        <div className="grid grid-cols-1 gap-3 mb-8">
          {currentWarning && (
            <div className="bg-red-950/30 border border-red-700 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-red-500" />
                <p className="text-xs font-bold text-red-300">
                  Current exceeded {thresholds.current}A ({currentVal.toFixed(1)}A)
                </p>
              </div>
              <span className="text-[10px] font-black text-red-400 bg-red-950/50 px-2 py-1 rounded">
                EMERGENCY STOP
              </span>
            </div>
          )}

          {tempWarning && (
            <div className="bg-amber-950/30 border border-amber-700 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-bold text-amber-300">
                  Temperature exceeded {thresholds.temperature}°C ({tempVal.toFixed(1)}°C)
                </p>
              </div>
              <span className="text-[10px] font-black text-amber-400 bg-amber-950/50 px-2 py-1 rounded">
                EMERGENCY STOP
              </span>
            </div>
          )}

          {vibrationWarning && (
            <div className="bg-purple-950/30 border border-purple-700 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-purple-500" />
                <p className="text-xs font-bold text-purple-300">
                  Vibration exceeded {thresholds.vibration} ({vibVal.toFixed(1)})
                </p>
              </div>
              <span className="text-[10px] font-black text-purple-400 bg-purple-950/50 px-2 py-1 rounded">
                EMERGENCY STOP
              </span>
            </div>
          )}

          {flowWarning && (
            <div className="bg-cyan-950/30 border border-cyan-700 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-cyan-500" />
                <p className="text-xs font-bold text-cyan-300">
                  Flow exceeded {thresholds.flow} ({flowVal.toFixed(1)} L/min)
                </p>
              </div>
              <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/50 px-2 py-1 rounded">
                EMERGENCY STOP
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Current"
          value={currentVal.toFixed(1)}
          unit="A"
          status={currentWarning ? "Warning" : "Normal"}
          statusColor={currentWarning ? "bg-red-500" : "bg-green-500"}
          trend={2.4}
          icon={Zap}
          colorHex={COLORS.current}
          maxValue={thresholds.current}
        />
        <MetricCard
          title="Temperature"
          value={tempVal.toFixed(0)}
          unit="°C"
          status={tempWarning ? "Warning" : "Normal"}
          statusColor={tempWarning ? "bg-red-500" : "bg-green-500"}
          trend={2.4}
          icon={Thermometer}
          colorHex={COLORS.temp}
          maxValue={thresholds.temperature}
        />
        <MetricCard
          title="Vibration"
          value={vibVal.toFixed(2)}
          unit="mm/s"
          status={vibrationWarning ? "Warning" : "Normal"}
          statusColor={vibrationWarning ? "bg-red-500" : "bg-green-500"}
          trend={0.0}
          icon={Activity}
          colorHex={COLORS.vibration}
          maxValue={thresholds.vibration}
        />
        <MetricCard
          title="Flow Rate"
          value={flowVal.toFixed(1)}
          unit="L/min"
          status={flowWarning ? "Warning" : "Normal"}
          statusColor={flowWarning ? "bg-red-500" : "bg-green-500"}
          trend={-1.2}
          icon={Droplets}
          colorHex={COLORS.flow}
          maxValue={thresholds.flow}
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

          {/* ── Critical overlay ── */}
          {anyCritical && (
            <div className="absolute inset-0 bg-red-950/10 z-10 pointer-events-none flex items-center justify-center">
              <div className="bg-red-950/80 border border-red-700 px-4 py-2 rounded-lg">
                <span className="text-red-400 text-xs font-black uppercase tracking-widest">
                  Critical Condition
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handlePowerToggle}
            disabled={isShuttingDown}
            className={`group relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
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
            {anyCritical && (
              <p className="text-red-500 text-[10px] font-black uppercase mt-1">
                Start Blocked: Threshold Exceeded
              </p>
            )}
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
                        entry.vibration > thresholds.vibration ? COLORS.temp : COLORS.vibration
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
