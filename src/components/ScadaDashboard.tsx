import React, { useState } from "react";
import { 
  Activity, 
  Flame, 
  Thermometer, 
  Droplets, 
  Ruler, 
  Radio, 
  Fan, 
  Bell, 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Trash2, 
  Search, 
  Code2, 
  ExternalLink,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { SystemStatus, EventLog, SafetyState } from "../types";

interface ScadaDashboardProps {
  status: SystemStatus;
  logs: EventLog[];
  onClearLogs: () => void;
  onRefresh: () => void;
}

export const ScadaDashboard: React.FC<ScadaDashboardProps> = ({
  status,
  logs,
  onClearLogs,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [showApiInspector, setShowApiInspector] = useState(false);

  // Filter logs based on search and severity filter
  const filteredLogs = logs.filter((item) => {
    const matchesSearch =
      item.sensor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hazard.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === "ALL" || item.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const exportCsv = () => {
    const headers = "Timestamp,Sensor,Value,Hazard,Severity,Action\n";
    const rows = logs
      .map(
        (l) =>
          `"${l.timestamp}","${l.sensor}","${l.value}","${l.hazard}","${l.severity}","${l.action}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `safety_event_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top SCADA KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Gas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">MQ-2 Gas</span>
            <Flame className={`w-4 h-4 ${status.gas >= 600 ? "text-orange-400" : "text-slate-500"}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-100">{status.gas}</span>
            <span className="text-xs text-slate-400">ADC</span>
          </div>
          <div className="mt-2 text-[10px] font-mono">
            {status.gas >= 750 ? (
              <span className="text-red-400 font-bold">CRITICAL LEAK</span>
            ) : status.gas >= 600 ? (
              <span className="text-amber-400 font-bold">WARNING</span>
            ) : (
              <span className="text-emerald-400">Nominal (&lt;600)</span>
            )}
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Temperature</span>
            <Thermometer className={`w-4 h-4 ${status.temperature >= 45 ? "text-rose-400" : "text-slate-500"}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-100">{status.temperature.toFixed(1)}</span>
            <span className="text-xs text-slate-400">°C</span>
          </div>
          <div className="mt-2 text-[10px] font-mono">
            {status.temperature >= 55 ? (
              <span className="text-red-400 font-bold">OVERHEAT (&gt;55°C)</span>
            ) : status.temperature >= 45 ? (
              <span className="text-amber-400 font-bold">WARNING (45-55)</span>
            ) : (
              <span className="text-emerald-400">Normal (&lt;45°C)</span>
            )}
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Humidity</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-100">{status.humidity.toFixed(0)}</span>
            <span className="text-xs text-slate-400">% RH</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400">
            Comfort Range (40-70%)
          </div>
        </div>

        {/* Distance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Obstacle Dist</span>
            <Ruler className={`w-4 h-4 ${status.distance <= 100 ? "text-blue-400" : "text-slate-500"}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-100">{status.distance}</span>
            <span className="text-xs text-slate-400">cm</span>
          </div>
          <div className="mt-2 text-[10px] font-mono">
            {status.distance < 30 ? (
              <span className="text-red-400 font-bold">CRUSH ZONE (&lt;30)</span>
            ) : status.distance <= 100 ? (
              <span className="text-amber-400 font-bold">CAUTION (30-100)</span>
            ) : (
              <span className="text-emerald-400">Clear (&gt;100cm)</span>
            )}
          </div>
        </div>

        {/* Vibration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">SW-420 Vib</span>
            <Activity className={`w-4 h-4 ${status.vibration ? "text-amber-400" : "text-slate-500"}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-base sm:text-lg font-bold font-mono ${status.vibration ? "text-amber-300" : "text-slate-100"}`}>
              {status.vibration ? "DETECTED" : "NOMINAL"}
            </span>
          </div>
          <div className="mt-2 text-[10px] font-mono">
            {status.vibration ? (
              <span className="text-amber-400 font-bold">MACHINE SHAKE</span>
            ) : (
              <span className="text-emerald-400">Balanced</span>
            )}
          </div>
        </div>

        {/* IR Optical */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">IR Beam</span>
            <Radio className={`w-4 h-4 ${status.ir ? "text-purple-400" : "text-slate-500"}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-base sm:text-lg font-bold font-mono ${status.ir ? "text-purple-300" : "text-slate-100"}`}>
              {status.ir ? "TRIGGERED" : "UNBROKEN"}
            </span>
          </div>
          <div className="mt-2 text-[10px] font-mono">
            {status.ir ? (
              <span className="text-amber-400 font-bold">PERSON NEARBY</span>
            ) : (
              <span className="text-emerald-400">Zone Clear</span>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Hazard Logic & Actuator Interlock Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Hazard Logic Calculation Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Multi-Hazard Classification Engine (Requirement Section 5)
              </h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Active Hazard Count: <strong className="text-white">{status.hazardCount}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-slate-300">Composite Hazard Evaluation</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Formula: <code className="font-mono text-indigo-300">hazardCount = gas + temp + vib + dist + ir</code>
              </p>
              <ul className="space-y-1 text-[11px] text-slate-300 pt-1 font-mono">
                <li className="flex items-center justify-between">
                  <span>0 Hazards:</span>
                  <span className="text-emerald-400 font-semibold">NORMAL Mode</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>1 Minor Hazard:</span>
                  <span className="text-amber-400 font-semibold">WARNING Mode</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>&ge; 2 Hazards OR Severe:</span>
                  <span className="text-red-400 font-semibold">CRITICAL Mode (Priority)</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-slate-300">Active Detected Threat Vectors</h4>
              {status.activeHazards.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {status.activeHazards.map((hazard, index) => (
                    <div
                      key={index}
                      className="p-1.5 rounded bg-red-950/40 border border-red-700/60 text-red-200 text-xs font-mono flex items-center gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{hazard}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-700/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No active hazards. All parameters within safe baseline.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actuator Interlock Output Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-100">Actuator Interlocks</h3>
            </div>
            <button
              onClick={() => setShowApiInspector(!showApiInspector)}
              className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showApiInspector ? "Hide API" : "Inspect API"}</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <Fan className={`w-4 h-4 ${status.fan ? "text-sky-400 animate-spin" : "text-slate-500"}`} />
                <span className="text-slate-200 font-medium">Exhaust Fan (Relay)</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                status.fan ? "bg-sky-500 text-slate-950" : "bg-slate-800 text-slate-400"
              }`}>
                {status.fan ? "RUNNING" : "STOPPED"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className={`w-4 h-4 ${status.buzzer ? "text-red-400 animate-bounce" : "text-slate-500"}`} />
                <span className="text-slate-200 font-medium">Piezo Siren (GPIO15)</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                status.buzzerMode === "CONTINUOUS"
                  ? "bg-red-500 text-slate-950"
                  : status.buzzerMode === "INTERMITTENT"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-800 text-slate-400"
              }`}>
                {status.buzzerMode}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${status.relay ? "text-amber-400" : "text-slate-500"}`} />
                <span className="text-slate-200 font-medium">5V Power Relay (GPIO5)</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                status.relay ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
              }`}>
                {status.relay ? "CLOSED (ON)" : "OPEN (OFF)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded REST API Inspector (Optional Drawer) */}
      {showApiInspector && (
        <div className="bg-slate-950 border border-indigo-900/60 rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-indigo-300">
            <span className="font-bold flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Live REST API Endpoint: GET /api/status
            </span>
            <span className="text-[11px] text-slate-400">Content-Type: application/json</span>
          </div>
          <pre className="p-3 bg-slate-900 rounded-lg text-emerald-300 overflow-x-auto text-[11px] leading-relaxed border border-slate-800">
            {JSON.stringify(
              {
                gas: status.gas,
                temperature: status.temperature,
                humidity: status.humidity,
                distance: status.distance,
                vibration: status.vibration,
                ir: status.ir,
                state: status.state,
                hazardCount: status.hazardCount,
                activeHazards: status.activeHazards,
                fan: status.fan,
                buzzer: status.buzzer,
                relay: status.relay,
                uptime: status.uptimeSeconds,
              },
              null,
              2
            )}
          </pre>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Test via command line:</span>
            <code className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded">
              curl -s http://localhost:3000/api/status
            </code>
          </div>
        </div>
      )}

      {/* Event Logging Table (Section 10 Requirement: timestamp, sensor, value, hazard, severity, action - 50+ items) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Audit Event Log &amp; Blackbox Incident History
            </h3>
            <p className="text-xs text-slate-400">
              Captures every major state change, sensor alarm, and actuator trip with microsecond order (Circular Buffer).
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="WARNING">Warning Only</option>
              <option value="NORMAL">Normal Only</option>
            </select>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300"
              title="Refresh Logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Export CSV */}
            <button
              onClick={exportCsv}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Clear Logs */}
            <button
              onClick={onClearLogs}
              className="px-2.5 py-1 bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-800 text-slate-400 hover:text-red-300 rounded-lg text-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto max-h-96 rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Sensor</th>
                <th className="py-2.5 px-3">Value</th>
                <th className="py-2.5 px-3">Hazard Description</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Automated Safety Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2 px-3 font-semibold text-slate-200 whitespace-nowrap">{log.sensor}</td>
                    <td className="py-2 px-3 text-indigo-300 whitespace-nowrap">{log.value}</td>
                    <td className="py-2 px-3 text-slate-200">{log.hazard}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {log.severity === "CRITICAL" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/80 border border-red-600/70 text-red-300">
                          CRITICAL
                        </span>
                      ) : log.severity === "WARNING" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 border border-amber-600/70 text-amber-300">
                          WARNING
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 border border-emerald-600/70 text-emerald-300">
                          NORMAL
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-300">{log.action}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                    No matching event logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
