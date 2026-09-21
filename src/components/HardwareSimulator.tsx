import React from "react";
import { 
  Flame, 
  Thermometer, 
  Droplets, 
  Activity, 
  Ruler, 
  Radio, 
  Fan, 
  Bell, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle,
  Sliders,
  Sparkles
} from "lucide-react";
import { SystemStatus, SensorData } from "../types";

interface HardwareSimulatorProps {
  status: SystemStatus;
  onUpdateSensor: (data: Partial<SensorData>) => void;
}

export const HardwareSimulator: React.FC<HardwareSimulatorProps> = ({
  status,
  onUpdateSensor,
}) => {
  // LCD backlight styles based on current safety state
  const getLcdTheme = () => {
    switch (status.state) {
      case "CRITICAL":
        return {
          bezel: "border-red-900/80 bg-red-950/90",
          screen: "bg-[#450a0a] text-[#fca5a5] border-red-700/60 shadow-[inset_0_2px_12px_rgba(239,68,68,0.35)]",
          label: "text-red-300",
          glow: "border-red-600/50",
        };
      case "WARNING":
        return {
          bezel: "border-amber-900/80 bg-amber-950/90",
          screen: "bg-[#451a03] text-[#fcd34d] border-amber-600/60 shadow-[inset_0_2px_12px_rgba(245,158,11,0.35)]",
          label: "text-amber-300",
          glow: "border-amber-500/50",
        };
      default:
        return {
          bezel: "border-slate-800 bg-slate-950",
          screen: "bg-[#064e3b] text-[#6ee7b7] border-emerald-600/60 shadow-[inset_0_2px_12px_rgba(16,185,129,0.35)]",
          label: "text-emerald-300",
          glow: "border-emerald-600/40",
        };
    }
  };

  const lcdTheme = getLcdTheme();

  return (
    <div className="space-y-6">
      {/* Top Simulation Overview Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Virtual ESP32 Hardware Breadboard &amp; Actuator Bench
            </h2>
            <p className="text-xs text-slate-400">
              Manipulate sensor inputs during runtime to test autonomous fail-safe logic, LCD updates, and actuator interlocking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Active Hazards:</span>
          {status.activeHazards.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {status.activeHazards.map((h, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-red-950/70 border border-red-600/50 text-red-300 font-mono text-[11px] font-semibold"
                >
                  {h}
                </span>
              ))}
            </div>
          ) : (
            <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-600/40 text-emerald-300 font-mono text-[11px] font-semibold">
              0 Active (Safe)
            </span>
          )}
        </div>
      </div>

      {/* Main Hardware Rig: Visual HMI (LCD & Actuators) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 16x2 LCD Display + Status LEDs (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <h3 className="text-sm font-semibold text-slate-200">
                  16x2 Character LCD Display (HD44780 Parallel 4-Bit)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                Pins: RS=21, EN=22, D4=23, D5=16, D6=17, D7=2
              </span>
            </div>

            {/* Realistic LCD Housing */}
            <div className={`p-4 rounded-xl border ${lcdTheme.bezel} transition-all duration-300`}>
              <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400 mb-1.5 px-1">
                <span>HD44780 LCD Module</span>
                <span className="font-semibold text-slate-300">
                  {status.state === "NORMAL"
                    ? `Cycling Screen ${status.lcdScreenIndex + 1} of 3`
                    : "PRIORITY EMERGENCY OVERRIDE"}
                </span>
              </div>

              {/* Dot-matrix screen area */}
              <div
                className={`p-4 sm:p-5 rounded-lg border font-mono text-base sm:text-xl font-bold tracking-[0.2em] select-none transition-colors duration-300 ${lcdTheme.screen}`}
                style={{ textShadow: "0 0 8px currentColor" }}
              >
                <div className="h-7 sm:h-8 flex items-center overflow-hidden border-b border-black/10 pb-1">
                  {status.lcdLine1}
                </div>
                <div className="h-7 sm:h-8 flex items-center overflow-hidden pt-1">
                  {status.lcdLine2}
                </div>
              </div>

              <div className="mt-2 flex justify-between items-center text-[10px] font-mono text-slate-400 px-1">
                <span>Contrast: 10K Pot (VO -&gt; 0.85V)</span>
                <span>Power: 5V VDD / GND</span>
              </div>
            </div>
          </div>

          {/* LED Visual Indicators Row */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Safety Status Indicators (GPIO14, GPIO12, GPIO13)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {/* Green LED */}
              <div className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                status.greenLed
                  ? "bg-emerald-950/50 border-emerald-500/70 shadow-lg shadow-emerald-900/30"
                  : "bg-slate-950/60 border-slate-800 opacity-60"
              }`}>
                <div className="relative mb-2">
                  <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                    status.greenLed
                      ? "bg-emerald-400 border-emerald-300 shadow-[0_0_18px_#10b981]"
                      : "bg-emerald-950 border-emerald-800"
                  }`} />
                </div>
                <span className="text-xs font-bold text-slate-200">NORMAL</span>
                <span className="text-[10px] font-mono text-slate-400">GPIO14 (Green)</span>
              </div>

              {/* Yellow LED */}
              <div className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                status.yellowLed
                  ? "bg-amber-950/50 border-amber-500/70 shadow-lg shadow-amber-900/30 animate-pulse"
                  : "bg-slate-950/60 border-slate-800 opacity-60"
              }`}>
                <div className="relative mb-2">
                  <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                    status.yellowLed
                      ? "bg-amber-400 border-amber-300 shadow-[0_0_18px_#f59e0b]"
                      : "bg-amber-950 border-amber-800"
                  }`} />
                </div>
                <span className="text-xs font-bold text-slate-200">WARNING</span>
                <span className="text-[10px] font-mono text-slate-400">GPIO12 (Yellow)</span>
              </div>

              {/* Red LED */}
              <div className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                status.redLed
                  ? "bg-red-950/60 border-red-500/80 shadow-lg shadow-red-900/40 animate-pulse"
                  : "bg-slate-950/60 border-slate-800 opacity-60"
              }`}>
                <div className="relative mb-2">
                  <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                    status.redLed
                      ? "bg-red-500 border-red-300 shadow-[0_0_22px_#ef4444]"
                      : "bg-red-950 border-red-800"
                  }`} />
                </div>
                <span className="text-xs font-bold text-slate-200">CRITICAL</span>
                <span className="text-[10px] font-mono text-slate-400">GPIO13 (Red)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Active Local Actuators (Fan, Relay, Buzzer) (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Local Actuators &amp; Safety Interlocks
              </h3>
              <span className="text-xs font-mono text-slate-400">24V / 5V Bus</span>
            </div>

            {/* Exhaust Fan Widget with dynamic rotation */}
            <div className={`p-4 rounded-xl border transition-all mb-4 ${
              status.fan
                ? "bg-sky-950/40 border-sky-500/60 shadow-md shadow-sky-950/40"
                : "bg-slate-950/80 border-slate-800"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full border ${
                    status.fan
                      ? "bg-sky-500/20 border-sky-400 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                      : "bg-slate-800 border-slate-700 text-slate-500"
                  }`}>
                    <Fan className={`w-8 h-8 ${status.fan ? "animate-spin" : ""}`} style={{ animationDuration: "0.6s" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">DC Exhaust Fan</h4>
                    <p className="text-xs text-slate-400">
                      Emergency Air Extraction &amp; Thermal Purge
                    </p>
                    <span className="text-[11px] font-mono text-slate-400">
                      Interlock: Relay GPIO5
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono inline-block ${
                    status.fan
                      ? "bg-sky-500 text-slate-950"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}>
                    {status.fan ? "ACTIVE (2800 RPM)" : "STANDBY (0 RPM)"}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {status.fan ? "Air Flow: 140 CFM" : "Air Flow: 0 CFM"}
                  </p>
                </div>
              </div>
            </div>

            {/* 5V Relay Module */}
            <div className={`p-3 rounded-lg border mb-3 flex items-center justify-between ${
              status.relay
                ? "bg-amber-950/30 border-amber-500/50 text-amber-200"
                : "bg-slate-950/80 border-slate-800 text-slate-400"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${
                  status.relay ? "bg-amber-400 shadow-[0_0_10px_#f59e0b]" : "bg-slate-700"
                }`} />
                <div>
                  <span className="text-xs font-semibold text-slate-200">5V Relay Module (GPIO5)</span>
                  <p className="text-[11px] text-slate-400">Contact: {status.relay ? "COM connected to NO (Closed)" : "COM connected to NC (Open)"}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                status.relay ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-slate-800 text-slate-400"
              }`}>
                {status.relay ? "ENERGIZED" : "DE-ENERGIZED"}
              </span>
            </div>

            {/* Piezo Buzzer Widget */}
            <div className={`p-3 rounded-lg border flex items-center justify-between ${
              status.buzzer
                ? "bg-red-950/30 border-red-500/50 text-red-200"
                : "bg-slate-950/80 border-slate-800 text-slate-400"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                  <Bell className={`w-4 h-4 ${status.buzzer ? "text-red-400 animate-bounce" : "text-slate-500"}`} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200">Piezo Acoustic Buzzer (GPIO15)</span>
                  <p className="text-[11px] text-slate-400">
                    Mode: {status.buzzerMode} {status.buzzerMode === "CONTINUOUS" ? "(1050 Hz Siren)" : status.buzzerMode === "INTERMITTENT" ? "(2 Hz Pulse)" : "(Muted)"}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                status.buzzerMode === "CONTINUOUS"
                  ? "bg-red-500 text-slate-950 animate-pulse"
                  : status.buzzerMode === "INTERMITTENT"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-800 text-slate-400"
              }`}>
                {status.buzzerMode}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Uptime: {status.uptimeSeconds}s</span>
            <span>Current Logic State: <strong className="text-slate-200">{status.state}</strong></span>
          </div>
        </div>
      </div>

      {/* Sensor Interactive Workbench */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Interactive Sensor Inputs Workbench (Runtime Controls)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Slide or click buttons to immediately verify state classification
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* 1. MQ-2 Gas Sensor */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-md">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">MQ-2 Gas Sensor</h4>
                  <span className="text-[10px] font-mono text-slate-400">GPIO34 (AO) / GPIO25 (DO)</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                status.gas >= 750
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : status.gas >= 600
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {status.gas} ADC
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0 (Clean)</span>
                <span className="text-amber-400">&gt;600 Warn</span>
                <span className="text-red-400">&gt;750 Crit</span>
                <span>1023 (Sat)</span>
              </div>
              <input
                type="range"
                min="0"
                max="1023"
                value={status.gas}
                onChange={(e) => onUpdateSensor({ gas: Number(e.target.value) })}
                className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => onUpdateSensor({ gas: 310 })}
                className="px-2 py-1 text-[10px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex-1"
              >
                Clean (310)
              </button>
              <button
                onClick={() => onUpdateSensor({ gas: 680 })}
                className="px-2 py-1 text-[10px] font-medium rounded bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-700/60 flex-1"
              >
                Warn (680)
              </button>
              <button
                onClick={() => onUpdateSensor({ gas: 840 })}
                className="px-2 py-1 text-[10px] font-medium rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-700/60 flex-1"
              >
                Leak (840)
              </button>
            </div>
          </div>

          {/* 2. DHT22 Temperature & Humidity */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-md">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">DHT22 Temperature &amp; Hum</h4>
                  <span className="text-[10px] font-mono text-slate-400">GPIO4 (1-Wire Data)</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                status.temperature >= 55
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : status.temperature >= 45
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {status.temperature.toFixed(1)}°C | {status.humidity.toFixed(0)}%
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0°C (Cold)</span>
                <span className="text-amber-400">&gt;45°C Warn</span>
                <span className="text-red-400">&gt;55°C Crit</span>
                <span>80°C</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="0.5"
                value={status.temperature}
                onChange={(e) => onUpdateSensor({ temperature: Number(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => onUpdateSensor({ temperature: 27.5, humidity: 55 })}
                className="px-2 py-1 text-[10px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex-1"
              >
                Normal (27°C)
              </button>
              <button
                onClick={() => onUpdateSensor({ temperature: 48.0, humidity: 45 })}
                className="px-2 py-1 text-[10px] font-medium rounded bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-700/60 flex-1"
              >
                Warm (48°C)
              </button>
              <button
                onClick={() => onUpdateSensor({ temperature: 62.5, humidity: 35 })}
                className="px-2 py-1 text-[10px] font-medium rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-700/60 flex-1"
              >
                Critical (62°C)
              </button>
            </div>
          </div>

          {/* 3. HC-SR04 Ultrasonic Distance */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">HC-SR04 Ultrasonic Sensor</h4>
                  <span className="text-[10px] font-mono text-slate-400">TRIG=18, ECHO=19</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                status.distance < 30
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : status.distance <= 100
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {status.distance} cm
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="text-red-400">&lt;30cm Crit</span>
                <span className="text-amber-400">30-100cm Warn</span>
                <span>&gt;100cm Safe</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                value={status.distance}
                onChange={(e) => onUpdateSensor({ distance: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => onUpdateSensor({ distance: 160 })}
                className="px-2 py-1 text-[10px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex-1"
              >
                Clear (160cm)
              </button>
              <button
                onClick={() => onUpdateSensor({ distance: 65 })}
                className="px-2 py-1 text-[10px] font-medium rounded bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-700/60 flex-1"
              >
                Warn (65cm)
              </button>
              <button
                onClick={() => onUpdateSensor({ distance: 18 })}
                className="px-2 py-1 text-[10px] font-medium rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-700/60 flex-1"
              >
                Close (18cm)
              </button>
            </div>
          </div>

          {/* 4. SW-420 Vibration Sensor */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-yellow-500/10 text-yellow-400 rounded-md">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">SW-420 Vibration Sensor</h4>
                  <span className="text-[10px] font-mono text-slate-400">GPIO27 (Digital In)</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                status.vibration
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {status.vibration ? "VIBRATION ACTIVE" : "STABLE"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Detects abnormal motor oscillation, bearing fatigue, or mechanical impact.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => onUpdateSensor({ vibration: !status.vibration })}
                className={`w-full py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 border ${
                  status.vibration
                    ? "bg-amber-600 hover:bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-900/40"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>{status.vibration ? "Stop Vibration Trigger" : "Trigger Vibration Anomaly"}</span>
              </button>
            </div>
          </div>

          {/* 5. IR Obstacle Proximity Sensor */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-md">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">IR Obstacle Sensor</h4>
                  <span className="text-[10px] font-mono text-slate-400">GPIO26 (Digital In)</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                status.ir
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {status.ir ? "OBJECT PRESENT" : "CLEAR"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Detects immediate object or hand crossing safety optical beam boundary.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => onUpdateSensor({ ir: !status.ir })}
                className={`w-full py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 border ${
                  status.ir
                    ? "bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-900/40"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>{status.ir ? "Clear Optical Beam" : "Obstruct IR Beam (Intrusion)"}</span>
              </button>
            </div>
          </div>

          {/* 6. Failure-Safe Behavior Testing */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-md">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Failure-Safe Fault Injection</h4>
                  <span className="text-[10px] font-mono text-slate-400">Open-Circuit &amp; Timeout Handling</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Requirement 13
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Simulate sensor failure (broken cable, disconnected DHT22) to prove non-crashing graceful degradation.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  onUpdateSensor({
                    sensorFaults: {
                      ...status.sensorFaults,
                      dht: !status.sensorFaults.dht,
                    },
                  })
                }
                className={`px-2.5 py-1.5 rounded text-[11px] font-mono font-medium border text-center transition-colors ${
                  status.sensorFaults.dht
                    ? "bg-red-950/70 border-red-600/70 text-red-300"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                {status.sensorFaults.dht ? "DHT22 Fault [ON]" : "Inject DHT22 Fault"}
              </button>

              <button
                onClick={() =>
                  onUpdateSensor({
                    sensorFaults: {
                      ...status.sensorFaults,
                      gas: !status.sensorFaults.gas,
                    },
                  })
                }
                className={`px-2.5 py-1.5 rounded text-[11px] font-mono font-medium border text-center transition-colors ${
                  status.sensorFaults.gas
                    ? "bg-red-950/70 border-red-600/70 text-red-300"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                {status.sensorFaults.gas ? "MQ2 Fault [ON]" : "Inject MQ-2 Fault"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
