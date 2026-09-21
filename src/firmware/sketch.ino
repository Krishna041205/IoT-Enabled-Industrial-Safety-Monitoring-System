/*
  ==============================================================================
  PROJECT: IoT-Enabled Industrial Safety Monitoring System
  AUTHOR:  College Final-Year Engineering Project
  TARGET:  ESP32 Dev Module (Wokwi & Physical Hardware Compatible)
  
  SENSORS:
  - MQ-2 Gas Sensor: Analog (GPIO34), Digital Threshold (GPIO25)
  - DHT22 Sensor: Data (GPIO4) -> Temperature & Humidity
  - SW-420 Vibration Sensor: Digital Out (GPIO27)
  - IR Obstacle Sensor: Digital Out (GPIO26)
  - HC-SR04 Ultrasonic: TRIG (GPIO18), ECHO (GPIO19)
  
  ACTUATORS & INDICATORS:
  - 16x2 LCD (4-bit mode): RS=21, EN=22, D4=23, D5=16, D6=17, D7=2
  - Green LED: GPIO14 (Normal)
  - Yellow LED: GPIO12 (Warning)
  - Red LED: GPIO13 (Critical)
  - Piezo Buzzer: GPIO15
  - Relay Module (DC Exhaust Fan): GPIO5
  ==============================================================================
*/

#include <WiFi.h>
#include <WebServer.h>
#include <LiquidCrystal.h>
#include <DHT.h>

// ==============================================================================
// 1. CONFIGURABLE THRESHOLD CONSTANTS
// ==============================================================================
const int   THRESHOLD_GAS_WARN       = 600;   // ADC counts (0-1023 normalized)
const int   THRESHOLD_GAS_CRIT       = 750;   // ADC counts

const float THRESHOLD_TEMP_WARN      = 45.0;  // Celsius
const float THRESHOLD_TEMP_CRIT      = 55.0;  // Celsius

const float THRESHOLD_HUMIDITY_WARN  = 80.0;  // % Relative Humidity (warning)

const long  THRESHOLD_DIST_WARN      = 100;   // Centimeters (proximity warning)
const long  THRESHOLD_DIST_CRIT      = 30;    // Centimeters (critical collision/crush zone)

// ==============================================================================
// 2. PIN DEFINITIONS (Exact hardware specifications)
// ==============================================================================
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

// LCD 16x2 Pins (Parallel 4-bit)
#define PIN_LCD_RS          21
#define PIN_LCD_EN          22
#define PIN_LCD_D4          23
#define PIN_LCD_D5          16
#define PIN_LCD_D6          17
#define PIN_LCD_D7          2

// ==============================================================================
// 3. OBJECT INSTANTIATION & HARDWARE TYPES
// ==============================================================================
LiquidCrystal lcd(PIN_LCD_RS, PIN_LCD_EN, PIN_LCD_D4, PIN_LCD_D5, PIN_LCD_D6, PIN_LCD_D7);
#define DHTTYPE DHT22
DHT dht(PIN_DHT22_DATA, DHTTYPE);

WebServer server(80);

// Wi-Fi Credentials for AP/STA mode
const char* ssid     = "ESP32-Safety-System";
const char* password = "IndustrialSafe123";

// System States
enum SafetyState {
  STATE_NORMAL,
  STATE_WARNING,
  STATE_CRITICAL
};

struct EventLogItem {
  unsigned long timestampSec;
  char sensor[16];
  char value[16];
  char hazard[24];
  char severity[12];
  char action[36];
};

// Circular buffer for 50 event logs
#define MAX_EVENT_LOGS 50
EventLogItem eventHistory[MAX_EVENT_LOGS];
int eventCount = 0;

// Runtime Sensor Variables
int   rawGasValue         = 0;
float currentTemperature  = 0.0;
float currentHumidity     = 0.0;
bool  vibrationDetected   = false;
bool  irObjectDetected    = false;
long  obstacleDistanceCm  = 0;

