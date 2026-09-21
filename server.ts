import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Core Safety Constants (matching Section 4 & 5 of requirements) ---
export const THRESHOLD_GAS_WARN = 600;
export const THRESHOLD_GAS_CRIT = 750;

export const THRESHOLD_TEMP_WARN = 45.0; // °C
export const THRESHOLD_TEMP_CRIT = 55.0; // °C

export const THRESHOLD_DIST_WARN = 100; // cm
export const THRESHOLD_DIST_CRIT = 30;  // cm

export interface SensorState {
  gas: number;            // 0 - 1023 (analog reading)
  temperature: number;    // °C
  humidity: number;       // %
  vibration: boolean;     // SW-420 trigger
  ir: boolean;            // IR detected obstacle
  distance: number;       // cm
  sensorFaults: {
    gas: boolean;
    dht: boolean;
    vibration: boolean;
    ir: boolean;
    distance: boolean;
  };
}

export type SafetyState = "NORMAL" | "WARNING" | "CRITICAL";

export interface EventLog {
  id: string;
  timestamp: string;
  sensor: string;
  value: string;
  hazard: string;
  severity: SafetyState;
  action: string;
}

export interface SystemStatus {
  // Sensors
  gas: number;
  temperature: number;
  humidity: number;
  vibration: boolean;
  ir: boolean;
  distance: number;
  sensorFaults: {
    gas: boolean;
    dht: boolean;
    vibration: boolean;
    ir: boolean;
    distance: boolean;
  };
  
  // Evaluation
  state: SafetyState;
  hazardCount: number;
  activeHazards: string[];
  
  // Actuators
  greenLed: boolean;
  yellowLed: boolean;
  redLed: boolean;
  buzzer: boolean;
  buzzerMode: "OFF" | "INTERMITTENT" | "CONTINUOUS";
  relay: boolean;
  fan: boolean;
  
  // LCD state
  lcdScreenIndex: number;
  lcdLine1: string;
  lcdLine2: string;
  
  // Demo Mode
  demoMode: boolean;
  currentScenario: number;
  demoTimerRemaining: number;
  
  // Metadata
  uptimeSeconds: number;
  lastUpdated: string;
}

class SafetySystemEngine {
  private sensors: SensorState = {
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
  };

  private state: SafetyState = "NORMAL";
  private previousState: SafetyState = "NORMAL";
  private hazardCount = 0;
  private activeHazards: string[] = [];
  private eventLogs: EventLog[] = [];
  private uptime = 0;
  private lcdScreenIndex = 0;
  private lcdTick = 0;

  // Demo mode properties
  private demoMode = false;
  private currentScenario = 0;
  private scenarioTimer = 8; // seconds per scenario

  // Serial logs buffer for live terminal display
  private serialLogs: string[] = [];

  constructor() {
    this.addLog("SYSTEM", "BOOT", "SYSTEM INITIALIZED", "NORMAL", "ALL ACTUATORS TESTED OK");
    this.appendSerial("==================================================");
    this.appendSerial(" INDUSTRIAL SAFETY MONITORING SYSTEM (ESP32)");
    this.appendSerial(" FIRMWARE v2.4.1 - MULTI-HAZARD DETECTOR READY");
    this.appendSerial("==================================================");
    this.evaluate();

    // 1-second system clock ticker
    setInterval(() => {
      this.tick();
    }, 1000);
  }

  private appendSerial(message: string) {
    const timeStr = new Date().toLocaleTimeString();
    this.serialLogs.push(`[${timeStr}] ${message}`);
    if (this.serialLogs.length > 200) {
      this.serialLogs.shift();
    }
  }

  public getSerialLogs(): string[] {
    return [...this.serialLogs];
  }

  public clearSerialLogs() {
    this.serialLogs = [];
  }

