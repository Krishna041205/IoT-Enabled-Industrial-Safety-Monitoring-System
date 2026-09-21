export type SafetyState = "NORMAL" | "WARNING" | "CRITICAL";

export interface SensorFaults {
  gas: boolean;
  dht: boolean;
  vibration: boolean;
  ir: boolean;
  distance: boolean;
}

export interface SensorData {
  gas: number;          // 0 - 1023 ADC
  temperature: number;  // -20 to 100 °C
  humidity: number;     // 0 - 100 %
  vibration: boolean;   // true / false
  ir: boolean;          // true / false
  distance: number;     // 2 - 400 cm
  sensorFaults: SensorFaults;
}

export interface EventLog {
  id: string;
  timestamp: string;
  sensor: string;
  value: string;
  hazard: string;
  severity: SafetyState;
  action: string;
}

export interface SystemStatus extends SensorData {
  state: SafetyState;
  hazardCount: number;
  activeHazards: string[];

  greenLed: boolean;
  yellowLed: boolean;
  redLed: boolean;
  buzzer: boolean;
  buzzerMode: "OFF" | "INTERMITTENT" | "CONTINUOUS";
  relay: boolean;
  fan: boolean;

  lcdScreenIndex: number;
  lcdLine1: string;
  lcdLine2: string;

  demoMode: boolean;
  currentScenario: number;
  demoTimerRemaining: number;

  uptimeSeconds: number;
  lastUpdated: string;
}

export interface DemoScenarioInfo {
  id: number;
  name: string;
  description: string;
  expectedState: SafetyState;
  sensorValues: Partial<SensorData>;
}