// Sensor Health/Error Flags (Failure-Safe Monitoring)
bool errorDHT             = false;
bool errorUltrasonic      = false;
bool errorMQ2             = false;

// Active Hazard Flags & Hazard Count
bool hazardGas            = false;
bool hazardGasCritical    = false;
bool hazardTemp           = false;
bool hazardTempCritical   = false;
bool hazardVibration      = false;
bool hazardDistance       = false;
bool hazardDistanceCrit   = false;
bool hazardIR             = false;
int  totalHazardCount     = 0;

SafetyState currentSafetyState  = STATE_NORMAL;
SafetyState previousSafetyState = STATE_NORMAL;

// Timing trackers
unsigned long lastSensorReadTime  = 0;
unsigned long lastSerialPrintTime = 0;
unsigned long lastLcdCycleTime    = 0;
unsigned long lastBuzzerToggleTime= 0;
int lcdScreenIndex                = 0;
bool buzzerBeepState              = false;

// Demo Mode variables
bool isDemoModeActive             = false;
int  currentDemoScenario          = 1;
unsigned long demoScenarioStartTime = 0;

// ==============================================================================
// 4. FUNCTION DECLARATIONS (Modular Structure)
// ==============================================================================
void setupHardwarePins();
void readGasSensor();
void readTemperature();
void readHumidity();
void readVibration();
void readIR();
void readDistance();
void calculateHazards();
void determineSafetyState();
void activateNormalMode();
void activateWarningMode();
void activateCriticalMode();
void updateActuators();
void updateLCD();
void logEvent(const char* sensor, const char* val, const char* hazard, const char* sev, const char* act);
void printSerialTelemetry();
void setupWebServer();
void handleRoot();
void handleApiStatus();
void handleApiLogs();
void handleDemoToggle();
void runDemoModeScenario();

// ==============================================================================
// 5. INITIALIZATION SETUP
// ==============================================================================
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n==================================================");
  Serial.println(" INDUSTRIAL SAFETY MONITORING SYSTEM (ESP32)");
  Serial.println(" SYSTEM INITIALIZING...");
  Serial.println("==================================================");

  setupHardwarePins();

  // Initialize LCD 16x2
  lcd.begin(16, 2);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SMART FACTORY");
  lcd.setCursor(0, 1);
  lcd.print("INIT SYSTEM...");

  // Initialize DHT22
  dht.begin();

  // Self-test LEDs and Buzzer (Quick confirmation flash)
  digitalWrite(PIN_LED_GREEN, HIGH);
  digitalWrite(PIN_LED_YELLOW, HIGH);
  digitalWrite(PIN_LED_RED, HIGH);
  digitalWrite(PIN_BUZZER, HIGH);
  delay(300);
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  // Setup Wi-Fi SoftAP for standalone demonstration
  WiFi.softAP(ssid, password);
  Serial.print("[WiFi] Access Point Created: ");
  Serial.println(ssid);
  Serial.print("[WiFi] IP Address: ");
  Serial.println(WiFi.softAPIP());

  // Setup Web Server API
  setupWebServer();

  logEvent("SYSTEM", "BOOT", "SELF-TEST PASS", "NORMAL", "ALL PERIPHERALS READY");
  activateNormalMode();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SMART FACTORY");
  lcd.setCursor(0, 1);
  lcd.print("SYSTEM NORMAL");

  Serial.println("[SYSTEM] Initialization Complete. Safety Loop Started.");
}

// ==============================================================================
// 6. MAIN SYSTEM EXECUTION LOOP
// ==============================================================================
void loop() {
  server.handleClient();
  unsigned long now = millis();

  // Check demo mode progression
  if (isDemoModeActive) {
    runDemoModeScenario();
  } else {
    // 1. Read Sensors every 250ms for swift industrial response
    if (now - lastSensorReadTime >= 250) {
      lastSensorReadTime = now;
      readGasSensor();
      readTemperature();
      readHumidity();
      readVibration();
      readIR();
      readDistance();
      calculateHazards();
      determineSafetyState();
    }
  }

  // 2. Actuator Updates (Handles warning buzzer pulses)
  updateActuators();

  // 3. LCD Screen Cycling every 2.5 seconds
  if (now - lastLcdCycleTime >= 2500) {
    lastLcdCycleTime = now;
    lcdScreenIndex = (lcdScreenIndex + 1) % 3;
    updateLCD();
  }

  // 4. Structured Serial Monitor Heartbeat every 1500ms
  if (now - lastSerialPrintTime >= 1500) {
    lastSerialPrintTime = now;
    printSerialTelemetry();
  }
}