  private addLog(sensor: string, value: string, hazard: string, severity: SafetyState, action: string) {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0]; // HH:MM:SS
    const newLog: EventLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timeStr,
      sensor,
      value,
      hazard,
      severity,
      action,
    };

    this.eventLogs.unshift(newLog);
    if (this.eventLogs.length > 100) {
      this.eventLogs.pop();
    }
  }

  public setSensors(partial: Partial<SensorState>) {
    if (this.demoMode) {
      this.demoMode = false;
      this.appendSerial("[INFO] Demo mode aborted by manual sensor adjustment");
    }

    if (partial.gas !== undefined) this.sensors.gas = Math.max(0, Math.min(1023, Math.round(partial.gas)));
    if (partial.temperature !== undefined) this.sensors.temperature = parseFloat(partial.temperature.toFixed(1));
    if (partial.humidity !== undefined) this.sensors.humidity = Math.max(0, Math.min(100, Math.round(partial.humidity)));
    if (partial.vibration !== undefined) this.sensors.vibration = Boolean(partial.vibration);
    if (partial.ir !== undefined) this.sensors.ir = Boolean(partial.ir);
    if (partial.distance !== undefined) this.sensors.distance = Math.max(2, Math.min(400, Math.round(partial.distance)));
    if (partial.sensorFaults !== undefined) {
      this.sensors.sensorFaults = { ...this.sensors.sensorFaults, ...partial.sensorFaults };
    }

    this.evaluate();
  }

  public setDemoMode(enable: boolean, targetScenario?: number) {
    this.demoMode = enable;
    if (enable) {
      this.currentScenario = targetScenario !== undefined ? targetScenario : 1;
      this.scenarioTimer = 8;
      this.applyDemoScenario(this.currentScenario);
      this.appendSerial(`===== DEMO MODE STARTED: SCENARIO ${this.currentScenario} =====`);
    } else {
      this.appendSerial("===== DEMO MODE STOPPED =====");
    }
    this.evaluate();
  }

  public applyDemoScenario(scenario: number) {
    this.currentScenario = scenario;
    this.scenarioTimer = 8;
    switch (scenario) {
      case 1:
        // Scenario 1: NORMAL
        this.sensors.gas = 310;
        this.sensors.temperature = 27.2;
        this.sensors.humidity = 52.0;
        this.sensors.vibration = false;
        this.sensors.ir = false;
        this.sensors.distance = 150;
        this.appendSerial("===== DEMO SCENARIO 1: NORMAL ENVIRONMENT =====");
        break;

      case 2:
        // Scenario 2: Gas Leak
        this.sensors.gas = 835; // > 750 CRITICAL
        this.sensors.temperature = 29.0;
        this.sensors.humidity = 54.0;
        this.sensors.vibration = false;
        this.sensors.ir = false;
        this.sensors.distance = 140;
        this.appendSerial("===== DEMO SCENARIO 2: GAS LEAK HAZARD =====");
        this.appendSerial("[ALERT] Gas threshold exceeded: 835 PPM");
        break;

      case 3:
        // Scenario 3: High Temperature
        this.sensors.gas = 340;
        this.sensors.temperature = 58.6; // > 55 CRITICAL
        this.sensors.humidity = 40.0;
        this.sensors.vibration = false;
        this.sensors.ir = false;
        this.sensors.distance = 135;
        this.appendSerial("===== DEMO SCENARIO 3: HIGH TEMPERATURE HAZARD =====");
        this.appendSerial("[ALERT] High temperature detected: 58.6 °C");
        break;

      case 4:
        // Scenario 4: Machine Vibration
        this.sensors.gas = 350;
        this.sensors.temperature = 31.0;
        this.sensors.humidity = 50.0;
        this.sensors.vibration = true;
        this.sensors.ir = false;
        this.sensors.distance = 130;
        this.appendSerial("===== DEMO SCENARIO 4: EXCESSIVE MACHINE VIBRATION =====");
        this.appendSerial("[ALERT] SW-420 Vibration sensor triggered");
        break;

      case 5:
        // Scenario 5: Obstacle / Person too close
        this.sensors.gas = 330;
        this.sensors.temperature = 28.0;
        this.sensors.humidity = 53.0;
        this.sensors.vibration = false;
        this.sensors.ir = true;
        this.sensors.distance = 18; // < 30 CRITICAL
        this.appendSerial("===== DEMO SCENARIO 5: OBSTACLE / PERSON TOO CLOSE =====");
        this.appendSerial("[ALERT] Ultrasonic distance critical (<30cm): 18 cm");
        break;

      case 6:
        // Scenario 6: Multiple Simultaneous Hazards
        this.sensors.gas = 815;           // Hazard 1
        this.sensors.temperature = 59.2;  // Hazard 2
        this.sensors.vibration = true;    // Hazard 3
        this.sensors.ir = true;           // Hazard 4
        this.sensors.distance = 22;       // Hazard 5
        this.appendSerial("===== DEMO SCENARIO 6: MULTI-HAZARD SIMULTANEOUS DISASTER =====");
        this.appendSerial("[ALERT] Multiple concurrent hazards detected!");
        break;

      default:
        this.currentScenario = 1;
        this.applyDemoScenario(1);
    }
  }

  public resetToNormal() {
    this.demoMode = false;
    this.currentScenario = 0;
    this.sensors = {
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
    };
    this.evaluate();
    this.addLog("SYSTEM", "USER", "SYSTEM RESET", "NORMAL", "RESTORED NOMINAL FACTORY STATE");
    this.appendSerial("[INFO] System manually reset to nominal factory state");
  }

  public clearLogs() {
    this.eventLogs = [];
  }

  // Evaluate hazards and classify safety state according to specifications
  private evaluate() {
    const hazards: string[] = [];
    let severeHazardCount = 0;

    // 1. Gas Sensor Evaluation
    if (!this.sensors.sensorFaults.gas) {
      if (this.sensors.gas >= THRESHOLD_GAS_CRIT) {
        hazards.push("GAS LEAK CRITICAL");
        severeHazardCount++;
      } else if (this.sensors.gas >= THRESHOLD_GAS_WARN) {
        hazards.push("GAS LEAK WARNING");
      }
    } else {
      hazards.push("MQ-2 FAULT");
    }

    // 2. Temperature Evaluation
    if (!this.sensors.sensorFaults.dht) {
      if (this.sensors.temperature >= THRESHOLD_TEMP_CRIT) {
        hazards.push("HIGH TEMPERATURE");
        severeHazardCount++;
      } else if (this.sensors.temperature >= THRESHOLD_TEMP_WARN) {
        hazards.push("ELEVATED TEMPERATURE");
      }
    } else {
      hazards.push("DHT22 FAULT");
    }

    // 3. Vibration Evaluation
    if (!this.sensors.sensorFaults.vibration) {
      if (this.sensors.vibration) {
        hazards.push("MACHINE VIBRATION");
      }
    }

    // 4. Distance / Proximity Evaluation
    if (!this.sensors.sensorFaults.distance) {
      if (this.sensors.distance < THRESHOLD_DIST_CRIT) {
        hazards.push("CRITICAL PROXIMITY");
        severeHazardCount++;
      } else if (this.sensors.distance <= THRESHOLD_DIST_WARN) {
        hazards.push("OBSTACLE WARNING");
      }
    }

    // 5. IR Proximity Evaluation
    if (!this.sensors.sensorFaults.ir) {
      if (this.sensors.ir) {
        hazards.push("IR OBJECT DETECTED");
      }
    }

    this.activeHazards = hazards;
    this.hazardCount = hazards.length;

    // Safety Logic Classification
    // 0 hazards: NORMAL
    // 1 hazard: WARNING (unless severe hazard like Gas > 750 or Temp > 55 or Dist < 30)
    // 2 or more hazards: CRITICAL
    let nextState: SafetyState = "NORMAL";
    if (this.hazardCount === 0) {
      nextState = "NORMAL";
    } else if (this.hazardCount >= 2 || severeHazardCount >= 1) {
      nextState = "CRITICAL";
    } else {
      nextState = "WARNING";
    }

    // Check for state transitions and log events
    if (nextState !== this.state) {
      this.previousState = this.state;
      this.state = nextState;

      let action = "STATUS STANDBY";
      if (nextState === "NORMAL") {
        action = "GREEN LED ON | BUZZER OFF | FAN OFF | RELAY OFF";
        this.appendSerial("[STATE] System changed to NORMAL");
      } else if (nextState === "WARNING") {
        action = "YELLOW LED ON | BUZZER INTERMITTENT | FAN STANDBY";
        this.appendSerial("[STATE] System changed to WARNING");
      } else if (nextState === "CRITICAL") {
        action = "RED LED ON | BUZZER ON | EXHAUST FAN ACTIVATED | RELAY ON";
        this.appendSerial("[STATE] System changed to CRITICAL");
        this.appendSerial("[ACTION] Exhaust fan activated");
        this.appendSerial("[ACTION] Emergency audible buzzer activated");
      }

      this.addLog(
        "MULTI-HAZARD",
        `${this.hazardCount} ACTIVE`,
        this.activeHazards.join(", ") || "NONE",
        nextState,
        action
      );
    }
  }

  // Periodic tick (every 1 second)
  private tick() {
    this.uptime++;
    this.lcdTick++;

    // Demo Mode Auto-Advancement
    if (this.demoMode) {
      this.scenarioTimer--;
      if (this.scenarioTimer <= 0) {
        this.currentScenario = (this.currentScenario % 6) + 1;
        this.applyDemoScenario(this.currentScenario);
      }
    }

    // Cycle LCD screen every 3 seconds if not in alert, or update alert view
    if (this.lcdTick >= 3) {
      this.lcdTick = 0;
      this.lcdScreenIndex = (this.lcdScreenIndex + 1) % 3;
    }

    // Periodically print structured info to serial monitor (every 2 seconds)
    if (this.uptime % 2 === 0) {
      this.printSerialHeartbeat();
    }
  }

  private printSerialHeartbeat() {
    this.appendSerial("==============================");
    this.appendSerial("  INDUSTRIAL SAFETY MONITOR");
    this.appendSerial("==============================");
    this.appendSerial(`Gas:         ${this.sensors.gas} ADC`);
    this.appendSerial(`Temperature: ${this.sensors.temperature.toFixed(1)} °C`);
    this.appendSerial(`Humidity:    ${this.sensors.humidity.toFixed(0)} %`);
    this.appendSerial(`Vibration:   ${this.sensors.vibration ? "DETECTED (HIGH)" : "NONE (LOW)"}`);
    this.appendSerial(`IR:          ${this.sensors.ir ? "OBJECT PRESENT" : "CLEAR"}`);
    this.appendSerial(`Distance:    ${this.sensors.distance} cm`);
    this.appendSerial("------------------------------");
    this.appendSerial(`Hazards:     ${this.hazardCount} (${this.activeHazards.join(", ") || "None"})`);
    this.appendSerial(`Safety State: ${this.state}`);
    this.appendSerial(`Buzzer:      ${this.state === "CRITICAL" ? "ON (ALARM)" : this.state === "WARNING" ? "INTERMITTENT" : "OFF"}`);
    this.appendSerial(`Fan:         ${this.state === "CRITICAL" ? "RUNNING (100%)" : "OFF"}`);
    this.appendSerial(`Relay:       ${this.state === "CRITICAL" ? "ENERGIZED (CLOSED)" : "OPEN"}`);
    this.appendSerial("==============================");
  }

  public getStatus(): SystemStatus {
    const isCrit = this.state === "CRITICAL";
    const isWarn = this.state === "WARNING";
    const isNorm = this.state === "NORMAL";

    // Format 16x2 LCD display strings
    let line1 = "";
    let line2 = "";

    if (isCrit) {
      if (this.sensors.gas >= THRESHOLD_GAS_CRIT) {
        line1 = "GAS ALERT!";
        line2 = `VALUE: ${this.sensors.gas} ADC`;
      } else if (this.sensors.temperature >= THRESHOLD_TEMP_CRIT) {
        line1 = "HIGH TEMP ALERT";
        line2 = `TEMP: ${this.sensors.temperature.toFixed(1)} C`;
      } else if (this.sensors.distance < THRESHOLD_DIST_CRIT) {
        line1 = "PROXIMITY ALERT";
        line2 = `DIST: ${this.sensors.distance} cm`;
      } else {
        line1 = "CRITICAL ALERT";
        line2 = `${this.hazardCount} HAZARDS ACTIVE`;
      }
    } else if (isWarn) {
      if (this.sensors.vibration) {
        line1 = "VIBRATION ALERT";
        line2 = "CHECK MACHINE";
      } else if (this.sensors.gas >= THRESHOLD_GAS_WARN) {
        line1 = "GAS WARNING";
        line2 = `LEVEL: ${this.sensors.gas} ADC`;
      } else if (this.sensors.temperature >= THRESHOLD_TEMP_WARN) {
        line1 = "WARM TEMP ALERT";
        line2 = `TEMP: ${this.sensors.temperature.toFixed(1)} C`;
      } else if (this.sensors.ir) {
        line1 = "IR PROX WARNING";
        line2 = "OBJECT DETECTED";
      } else {
        line1 = "SYSTEM WARNING";
        line2 = `${this.hazardCount} HAZARD ACTIVE`;
      }
    } else {
      // Normal cycling
      if (this.lcdScreenIndex === 0) {
        line1 = "SMART FACTORY";
        line2 = "SYSTEM NORMAL";
      } else if (this.lcdScreenIndex === 1) {
        line1 = `GAS: ${this.sensors.gas}`;
        line2 = `TEMP: ${this.sensors.temperature.toFixed(1)} C`;
      } else {
        line1 = `HUM: ${this.sensors.humidity.toFixed(0)}%`;
        line2 = `DIST: ${this.sensors.distance} cm`;
      }
    }

    return {
      gas: this.sensors.gas,
      temperature: this.sensors.temperature,
      humidity: this.sensors.humidity,
      vibration: this.sensors.vibration,
      ir: this.sensors.ir,
      distance: this.sensors.distance,
      sensorFaults: this.sensors.sensorFaults,

      state: this.state,
      hazardCount: this.hazardCount,
      activeHazards: this.activeHazards,

      greenLed: isNorm,
      yellowLed: isWarn,
      redLed: isCrit,
      buzzer: isCrit || isWarn,
      buzzerMode: isCrit ? "CONTINUOUS" : isWarn ? "INTERMITTENT" : "OFF",
      relay: isCrit,
      fan: isCrit,

      lcdScreenIndex: this.lcdScreenIndex,
      lcdLine1: line1.padEnd(16).substring(0, 16),
      lcdLine2: line2.padEnd(16).substring(0, 16),

      demoMode: this.demoMode,
      currentScenario: this.currentScenario,
      demoTimerRemaining: this.scenarioTimer,

      uptimeSeconds: this.uptime,
      lastUpdated: new Date().toISOString(),
    };
  }

  public getLogs(): EventLog[] {
    return [...this.eventLogs];
  }
}

