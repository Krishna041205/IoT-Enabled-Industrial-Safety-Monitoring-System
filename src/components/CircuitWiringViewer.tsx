import React, { useState } from "react";
import { 
  Cpu, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  FileCode, 
  Layers, 
  Info,
  CheckCircle2
} from "lucide-react";

export const CircuitWiringViewer: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<"sketch" | "diagram" | "libraries">("sketch");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wiringData = [
    { pin: "GPIO34", type: "Analog In (ADC1_CH6)", component: "MQ-2 Gas Sensor", componentPin: "AO (Analog Out)", voltage: "3.3V Logic", wire: "Green", notes: "Monitors combustible gas concentration (0-1023 normalized)" },
    { pin: "GPIO25", type: "Digital In", component: "MQ-2 Gas Sensor", componentPin: "DO (Digital Out)", voltage: "3.3V Logic", wire: "Yellow", notes: "Hardware comparator threshold output" },
    { pin: "GPIO4", type: "Digital In/Out (1-Wire)", component: "DHT22 Climate Sensor", componentPin: "Data (Pin 2)", voltage: "3.3V Logic", wire: "Blue", notes: "Requires 10kΩ pull-up to 3.3V for AM2302 bus" },
    { pin: "GPIO27", type: "Digital In", component: "SW-420 Vibration Sensor", componentPin: "DO (Digital Out)", voltage: "3.3V Logic", wire: "Orange", notes: "Outputs HIGH on mechanical impact/vibration" },
    { pin: "GPIO26", type: "Digital In", component: "IR Obstacle Sensor", componentPin: "DO (Digital Out)", voltage: "3.3V Logic", wire: "Purple", notes: "Optical beam breach detector for perimeter guarding" },
    { pin: "GPIO18", type: "Digital Out", component: "HC-SR04 Ultrasonic", componentPin: "TRIG", voltage: "3.3V Logic", wire: "Blue", notes: "10µs ultrasonic trigger pulse" },
    { pin: "GPIO19", type: "Digital In", component: "HC-SR04 Ultrasonic", componentPin: "ECHO", voltage: "3.3V Logic", wire: "Cyan", notes: "Measures echo pulse width (via voltage divider if 5V module)" },
    { pin: "GPIO14", type: "Digital Out", component: "Green Status LED", componentPin: "Anode (+)", voltage: "3.3V Logic", wire: "Green", notes: "Active HIGH via 220Ω resistor (Normal safe state)" },
    { pin: "GPIO12", type: "Digital Out", component: "Yellow Status LED", componentPin: "Anode (+)", voltage: "3.3V Logic", wire: "Yellow", notes: "Active HIGH via 220Ω resistor (Warning hazard state)" },
    { pin: "GPIO13", type: "Digital Out", component: "Red Status LED", componentPin: "Anode (+)", voltage: "3.3V Logic", wire: "Red", notes: "Active HIGH via 220Ω resistor (Critical emergency state)" },
    { pin: "GPIO15", type: "Digital Out", component: "Piezo Buzzer", componentPin: "Positive (+)", voltage: "3.3V / 5V", wire: "Purple", notes: "Intermittent tone on warning, continuous siren on critical" },
    { pin: "GPIO5", type: "Digital Out", component: "5V Relay Module", componentPin: "IN (Signal)", voltage: "3.3V/5V Logic", wire: "Orange", notes: "Energizes coil to power DC exhaust ventilation fan" },
    { pin: "GPIO21", type: "Digital Out", component: "16x2 LCD Display", componentPin: "RS (Register Select)", voltage: "5V VDD", wire: "Blue", notes: "Instruction/Data register select" },
    { pin: "GPIO22", type: "Digital Out", component: "16x2 LCD Display", componentPin: "EN (Enable)", voltage: "5V VDD", wire: "Green", notes: "Clock latch strobe" },
    { pin: "GPIO23", type: "Digital Out", component: "16x2 LCD Display", componentPin: "D4 (Data 4)", voltage: "5V VDD", wire: "Orange", notes: "4-bit parallel data bus nibble" },
    { pin: "GPIO16", type: "Digital Out", component: "16x2 LCD Display", componentPin: "D5 (Data 5)", voltage: "5V VDD", wire: "Yellow", notes: "4-bit parallel data bus nibble" },
    { pin: "GPIO17", type: "Digital Out", component: "16x2 LCD Display", componentPin: "D6 (Data 6)", voltage: "5V VDD", wire: "Cyan", notes: "4-bit parallel data bus nibble" },
    { pin: "GPIO2", type: "Digital Out", component: "16x2 LCD Display", componentPin: "D7 (Data 7)", voltage: "5V VDD", wire: "Purple", notes: "4-bit parallel data bus nibble" },
    { pin: "GND / 5V", type: "Analog Potentiometer", component: "10kΩ Contrast Pot", componentPin: "Wiper -> LCD VO", voltage: "0-5V", wire: "White", notes: "Adjusts 16x2 character contrast matrix" }
  ];

  const sketchCode = `// IoT-Enabled Industrial Safety Monitoring System
// Board: ESP32 Dev Module
#include <WiFi.h>
#include <WebServer.h>
#include <LiquidCrystal.h>
#include <DHT.h>

// Threshold Constants
const int   THRESHOLD_GAS_WARN       = 600;
const int   THRESHOLD_GAS_CRIT       = 750;
const float THRESHOLD_TEMP_WARN      = 45.0;
const float THRESHOLD_TEMP_CRIT      = 55.0;
const long  THRESHOLD_DIST_WARN      = 100;
const long  THRESHOLD_DIST_CRIT      = 30;

// Hardware Pin Definitions
#define PIN_MQ2_ANALOG      34
#define PIN_MQ2_DIGITAL     25
#define PIN_DHT22_DATA      4
#define PIN_VIBRATION_DO    27
#define PIN_IR_DO           26
#define PIN_ULTRASONIC_TRIG 18
#define PIN_ULTRASONIC_ECHO 19
#define PIN_BUZZER          15
#define PIN_LED_RED         13
#define PIN_LED_YELLOW      12
#define PIN_LED_GREEN       14
#define PIN_RELAY_IN        5

// LCD 16x2 Parallel Pins
#define PIN_LCD_RS 21
#define PIN_LCD_EN 22
#define PIN_LCD_D4 23
#define PIN_LCD_D5 16
#define PIN_LCD_D6 17
#define PIN_LCD_D7 2

LiquidCrystal lcd(PIN_LCD_RS, PIN_LCD_EN, PIN_LCD_D4, PIN_LCD_D5, PIN_LCD_D6, PIN_LCD_D7);
#define DHTTYPE DHT22
DHT dht(PIN_DHT22_DATA, DHTTYPE);
WebServer server(80);

enum SafetyState { STATE_NORMAL, STATE_WARNING, STATE_CRITICAL };
SafetyState currentSafetyState = STATE_NORMAL;

int   rawGasValue         = 0;
float currentTemperature  = 0.0;
float currentHumidity     = 0.0;
bool  vibrationDetected   = false;
bool  irObjectDetected    = false;
long  obstacleDistanceCm  = 0;
int   totalHazardCount     = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_MQ2_ANALOG, INPUT);
  pinMode(PIN_VIBRATION_DO, INPUT);
  pinMode(PIN_IR_DO, INPUT);
  pinMode(PIN_ULTRASONIC_TRIG, OUTPUT);
  pinMode(PIN_ULTRASONIC_ECHO, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_RELAY_IN, OUTPUT);

  lcd.begin(16, 2);
  dht.begin();
  WiFi.softAP("ESP32-Safety-System", "IndustrialSafe123");
  server.on("/api/status", []() {
    String json = "{\\"gas\\":" + String(rawGasValue) +
                  ",\\"temp\\":" + String(currentTemperature, 1) +
                  ",\\"state\\":\\"" + (currentSafetyState == STATE_NORMAL ? "NORMAL" : currentSafetyState == STATE_WARNING ? "WARNING" : "CRITICAL") + "\\"}";
    server.send(200, "application/json", json);
  });
  server.begin();
  digitalWrite(PIN_LED_GREEN, HIGH);
}

void loop() {
  server.handleClient();
  rawGasValue = map(analogRead(PIN_MQ2_ANALOG), 0, 4095, 0, 1023);
  float t = dht.readTemperature();
  if (!isnan(t)) currentTemperature = t;
  vibrationDetected = (digitalRead(PIN_VIBRATION_DO) == HIGH);
  irObjectDetected = (digitalRead(PIN_IR_DO) == HIGH);

  digitalWrite(PIN_ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_ULTRASONIC_TRIG, LOW);
  long dur = pulseIn(PIN_ULTRASONIC_ECHO, HIGH, 25000);
  obstacleDistanceCm = (dur > 0) ? (dur * 0.034 / 2) : 200;

  totalHazardCount = 0;
  if (rawGasValue >= THRESHOLD_GAS_WARN) totalHazardCount++;
  if (currentTemperature >= THRESHOLD_TEMP_WARN) totalHazardCount++;
  if (vibrationDetected) totalHazardCount++;
  if (obstacleDistanceCm <= THRESHOLD_DIST_WARN) totalHazardCount++;
  if (irObjectDetected) totalHazardCount++;

  bool severe = (rawGasValue >= THRESHOLD_GAS_CRIT) || (currentTemperature >= THRESHOLD_TEMP_CRIT) || (obstacleDistanceCm < THRESHOLD_DIST_CRIT);

  if (totalHazardCount == 0) currentSafetyState = STATE_NORMAL;
  else if (totalHazardCount >= 2 || severe) currentSafetyState = STATE_CRITICAL;
  else currentSafetyState = STATE_WARNING;

  digitalWrite(PIN_LED_GREEN, currentSafetyState == STATE_NORMAL);
  digitalWrite(PIN_LED_YELLOW, currentSafetyState == STATE_WARNING);
  digitalWrite(PIN_LED_RED, currentSafetyState == STATE_CRITICAL);
  digitalWrite(PIN_BUZZER, currentSafetyState != STATE_NORMAL);
  digitalWrite(PIN_RELAY_IN, currentSafetyState == STATE_CRITICAL);

  delay(200);
}`;

  const diagramJson = `{
  "version": 1,
  "author": "College Final-Year IoT Project",
  "editor": "wokwi",
  "parts": [
    { "type": "board-esp32-devkit-c-v4", "id": "esp", "top": 100, "left": 100, "attrs": {} },
    { "type": "wokwi-lcd1602", "id": "lcd", "top": -160, "left": 40, "attrs": { "pins": "full" } },
    { "type": "wokwi-potentiometer", "id": "mq2_pot", "top": 280, "left": -80, "attrs": { "label": "MQ-2 Gas" } },
    { "type": "wokwi-dht22", "id": "dht", "top": 100, "left": -120, "attrs": { "temperature": "27.5", "humidity": "52" } },
    { "type": "wokwi-pushbutton", "id": "btn_vib", "top": 400, "left": -60, "attrs": { "label": "SW-420 Vib", "color": "orange" } },
    { "type": "wokwi-pushbutton", "id": "btn_ir", "top": 480, "left": -60, "attrs": { "label": "IR Proximity", "color": "blue" } },
    { "type": "wokwi-hc-sr04", "id": "ultrasonic", "top": -80, "left": 460, "attrs": { "distance": "145" } },
    { "type": "wokwi-led", "id": "led_green", "top": 100, "left": 480, "attrs": { "color": "green", "label": "Normal" } },
    { "type": "wokwi-led", "id": "led_yellow", "top": 170, "left": 480, "attrs": { "color": "yellow", "label": "Warning" } },
    { "type": "wokwi-led", "id": "led_red", "top": 240, "left": 480, "attrs": { "color": "red", "label": "Critical" } },
    { "type": "wokwi-buzzer", "id": "buzzer", "top": 330, "left": 470, "attrs": { "hasAudio": "true" } },
    { "type": "wokwi-relay-module", "id": "relay", "top": 440, "left": 430, "attrs": {} }
  ],
  "connections": [
    [ "esp:21", "lcd:RS", "blue", [] ],
    [ "esp:22", "lcd:E", "green", [] ],
    [ "esp:23", "lcd:D4", "orange", [] ],
    [ "esp:16", "lcd:D5", "yellow", [] ],
    [ "esp:17", "lcd:D6", "cyan", [] ],
    [ "esp:2", "lcd:D7", "purple", [] ],
    [ "esp:34", "mq2_pot:SIG", "green", [] ],
    [ "esp:4", "dht:SDA", "blue", [] ],
    [ "esp:27", "btn_vib:2.r", "orange", [] ],
    [ "esp:26", "btn_ir:2.r", "purple", [] ],
    [ "esp:18", "ultrasonic:TRIG", "blue", [] ],
    [ "esp:19", "ultrasonic:ECHO", "cyan", [] ],
    [ "esp:14", "led_green:A", "green", [] ],
    [ "esp:12", "led_yellow:A", "yellow", [] ],
    [ "esp:13", "led_red:A", "red", [] ],
    [ "esp:15", "buzzer:2", "purple", [] ],
    [ "esp:5", "relay:IN", "orange", [] ]
  ]
}`;

  const librariesTxt = `# Wokwi Arduino Library Dependencies
DHT sensor library
LiquidCrystal
Adafruit Unified Sensor
`;

  return (
    <div className="space-y-6">
      {/* Wiring Pinout Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Complete ESP32 Pin Assignment &amp; Electrical Wiring Table
              </h3>
              <p className="text-xs text-slate-400">
                Exact hardware pin mappings matching project specifications and Wokwi simulation circuit.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            19 Connected Terminals
          </span>
        </div>

        <div className="overflow-x-auto max-h-96 rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">ESP32 Pin</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Component</th>
                <th className="py-2 px-3">Terminal</th>
                <th className="py-2 px-3">Wire</th>
                <th className="py-2 px-3">Functional Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
              {wiringData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-indigo-300">{row.pin}</td>
                  <td className="py-2 px-3 text-slate-400">{row.type}</td>
                  <td className="py-2 px-3 font-semibold text-slate-200">{row.component}</td>
                  <td className="py-2 px-3 text-emerald-400">{row.componentPin}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {row.wire}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-300 text-[11px] font-sans">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Wokwi Code & Schematics Downloader */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Simulation Source Code &amp; Wokwi Configuration Files
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://wokwi.com/projects/new/esp32"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <span>Launch Wokwi Simulator</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tab switcher for files */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveCodeTab("sketch")}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                activeCodeTab === "sketch"
                  ? "bg-slate-800 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              sketch.ino (Arduino C++)
            </button>
            <button
              onClick={() => setActiveCodeTab("diagram")}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                activeCodeTab === "diagram"
                  ? "bg-slate-800 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              diagram.json (Wokwi Circuit)
            </button>
            <button
              onClick={() => setActiveCodeTab("libraries")}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                activeCodeTab === "libraries"
                  ? "bg-slate-800 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              libraries.txt
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const code =
                  activeCodeTab === "sketch"
                    ? sketchCode
                    : activeCodeTab === "diagram"
                    ? diagramJson
                    : librariesTxt;
                copyText(code, activeCodeTab);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-xs flex items-center gap-1"
            >
              {copiedKey === activeCodeTab ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedKey === activeCodeTab ? "Copied" : "Copy Content"}</span>
            </button>

            <button
              onClick={() => {
                if (activeCodeTab === "sketch") downloadFile("sketch.ino", sketchCode);
                else if (activeCodeTab === "diagram") downloadFile("diagram.json", diagramJson);
                else downloadFile("libraries.txt", librariesTxt);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-xs flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code view */}
        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed">
          {activeCodeTab === "sketch" && sketchCode}
          {activeCodeTab === "diagram" && diagramJson}
          {activeCodeTab === "libraries" && librariesTxt}
        </pre>
      </div>
    </div>
  );
};