// ==============================================================================
// 7. HARDWARE PIN CONFIGURATION
// ==============================================================================
void setupHardwarePins() {
  pinMode(PIN_MQ2_ANALOG, INPUT);
  pinMode(PIN_MQ2_DIGITAL, INPUT);
  pinMode(PIN_VIBRATION_DO, INPUT);
  pinMode(PIN_IR_DO, INPUT);
  pinMode(PIN_ULTRASONIC_TRIG, OUTPUT);
  pinMode(PIN_ULTRASONIC_ECHO, INPUT);

  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_RELAY_IN, OUTPUT);

  // Default Safe Actuator State
  digitalWrite(PIN_BUZZER, LOW);
  digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_GREEN, HIGH);
  digitalWrite(PIN_RELAY_IN, LOW); // Active HIGH or LOW depending on relay board; LOW=OFF
}

// ==============================================================================
// 8. SENSOR ACQUISITION MODULES (With Failure-Safe Logic)
// ==============================================================================
void readGasSensor() {
  int adcVal = analogRead(PIN_MQ2_ANALOG);
  // ESP32 ADC is 12-bit (0-4095). Normalize to 0-1023 scale standard for MQ-2
  rawGasValue = map(adcVal, 0, 4095, 0, 1023);

  // Failure-safe check: Open circuit or invalid ADC
  if (rawGasValue < 0 || rawGasValue > 1023) {
    errorMQ2 = true;
    rawGasValue = 0;
  } else {
    errorMQ2 = false;
  }
}

void readTemperature() {
  float t = dht.readTemperature();
  if (isnan(t)) {
    errorDHT = true;
  } else {
    errorDHT = false;
    currentTemperature = t;
  }
}

void readHumidity() {
  float h = dht.readHumidity();
  if (!isnan(h)) {
    currentHumidity = h;
  }
}

void readVibration() {
  // SW-420 gives HIGH or LOW when triggered depending on sensor wiring
  // Typically HIGH on vibration trigger
  int val = digitalRead(PIN_VIBRATION_DO);
  vibrationDetected = (val == HIGH);
}

void readIR() {
  // IR Obstacle sensor DO is typically active LOW (object detected = LOW)
  // or active HIGH. We test digital reading:
  int val = digitalRead(PIN_IR_DO);
  irObjectDetected = (val == LOW || val == HIGH); // Adjust based on physical module type
}

void readDistance() {
  digitalWrite(PIN_ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_ULTRASONIC_TRIG, LOW);

  long duration = pulseIn(PIN_ULTRASONIC_ECHO, HIGH, 30000); // 30ms timeout (max ~5m)
  if (duration == 0) {
    // Timeout or sensor unattached: retain safe default
    errorUltrasonic = true;
    obstacleDistanceCm = 200; // default safe distance
  } else {
    errorUltrasonic = false;
    obstacleDistanceCm = duration * 0.034 / 2;
  }
}