const engine = new SafetySystemEngine();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes (Prefix /api) ---

  // 1. GET /api/status - Returns complete live telemetry, hazard evaluation & actuator states
  app.get("/api/status", (_req, res) => {
    res.json(engine.getStatus());
  });

  // 2. GET /api/logs - Returns event history (last 50+ events)
  app.get("/api/logs", (_req, res) => {
    res.json(engine.getLogs());
  });

  // 3. GET /api/serial - Returns recent serial monitor stream logs
  app.get("/api/serial", (_req, res) => {
    res.json({ logs: engine.getSerialLogs() });
  });

  // 4. POST /api/sensor - Updates sensor values or injects faults
  app.post("/api/sensor", (req, res) => {
    try {
      engine.setSensors(req.body);
      res.json({ success: true, status: engine.getStatus() });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message });
    }
  });

  // 5. POST /api/demo - Starts, stops or jumps to a demo scenario (1 to 6)
  app.post("/api/demo", (req, res) => {
    const { enable, scenario } = req.body;
    engine.setDemoMode(Boolean(enable), scenario !== undefined ? Number(scenario) : undefined);
    res.json({ success: true, status: engine.getStatus() });
  });

  // 6. POST /api/reset - Resets to nominal factory safe state
  app.post("/api/reset", (_req, res) => {
    engine.resetToNormal();
    res.json({ success: true, status: engine.getStatus() });
  });

  // 7. POST /api/logs/clear - Clears event history
  app.post("/api/logs/clear", (_req, res) => {
    engine.clearLogs();
    res.json({ success: true });
  });

  // 8. POST /api/serial/clear - Clears serial buffer
  app.post("/api/serial/clear", (_req, res) => {
    engine.clearSerialLogs();
    res.json({ success: true });
  });

  // --- Vite Dev Server Middleware or Static Serving ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[IoT Safety Gateway] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
