import React, { useState, useEffect, useRef } from "react";
import { Terminal, Copy, Trash2, Pause, Play, Check, Send } from "lucide-react";

interface SerialTerminalProps {
  logs: string[];
  onClear: () => void;
  onSendCommand?: (cmd: string) => void;
}

export const SerialTerminal: React.FC<SerialTerminalProps> = ({
  logs,
  onClear,
  onSendCommand,
}) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inputCmd, setInputCmd] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(logs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;
    if (onSendCommand) {
      onSendCommand(inputCmd);
    }
    setInputCmd("");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 font-mono">
      {/* Terminal Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100 font-sans">
            ESP32 UART0 Serial Monitor (COM Port 115200 Baud, 8-N-1)
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2.5 py-1 rounded border text-[11px] flex items-center gap-1 transition-colors ${
              autoScroll
                ? "bg-slate-800 border-slate-700 text-emerald-300"
                : "bg-slate-950 border-slate-800 text-slate-400"
            }`}
          >
            {autoScroll ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>Auto-Scroll {autoScroll ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={copyToClipboard}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy Output"}</span>
          </button>

          <button
            onClick={onClear}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-800 text-slate-400 hover:text-red-300 text-[11px] flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Screen */}
      <div
        ref={scrollRef}
        className="h-[480px] overflow-y-auto bg-black/90 p-4 rounded-xl border border-slate-800 text-emerald-400 text-xs font-mono leading-relaxed space-y-0.5 select-text shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)]"
      >
        {logs.length > 0 ? (
          logs.map((line, idx) => {
            let textColor = "text-emerald-400";
            if (line.includes("[ALERT]") || line.includes("CRITICAL")) {
              textColor = "text-red-400 font-bold";
            } else if (line.includes("[STATE]") || line.includes("WARNING")) {
              textColor = "text-amber-300 font-semibold";
            } else if (line.includes("=====")) {
              textColor = "text-cyan-300 font-bold";
            } else if (line.includes("[ACTION]")) {
              textColor = "text-purple-300 font-semibold";
            }

            return (
              <div key={idx} className={`${textColor} whitespace-pre-wrap`}>
                {line}
              </div>
            );
          })
        ) : (
          <div className="text-slate-600 italic">Listening on /dev/ttyUSB0 (115200)...</div>
        )}
        <div className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1 align-middle" />
      </div>

      {/* Terminal Input Bar */}
      <form onSubmit={handleSend} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-2 text-slate-500 font-mono text-xs">&gt;</span>
          <input
            type="text"
            value={inputCmd}
            onChange={(e) => setInputCmd(e.target.value)}
            placeholder="Type command to send to ESP32 UART (e.g. HELP, STATUS, DEMO, RESET)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