// ==============================================================================
// 9. MULTI-HAZARD CALCULATION & STATE DETERMINATION
// ==============================================================================
void calculateHazards() {
  hazardGas           = (!errorMQ2 && rawGasValue >= THRESHOLD_GAS_WARN);
  hazardGasCritical   = (!errorMQ2 && rawGasValue >= THRESHOLD_GAS_CRIT);

  hazardTemp          = (!errorDHT && currentTemperature >= THRESHOLD_TEMP_WARN);
  hazardTempCritical  = (!errorDHT && currentTemperature >= THRESHOLD_TEMP_CRIT);

  hazardVibration     = vibrationDetected;

  hazardDistance      = (!errorUltrasonic && obstacleDistanceCm <= THRESHOLD_DIST_WARN);
  hazardDistanceCrit  = (!errorUltrasonic && obstacleDistanceCm < THRESHOLD_DIST_CRIT);

  hazardIR            = irObjectDetected;

  // Compute total active hazards
  totalHazardCount = 0;
  if (hazardGas)          totalHazardCount++;
  if (hazardTemp)         totalHazardCount++;
  if (hazardVibration)    totalHazardCount++;
  if (hazardDistance)     totalHazardCount++;
  if (hazardIR)           totalHazardCount++;
}

void determineSafetyState() {
  SafetyState nextState = STATE_NORMAL;

  // Severe individual hazards trigger immediate CRITICAL
  bool hasSevereSingleHazard = hazardGasCritical || hazardTempCritical || hazardDistanceCrit;

  if (totalHazardCount == 0) {
    nextState = STATE_NORMAL;
  } else if (totalHazardCount >= 2 || hasSevereSingleHazard) {
    nextState = STATE_CRITICAL;
  } else {
    nextState = STATE_WARNING;
  }

  // Handle State Transitions and Logging
  if (nextState != currentSafetyState) {
    previousSafetyState = currentSafetyState;
    currentSafetyState = nextState;

    if (nextState == STATE_NORMAL) {
      activateNormalMode();
      logEvent("MULTI-HAZARD", "0 HAZARDS", "ALL CLEAR", "NORMAL", "GREEN LED ON | FAN/BUZZER OFF");
      Serial.println("\n[STATE] System changed to NORMAL");
    } else if (nextState == STATE_WARNING) {
      activateWarningMode();
      logEvent("MULTI-HAZARD", "1 HAZARD", "HAZARD DETECTED", "WARNING", "YELLOW LED ON | BUZZER PULSE");
      Serial.println("\n[STATE] System changed to WARNING");
    } else if (nextState == STATE_CRITICAL) {
      activateCriticalMode();
      logEvent("MULTI-HAZARD", "SEVERE", "CRITICAL THREAT", "CRITICAL", "RED LED ON | ALARM | FAN ACTIVATED");
      Serial.println("\n[STATE] System changed to CRITICAL");
      Serial.println("[ACTION] Exhaust fan activated via Relay GPIO5");
      Serial.println("[ACTION] Emergency audible buzzer triggered");
    }
    updateLCD(); // Immediately refresh LCD with alert screen
  }
}

// ==============================================================================
// 10. LOCAL RESPONSE MODES
// ==============================================================================
void activateNormalMode() {
  digitalWrite(PIN_LED_GREEN, HIGH);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_BUZZER, LOW);
  digitalWrite(PIN_RELAY_IN, LOW); // Relay OFF -> Fan OFF
}

void activateWarningMode() {
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_YELLOW, HIGH);
  digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_RELAY_IN, LOW); // Fan remains standby during single warning
}

void activateCriticalMode() {
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, HIGH);
  digitalWrite(PIN_BUZZER, HIGH);
  digitalWrite(PIN_RELAY_IN, HIGH); // Relay ON -> Fan ON
}

void updateActuators() {
  if (currentSafetyState == STATE_WARNING) {
    // Intermittent buzzer (500ms ON / 500ms OFF)
    unsigned long now = millis();
    if (now - lastBuzzerToggleTime >= 500) {
      lastBuzzerToggleTime = now;
      buzzerBeepState = !buzzerBeepState;
      digitalWrite(PIN_BUZZER, buzzerBeepState ? HIGH : LOW);
    }
  } else if (currentSafetyState == STATE_CRITICAL) {
    digitalWrite(PIN_BUZZER, HIGH);
    digitalWrite(PIN_RELAY_IN, HIGH);
  } else {
    digitalWrite(PIN_BUZZER, LOW);
    digitalWrite(PIN_RELAY_IN, LOW);
  }
}

