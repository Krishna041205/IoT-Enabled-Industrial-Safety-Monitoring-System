import React, { useState } from "react";
import { 
  GraduationCap, 
  Clock, 
  HelpCircle, 
  Wrench, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Thermometer,
  Activity,
  Ruler,
  Radio
} from "lucide-react";

export const PresentationGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<"script" | "matrix" | "viva" | "troubleshooting">("script");

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              College Faculty Demonstration &amp; Defense Manual
            </h2>
            <p className="text-xs text-slate-400">
              Comprehensive presentation speech, sensor-to-actuator logic verification, and professor Q&amp;A defense strategy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection("script")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSection === "script"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            5-Min Speech Script
          </button>
          <button
            onClick={() => setActiveSection("matrix")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSection === "matrix"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Sensor Logic Matrix
          </button>
          <button
            onClick={() => setActiveSection("viva")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSection === "viva"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Professor Viva Q&amp;A
          </button>
          <button
            onClick={() => setActiveSection("troubleshooting")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSection === "troubleshooting"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Troubleshooting
          </button>
        </div>
      </div>

      {/* 1. 5-Minute Demonstration Script */}
      {activeSection === "script" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              5-Minute College Final-Year Presentation Script (Step-by-Step with Cues)
            </h3>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            {/* Phase 1 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-indigo-400 font-bold">
                <span>Phase 1: Project Introduction &amp; Hardware Architecture (0:00 - 1:00)</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800">1 Minute</span>
              </div>
              <p>
                <strong>Spoken Speech:</strong> &quot;Respected faculty members, good morning. Today I demonstrate our capstone project: the <em>IoT-Enabled Industrial Safety Monitoring System</em>. Heavy manufacturing facilities present combined operational risks where localized, uncoordinated alerts lead to disaster. Our system utilizes an ESP32 dual-core SoC to continuously poll 5 distinct sensor vectors: combustible gas (MQ-2), ambient temperature and humidity (DHT22), mechanical structural vibration (SW-420), infrared perimeter intrusion, and ultrasonic obstacle distance (HC-SR04).&quot;
              </p>
              <p className="text-slate-400 italic">
                <strong>Action Cue:</strong> Point to the Virtual Hardware Breadboard and indicate the ESP32 pin assignments (MQ-2 on GPIO34, DHT22 on GPIO4, LCD 4-bit bus on GPIO 21, 22, 23, 16, 17, 2).
              </p>
            </div>

            {/* Phase 2 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-indigo-400 font-bold">
                <span>Phase 2: Demonstration of Normal Baseline (1:00 - 1:45)</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800">45 Seconds</span>
              </div>
              <p>
                <strong>Spoken Speech:</strong> &quot;Under nominal operating conditions—with gas below 600 ADC, temperature at 27°C, and obstacle clearance above 100 cm—the system remains in <strong>NORMAL state</strong>. You can observe the Green LED illuminated on GPIO14, the buzzer silent, the exhaust fan stationary at 0 RPM, and the 16x2 LCD rotating through its operational status screens.&quot;
              </p>
              <p className="text-slate-400 italic">
                <strong>Action Cue:</strong> Click <em>&quot;Test 1: Normal&quot;</em> button. Show professors the rotating LCD (Screen 1 &quot;SMART FACTORY / SYSTEM NORMAL&quot;, Screen 2 Gas/Temp, Screen 3 Humidity/Distance).
              </p>
            </div>

            {/* Phase 3 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-indigo-400 font-bold">
                <span>Phase 3: Demonstrating Single Warning Hazard (1:45 - 2:45)</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800">1 Minute</span>
              </div>
              <p>
                <strong>Spoken Speech:</strong> &quot;Now, let us introduce a mechanical anomaly by triggering the SW-420 vibration sensor. The system instantly classifies this as <strong>WARNING state</strong>. Notice the Green LED turns off, the Yellow LED on GPIO12 illuminates, the buzzer emits an intermittent cautionary pulse, and the LCD displays a high-priority <code>VIBRATION ALERT / CHECK MACHINE</code>. Notice that the exhaust fan remains off because a vibration hazard does not require pneumatic venting.&quot;
              </p>
              <p className="text-slate-400 italic">
                <strong>Action Cue:</strong> Click <em>&quot;Test 4: Vibration&quot;</em>. Point out the Yellow LED pulse and intermittent buzzer sound.
              </p>
            </div>

            {/* Phase 4 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-indigo-400 font-bold">
                <span>Phase 4: Demonstrating Critical Emergency &amp; Fan Interlock (2:45 - 3:45)</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800">1 Minute</span>
              </div>
              <p>
                <strong>Spoken Speech:</strong> &quot;Next, we simulate a severe combustible gas leak by sliding the MQ-2 input above 750 ADC. Because 750 is a severe critical threshold, the system immediately locks into <strong>CRITICAL mode</strong>. The Red LED activates, the buzzer converts into a continuous 1kHz alarm, and the Relay on GPIO5 energizes, spinning up the DC Exhaust Fan to 2800 RPM for emergency fume extraction.&quot;
              </p>
              <p className="text-slate-400 italic">
                <strong>Action Cue:</strong> Click <em>&quot;Test 2: Gas Alert (&gt;750)&quot;</em>. Watch the spinning fan rotor animation and listen to the continuous siren.
              </p>
            </div>

            {/* Phase 5 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-indigo-400 font-bold">
                <span>Phase 5: Multi-Hazard Crisis &amp; IoT SCADA Gateway (3:45 - 5:00)</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800">1 Min 15 Sec</span>
              </div>
              <p>
                <strong>Spoken Speech:</strong> &quot;Finally, in our multi-hazard test, we have multiple simultaneous breaches: gas leak, high temperature at 58°C, and human proximity breach within 18 cm. The composite hazard engine identifies 3 concurrent threats. All incidents are logged into the circular blackbox buffer with timestamp, sensor, and action. Through the embedded ESP32 web server, the telemetry is published in JSON over <code>/api/status</code> and <code>/api/logs</code>, enabling enterprise SCADA integration. This concludes our demonstration. I welcome any questions from the panel.&quot;
              </p>
              <p className="text-slate-400 italic">
                <strong>Action Cue:</strong> Click <em>&quot;Test 6: Multi-Hazard Crisis&quot;</em>, switch to the <strong>IoT SCADA Dashboard</strong> tab to show the Event History table, and open the <strong>Serial Monitor</strong> tab to show the live formatted printouts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Sensor-to-Actuator Logic Matrix */}
      {activeSection === "matrix" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100">
              Sensor-to-Actuator Response Explanation (Section K Requirement)
            </h3>
            <p className="text-xs text-slate-400">
              Exact mechanism by which each sensor vector influences firmware logic, thresholds, and actuators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* MQ-2 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-orange-400 font-bold">
                <Flame className="w-4 h-4" />
                <span>MQ-2 Combustible Gas Sensor</span>
              </div>
              <p className="text-slate-300">
                <strong>Input:</strong> Analog reading on <strong>GPIO34</strong> (mapped to 0-1023 ADC).
              </p>
              <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                <li><strong className="text-slate-200">&lt;600:</strong> Normal clean air baseline. Green LED remains ON.</li>
                <li><strong className="text-slate-200">600-750:</strong> Moderate smoke/fumes. Triggers WARNING, Yellow LED, intermittent beep.</li>
                <li><strong className="text-slate-200">&gt;750:</strong> Severe combustible gas risk. Triggers CRITICAL, Red LED, continuous siren, and Relay GPIO5 ON (Exhaust Fan).</li>
              </ul>
            </div>

            {/* DHT22 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Thermometer className="w-4 h-4" />
                <span>DHT22 Temperature &amp; Humidity Sensor</span>
              </div>
              <p className="text-slate-300">
                <strong>Input:</strong> Digital single-bus protocol on <strong>GPIO4</strong>.
              </p>
              <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                <li><strong className="text-slate-200">&lt;45°C:</strong> Standard ambient machinery temperature.</li>
                <li><strong className="text-slate-200">45-55°C:</strong> Thermal warning zone. Displays &quot;HIGH TEMP ALERT&quot; on LCD, Yellow LED.</li>
                <li><strong className="text-slate-200">&gt;55°C:</strong> Runaway fire / overheat risk. CRITICAL mode, Exhaust fan ON for cooling, Red LED.</li>
              </ul>
            </div>

            {/* SW-420 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-yellow-400 font-bold">
                <Activity className="w-4 h-4" />
                <span>SW-420 Vibration Sensor</span>
              </div>
              <p className="text-slate-300">
                <strong>Input:</strong> Digital Out on <strong>GPIO27</strong> (interrupt or digital read).
              </p>
              <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                <li><strong className="text-slate-200">LOW:</strong> Normal mechanical balance.</li>
                <li><strong className="text-slate-200">HIGH:</strong> Mechanical imbalance or loose bearing detected. WARNING mode, Yellow LED, LCD reads &quot;VIBRATION ALERT / CHECK MACHINE&quot;.</li>
              </ul>
            </div>

            {/* HC-SR04 & IR */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <Ruler className="w-4 h-4" />
                <span>HC-SR04 Ultrasonic &amp; IR Obstacle Sensors</span>
              </div>
              <p className="text-slate-300">
                <strong>Input:</strong> TRIG=GPIO18, ECHO=GPIO19 (time-of-flight) and IR DO=GPIO26.
              </p>
              <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                <li><strong className="text-slate-200">&gt;100 cm:</strong> Safe operating clearance zone.</li>
                <li><strong className="text-slate-200">30-100 cm:</strong> Personnel approaching perimeter. WARNING mode.</li>
                <li><strong className="text-slate-200">&lt;30 cm:</strong> Human hand or limb in machine pinch/crush point. Immediate CRITICAL alarm priority!</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. Professor Viva Defense Q&A */}
      {activeSection === "viva" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100">
              Professor Viva Defense Questions &amp; Bulletproof Model Answers
            </h3>
            <p className="text-slate-400">
              Master these answers to ace technical viva questions on embedded systems, IoT, and industrial safety.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-indigo-300">
                Q1: Why use an ESP32 instead of an Arduino UNO for this industrial project?
              </h4>
              <p className="text-slate-300">
                <strong>Model Answer:</strong> &quot;The Arduino Uno has only 2KB of SRAM and 16MHz clock speed with zero native networking. The ESP32 features a 240MHz dual-core Xtensa LX6 processor, 520KB SRAM, hardware timers, and integrated 2.4GHz Wi-Fi. This allows Core 0 to handle sensor sampling and fail-safe actuation without latency, while Core 1 runs the HTTP Web Server and REST API concurrently.&quot;
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-indigo-300">
                Q2: What is your failure-safe strategy if the DHT22 or Ultrasonic sensor gets disconnected?
              </h4>
              <p className="text-slate-300">
                <strong>Model Answer:</strong> &quot;We implemented non-blocking timeout checks. For the DHT22, <code>isnan()</code> detects open circuits and flags <code>errorDHT = true</code>, retaining the last safe reading rather than crashing. For the ultrasonic sensor, <code>pulseIn()</code> is capped with a 30,000µs timeout so the program loop never hangs. The system continues evaluating remaining active sensors seamlessly.&quot;
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-indigo-300">
                Q3: Why is the LCD operated in 4-bit parallel mode instead of I2C?
              </h4>
              <p className="text-slate-300">
                <strong>Model Answer:</strong> &quot;4-bit parallel mode directly connects GPIO 21, 22, 23, 16, 17, 2 to the HD44780 controller. This eliminates dependence on external PCF8574 I2C backpack ICs, reducing propagation delay and component count. Nibble-based transmission updates the display in sub-millisecond intervals.&quot;
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-indigo-300">
                Q4: How do you prioritize simultaneous multi-hazard conditions?
              </h4>
              <p className="text-slate-300">
                <strong>Model Answer:</strong> &quot;In <code>determineSafetyState()</code>, hazard count is calculated as the sum of active flags. If hazardCount &ge; 2 OR any individual severe condition is met (Gas &gt; 750, Temp &gt; 55°C, Distance &lt; 30cm), CRITICAL state overrides WARNING immediately with deterministic priority.&quot;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Troubleshooting Guide */}
      {activeSection === "troubleshooting" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100">
              Hardware &amp; Simulation Troubleshooting Guide
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Problem: LCD Display Shows Black Squares / Blank
              </h4>
              <p className="text-slate-300">
                <strong>Cause:</strong> Contrast voltage VO is not calibrated or VSS/VDD pins reversed.
              </p>
              <p className="text-slate-400">
                <strong>Fix:</strong> Connect 10k potentiometer wiper to LCD pin 3 (VO). Rotate potentiometer until text characters emerge clearly with high contrast against the backlight.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Problem: ESP32 MQ-2 Analog Reading Fluctuation
              </h4>
              <p className="text-slate-300">
                <strong>Cause:</strong> ESP32 ADC non-linearity or heater coil warmup period.
              </p>
              <p className="text-slate-400">
                <strong>Fix:</strong> MQ-2 internal tin dioxide (SnO2) filament requires 20-30 seconds preheat. In firmware, we normalize 12-bit ADC (0-4095) down to 0-1023 using calibration mapping.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Problem: Relay Module Stays Permanently ON or Won&apos;t Trigger
              </h4>
              <p className="text-slate-300">
                <strong>Cause:</strong> Active-LOW vs Active-HIGH relay transistor optocoupler logic.
              </p>
              <p className="text-slate-400">
                <strong>Fix:</strong> Check your specific relay board. If your board uses active-LOW optocoupler trigger, invert <code>digitalWrite(PIN_RELAY_IN, LOW)</code> in <code>activateCriticalMode()</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Problem: Cannot Access ESP32 Web Server
              </h4>
              <p className="text-slate-300">
                <strong>Cause:</strong> Not connected to ESP32 SoftAP Wi-Fi network.
              </p>
              <p className="text-slate-400">
                <strong>Fix:</strong> Connect laptop or phone to SSID <code>ESP32-Safety-System</code> with password <code>IndustrialSafe123</code>. Open browser to <code>http://192.168.4.1/</code>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
