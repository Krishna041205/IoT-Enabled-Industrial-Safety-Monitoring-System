import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { HardwareSimulator } from "./components/HardwareSimulator";
import { ScadaDashboard } from "./components/ScadaDashboard";
import { SerialTerminal } from "./components/SerialTerminal";
import { CircuitWiringViewer } from "./components/CircuitWiringViewer";
import { PresentationGuide } from "./components/PresentationGuide";
import { buzzerAudio } from "./utils/buzzerAudio";
import { SystemStatus, EventLog, SensorData } from "./types";

const defaultStatus: SystemStatus = {
  gas: 320,
  temperature: 28.5,
  humidity: 55.0,
  vibration: false,
  ir: false,
  distance: 145,
  sensorFaults: {
    gas: false,
    dht: false,
    vibration: false,
    ir: false,
    distance: false,
  },
  state: "NORMAL",
  hazardCount: 0,
  activeHazards: [],
  greenLed: true,
  yellowLed: false,
  redLed: false,
  buzzer: false,
  buzzerMode: "OFF",
  relay: false,
  fan: false,
  lcdScreenIndex: 0,
  lcdLine1: "SMART FACTORY   ",
  lcdLine2: "SYSTEM NORMAL   ",
  demoMode: false,
  currentScenario: 0,
  demoTimerRemaining: 0,
  uptimeSeconds: 0,
  lastUpdated: new Date().toISOString(),
};

export default function App() {
  const [status, setStatus] = useState<SystemStatus>(defaultStatus);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [serialLogs, setSerialLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("simulator");
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);

  // Synchronize audio state whenever buzzerMode changes
  useEffect(() => {
    buzzerAudio.setMuted(isAudioMuted);
    buzzerAudio.updateSound(status.buzzerMode);
  }, [status.buzzerMode, isAudioMuted]);

  // Fetch telemetry from backend
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      // ignore network blips
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {}
  }, []);

  const fetchSerial = useCallback(async () => {
    try {
      const res = await fetch("/api/serial");
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setSerialLogs(data.logs);
        }
      }
    } catch (e) {}
  }, []);

  // Poll backend every 800ms
  useEffect(() => {
    fetchStatus();
    fetchLogs();
    fetchSerial();

    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
      fetchSerial();
    }, 800);

    return () => clearInterval(interval);
  }, [fetchStatus, fetchLogs, fetchSerial]);

  // Sensor modification handler
  const handleUpdateSensor = async (data: Partial<SensorData>) => {
    try {
      const res = await fetch("/api/sensor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.status) setStatus(result.status);
        fetchLogs();
        fetchSerial();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Demo mode trigger handler
  const handleTriggerDemo = async (enable: boolean, scenario?: number) => {
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable, scenario }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.status) setStatus(result.status);
        fetchLogs();
        fetchSerial();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset to nominal normal factory state
  const handleReset = async () => {
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        const result = await res.json();
        if (result.status) setStatus(result.status);
        fetchLogs();
        fetchSerial();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Run specific Faculty demonstration test case
  const handleRunTest = async (testNumber: number) => {
    switch (testNumber) {
      case 1: // TEST 1: Normal environment
        await handleUpdateSensor({
          gas: 320,
          temperature: 27.5,
          humidity: 52.0,
          vibration: false,
          ir: false,
          distance: 145,
        });
        break;

      case 2: // TEST 2: Gas > threshold (>750)
        await handleUpdateSensor({
          gas: 835, // > 750 CRITICAL
          temperature: 28.0,
          vibration: false,
          ir: false,
          distance: 145,
        });
        break;

      case 3: // TEST 3: Temperature > threshold (>55°C)
        await handleUpdateSensor({
          temperature: 58.5, // > 55 CRITICAL
          gas: 320,
          vibration: false,
          ir: false,
          distance: 145,
        });
        break;

      case 4: // TEST 4: Vibration activated
        await handleUpdateSensor({
          vibration: true,
          gas: 320,
          temperature: 28.0,
          ir: false,
          distance: 145,
        });
        break;

      case 5: // TEST 5: Distance < 30 cm
        await handleUpdateSensor({
          distance: 18, // < 30 CRITICAL
          ir: true,
          gas: 320,
          temperature: 28.0,
          vibration: false,
        });
        break;

      case 6: // TEST 6: Gas + Temperature + Vibration simultaneously
        await handleUpdateSensor({
          gas: 825,           // Hazard 1 (Critical)
          temperature: 59.0,  // Hazard 2 (Critical)
          vibration: true,    // Hazard 3 (Warning)
          ir: true,           // Hazard 4
          distance: 22,       // Hazard 5 (Critical)
        });
        break;
    }
  };

  const handleClearLogs = async () => {
    await fetch("/api/logs/clear", { method: "POST" });
    setLogs([]);
  };

  const handleClearSerial = async () => {
    await fetch("/api/serial/clear", { method: "POST" });
    setSerialLogs([]);
  };

  const handleToggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    buzzerAudio.setMuted(next);
    buzzerAudio.updateSound(status.buzzerMode);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header & Navbar */}
      <Navbar
        status={status}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onTriggerDemo={handleTriggerDemo}
        onReset={handleReset}
        onRunTest={handleRunTest}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === "simulator" && (
          <HardwareSimulator
            status={status}
            onUpdateSensor={handleUpdateSensor}
          />
        )}

        {activeTab === "dashboard" && (
          <ScadaDashboard
            status={status}
            logs={logs}
            onClearLogs={handleClearLogs}
            onRefresh={fetchLogs}
          />
        )}

        {activeTab === "serial" && (
          <SerialTerminal
            logs={serialLogs}
            onClear={handleClearSerial}
            onSendCommand={(cmd) => {
              if (cmd.toUpperCase() === "RESET") handleReset();
              else if (cmd.toUpperCase() === "DEMO") handleTriggerDemo(true);
            }}
          />
        )}

        {activeTab === "wiring" && <CircuitWiringViewer />}

        {activeTab === "presentation" && <PresentationGuide />}
      </main>

      {/* Footer with Status Summary */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-3 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ESP32 Hardware Simulation Engine: Active (3000ms LCD clock, 1500ms Serial tick)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>REST API: <code>/api/status</code> (200 OK)</span>
            <span>Firmware: <code>sketch.ino</code> (Wokwi v1)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