// ==============================================================================
// 11. 16x2 LCD DISPLAY CONTROLLER
// ==============================================================================
void updateLCD() {
  lcd.clear();

  if (currentSafetyState == STATE_CRITICAL) {
    // Immediate Priority Alerts
    if (hazardGasCritical) {
      lcd.setCursor(0, 0);
      lcd.print("GAS ALERT!");
      lcd.setCursor(0, 1);
      lcd.print("VALUE: ");
      lcd.print(rawGasValue);
    } else if (hazardTempCritical) {
      lcd.setCursor(0, 0);
      lcd.print("HIGH TEMP ALERT");
      lcd.setCursor(0, 1);
      lcd.print("TEMP: ");
      lcd.print(currentTemperature, 1);
      lcd.print(" C");
    } else if (hazardDistanceCrit) {
      lcd.setCursor(0, 0);
      lcd.print("PROXIMITY ALERT");
      lcd.setCursor(0, 1);
      lcd.print("DIST: ");
      lcd.print(obstacleDistanceCm);
      lcd.print(" cm");
    } else {
      lcd.setCursor(0, 0);
      lcd.print("CRITICAL ALERT");
      lcd.setCursor(0, 1);
      lcd.print(totalHazardCount);
      lcd.print(" HAZARDS ACTIVE");
    }
  } else if (currentSafetyState == STATE_WARNING) {
    if (hazardVibration) {
      lcd.setCursor(0, 0);
      lcd.print("VIBRATION ALERT");
      lcd.setCursor(0, 1);
      lcd.print("CHECK MACHINE");
    } else if (hazardGas) {
      lcd.setCursor(0, 0);
      lcd.print("GAS WARNING");
      lcd.setCursor(0, 1);
      lcd.print("LEVEL: ");
      lcd.print(rawGasValue);
    } else if (hazardTemp) {
      lcd.setCursor(0, 0);
      lcd.print("HIGH TEMP ALERT");
      lcd.setCursor(0, 1);
      lcd.print("TEMP: ");
      lcd.print(currentTemperature, 1);
      lcd.print(" C");
    } else if (hazardIR) {
      lcd.setCursor(0, 0);
      lcd.print("IR PROX WARNING");
      lcd.setCursor(0, 1);
      lcd.print("OBJECT DETECTED");
    } else {
      lcd.setCursor(0, 0);
      lcd.print("SYSTEM WARNING");
      lcd.setCursor(0, 1);
      lcd.print("1 HAZARD ACTIVE");
    }
  } else {
    // Normal Cycling Screens
    if (lcdScreenIndex == 0) {
      lcd.setCursor(0, 0);
      lcd.print("SMART FACTORY");
      lcd.setCursor(0, 1);
      lcd.print("SYSTEM NORMAL");
    } else if (lcdScreenIndex == 1) {
      lcd.setCursor(0, 0);
      lcd.print("GAS: ");
      lcd.print(rawGasValue);
      lcd.setCursor(0, 1);
      lcd.print("TEMP: ");
      lcd.print(currentTemperature, 1);
      lcd.print(" C");
    } else {
      lcd.setCursor(0, 0);
      lcd.print("HUM: ");
      lcd.print(currentHumidity, 0);
      lcd.print("%");
      lcd.setCursor(0, 1);
      lcd.print("DIST: ");
      lcd.print(obstacleDistanceCm);
      lcd.print(" cm");
    }
  }
}

// ==============================================================================
// 12. EVENT LOGGING ENGINE
// ==============================================================================
void logEvent(const char* sensor, const char* val, const char* hazard, const char* sev, const char* act) {
  int index = eventCount % MAX_EVENT_LOGS;
  eventHistory[index].timestampSec = millis() / 1000;
  strncpy(eventHistory[index].sensor, sensor, 15);
  strncpy(eventHistory[index].value, val, 15);
  strncpy(eventHistory[index].hazard, hazard, 23);
  strncpy(eventHistory[index].severity, sev, 11);
  strncpy(eventHistory[index].action, act, 35);
  eventCount++;
}

