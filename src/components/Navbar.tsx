import React from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Activity, 
  Terminal, 
  FileCode2, 
  GraduationCap
} from "lucide-react";
import { SafetyState, SystemStatus } from "../types";

interface NavbarProps {
  status: SystemStatus;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onTriggerDemo: (enable: boolean, scenario?: number) => void;
  onReset: () => void;
  onRunTest: (testNumber: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  activeTab,
  setActiveTab,
  isAudioMuted,
  onToggleAudio,
  onTriggerDemo,
  onReset,
  onRunTest,
}) => {
  const getStatusBadge = (state: SafetyState) => {
    switch (state) {
      case "CRITICAL":
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-950/80 border border-red-500/60 text-red-300 font-semibold animate-pulse shadow-sm shadow-red-900/30">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="tracking-wide">CRITICAL ALERT</span>
          </div>
        );
      case "WARNING":
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/80 border border-amber-500/60 text-amber-300 font-semibold shadow-sm shadow-amber-900/30">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="tracking-wide">SYSTEM WARNING</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-semibold shadow-sm shadow-emerald-900/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="tracking-wide">SYSTEM NORMAL</span>
          </div>
        );
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-slate-100">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">
                IoT-Enabled Industrial Safety Monitoring System
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                ESP32 HW Rev 2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-Hazard Industrial Autonomous Interlock & Cloud SCADA Telemetry
            </p>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {getStatusBadge(status.state)}

          {/* Audio Beeper Toggle */}
          <button
            onClick={onToggleAudio}
            title={isAudioMuted ? "Enable Buzzer Audio Simulation" : "Mute Buzzer Audio"}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isAudioMuted
                ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                : "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm"
            }`}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400 animate-bounce" />}
            <span className="hidden sm:inline">{isAudioMuted ? "Muted" : "Buzzer Audio ON"}</span>
          </button>

          {/* Demo Mode Toggle */}
          <button
            onClick={() => onTriggerDemo(!status.demoMode)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
              status.demoMode
                ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-900/40"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {status.demoMode ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{status.demoMode ? `Demo: Scen ${status.currentScenario} (${status.demoTimerRemaining}s)` : "Run Demo Mode"}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            title="Reset system to default normal factory state"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Quick Demonstration Scenario Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400 whitespace-nowrap uppercase tracking-wider text-[11px] pr-1">
            Faculty Quick Tests:
          </span>
          <button
            onClick={() => onRunTest(1)}
            className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-slate-700/80 whitespace-nowrap transition-colors"
          >
            Test 1: Normal
          </button>
          <button
            onClick={() => onRunTest(2)}
            className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-red-300 border border-slate-700/80 whitespace-nowrap transition-colors"
          >
            Test 2: Gas Alert (&gt;750)
          </button>
          <button
            onClick={() => onRunTest(3)}
            className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-red-300 border border-slate-700/80 whitespace-nowrap transition-colors"
          >
            Test 3: Temp Alert (&gt;55°C)
          </button>
          <button
            onClick={() => onRunTest(4)}
            className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-700/80 whitespace-nowrap transition-colors"
          >
            Test 4: Vibration
          </button>
          <button
            onClick={() => onRunTest(5)}
            className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-red-300 border border-slate-700/80 whitespace-nowrap transition-colors"
          >
            Test 5: Distance (&lt;30cm)
          </button>
          <button
            onClick={() => onRunTest(6)}
            className="px-2.5 py-1 rounded bg-red-950/50 hover:bg-red-900/60 text-red-200 border border-red-800/60 font-semibold whitespace-nowrap transition-colors"
          >
            Test 6: Multi-Hazard Crisis
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "simulator"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Virtual Hardware Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "dashboard"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>IoT SCADA Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("serial")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "serial"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Serial Monitor (115200)</span>
          </button>

          <button
            onClick={() => setActiveTab("wiring")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "wiring"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Wokwi & Wiring Schematics</span>
          </button>

          <button
            onClick={() => setActiveTab("presentation")}
            className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "presentation"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Faculty Defense Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