// ==============================================================================
// 13. STRUCTURED SERIAL MONITOR OUTPUT
// ==============================================================================
void printSerialTelemetry() {
  Serial.println("==============================");
  Serial.println("INDUSTRIAL SAFETY MONITOR");
  Serial.println("==============================");
  Serial.print("Gas:         "); Serial.print(rawGasValue); Serial.println(errorMQ2 ? " [ERR]" : "");
  Serial.print("Temperature: "); Serial.print(currentTemperature, 1); Serial.print(" C"); Serial.println(errorDHT ? " [ERR]" : "");
  Serial.print("Humidity:    "); Serial.print(currentHumidity, 1); Serial.println(" %");
  Serial.print("Vibration:   "); Serial.println(vibrationDetected ? "DETECTED" : "NORMAL");
  Serial.print("IR:          "); Serial.println(irObjectDetected ? "OBJECT PRESENT" : "CLEAR");
  Serial.print("Distance:    "); Serial.print(obstacleDistanceCm); Serial.print(" cm"); Serial.println(errorUltrasonic ? " [ERR]" : "");
  Serial.println("------------------------------");
  Serial.print("Hazards:     "); Serial.println(totalHazardCount);
  Serial.print("Safety State: ");
  if (currentSafetyState == STATE_NORMAL)      Serial.println("NORMAL");
  else if (currentSafetyState == STATE_WARNING) Serial.println("WARNING");
  else                                         Serial.println("CRITICAL");
  Serial.print("Buzzer:      ");
  Serial.println(currentSafetyState == STATE_CRITICAL ? "ON (Continuous)" : currentSafetyState == STATE_WARNING ? "Intermittent" : "OFF");
  Serial.print("Fan:         "); Serial.println(currentSafetyState == STATE_CRITICAL ? "RUNNING" : "OFF");
  Serial.print("Relay:       "); Serial.println(digitalRead(PIN_RELAY_IN) ? "ON" : "OFF");
  Serial.println("==============================");
}

// ==============================================================================
// 14. AUTOMATED DEMO MODE (For College Faculty Presentation)
// ==============================================================================
void runDemoModeScenario() {
  unsigned long now = millis();
  // Switch scenarios every 7 seconds
  if (now - demoScenarioStartTime >= 7000) {
    demoScenarioStartTime = now;
    currentDemoScenario = (currentDemoScenario % 6) + 1;

    Serial.println();
    Serial.print("===== DEMO SCENARIO ");
    Serial.print(currentDemoScenario);
    Serial.println(" =====");

    switch (currentDemoScenario) {
      case 1:
        Serial.println("NORMAL");
        rawGasValue = 320;
        currentTemperature = 28.0;
        currentHumidity = 50.0;
        vibrationDetected = false;
        irObjectDetected = false;
        obstacleDistanceCm = 150;
        break;
      case 2:
        Serial.println("GAS LEAK");
        rawGasValue = 820; // > 750
        currentTemperature = 28.0;
        vibrationDetected = false;
        obstacleDistanceCm = 150;
        Serial.println("[ALERT] Gas threshold exceeded");
        break;
      case 3:
        Serial.println("HIGH TEMPERATURE");
        rawGasValue = 320;
        currentTemperature = 58.0; // > 55 C
        vibrationDetected = false;
        obstacleDistanceCm = 150;
        Serial.println("[ALERT] High temperature detected");
        break;
      case 4:
        Serial.println("VIBRATION");
        rawGasValue = 320;
        currentTemperature = 28.0;
        vibrationDetected = true;
        obstacleDistanceCm = 150;
        Serial.println("[ALERT] Vibration detected");
        break;
      case 5:
        Serial.println("OBSTACLE/PERSON TOO CLOSE");
        rawGasValue = 320;
        currentTemperature = 28.0;
        vibrationDetected = false;
        irObjectDetected = true;
        obstacleDistanceCm = 18; // < 30 cm
        Serial.println("[ALERT] Person in critical machine proximity");
        break;
      case 6:
        Serial.println("MULTIPLE SIMULTANEOUS HAZARDS");
        rawGasValue = 810;
        currentTemperature = 57.5;
        vibrationDetected = true;
        irObjectDetected = true;
        obstacleDistanceCm = 20;
        Serial.println("[ALERT] Multiple hazards triggered concurrently!");
        break;
    }

    calculateHazards();
    determineSafetyState();
  }
}

// ==============================================================================
// 15. EMBEDDED IoT WEB SERVER & REST API
// ==============================================================================
void setupWebServer() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/api/status", HTTP_GET, handleApiStatus);
  server.on("/api/logs", HTTP_GET, handleApiLogs);
  server.on("/api/demo", HTTP_POST, handleDemoToggle);
  server.begin();
}

void handleRoot() {
  String html = "<!DOCTYPE html><html><head><title>ESP32 Safety Gateway</title></head>";
  html += "<body style='font-family:sans-serif;padding:20px;background:#f3f4f6;'>";
  html += "<h2>ESP32 Industrial Safety Monitor</h2>";
  html += "<p>State: <b>" + String(currentSafetyState == STATE_NORMAL ? "NORMAL" : currentSafetyState == STATE_WARNING ? "WARNING" : "CRITICAL") + "</b></p>";
  html += "<p>Gas: " + String(rawGasValue) + " | Temp: " + String(currentTemperature, 1) + "C | Dist: " + String(obstacleDistanceCm) + "cm</p>";
  html += "<p><a href='/api/status'>JSON Status API</a> | <a href='/api/logs'>JSON Event Logs API</a></p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void handleApiStatus() {
  String json = "{";
  json += "\"gas\":" + String(rawGasValue) + ",";
  json += "\"temperature\":" + String(currentTemperature, 1) + ",";
  json += "\"humidity\":" + String(currentHumidity, 1) + ",";
  json += "\"distance\":" + String(obstacleDistanceCm) + ",";
  json += "\"vibration\":" + String(vibrationDetected ? "true" : "false") + ",";
  json += "\"ir\":" + String(irObjectDetected ? "true" : "false") + ",";
  json += "\"state\":\"" + String(currentSafetyState == STATE_NORMAL ? "NORMAL" : currentSafetyState == STATE_WARNING ? "WARNING" : "CRITICAL") + "\",";
  json += "\"hazardCount\":" + String(totalHazardCount) + ",";
  json += "\"fan\":" + String(digitalRead(PIN_RELAY_IN) ? "true" : "false") + ",";
  json += "\"buzzer\":" + String(currentSafetyState != STATE_NORMAL ? "true" : "false");
  json += "}";
  server.send(200, "application/json", json);
}

void handleApiLogs() {
  String json = "[";
  int count = eventCount < MAX_EVENT_LOGS ? eventCount : MAX_EVENT_LOGS;
  for (int i = 0; i < count; i++) {
    json += "{\"sec\":" + String(eventHistory[i].timestampSec) + ",";
    json += "\"sensor\":\"" + String(eventHistory[i].sensor) + "\",";
    json += "\"value\":\"" + String(eventHistory[i].value) + "\",";
    json += "\"hazard\":\"" + String(eventHistory[i].hazard) + "\",";
    json += "\"severity\":\"" + String(eventHistory[i].severity) + "\",";
    json += "\"action\":\"" + String(eventHistory[i].action) + "\"}";
    if (i < count - 1) json += ",";
  }
  json += "]";
  server.send(200, "application/json", json);
}

void handleDemoToggle() {
  isDemoModeActive = !isDemoModeActive;
  if (isDemoModeActive) {
    currentDemoScenario = 1;
    demoScenarioStartTime = millis();
    Serial.println("[DEMO] Demo mode activated via Web API");
  } else {
    Serial.println("[DEMO] Demo mode deactivated via Web API");
    activateNormalMode();
  }
  server.send(200, "application/json", "{\"demoMode\":" + String(isDemoModeActive ? "true" : "false") + "}");
}
