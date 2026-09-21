# IoT-Enabled Industrial Safety Monitoring System
**College Final-Year Capstone Project | Embedded Systems, IoT & Industrial Automation**

An end-to-end, multi-hazard industrial safety automation platform powered by the **ESP32 microcontroller**, integrating real-time gas monitoring, environmental climate tracking, structural vibration detection, and human proximity interlocking with local fail-safe actuators and an IoT SCADA dashboard.

---

## 1. Project Objective & Scope

Industrial environments (chemical facilities, manufacturing plants, heavy machinery halls) face risks from combustible gas leaks, runaway thermal conditions, machinery bearing failures, and unauthorized personnel in machine pinch zones.

This project delivers:
1. **Continuous Multi-Sensor Telemetry**:
   - **MQ-2 Gas Sensor**: Combustible gases, smoke, LPG, CO.
   - **DHT22 Sensor**: Ambient temperature & relative humidity.
   - **SW-420 Piezo Vibration Sensor**: Mechanical anomalies & bearing failure.
   - **IR Obstacle Sensor**: Immediate human perimeter intrusion.
   - **HC-SR04 Ultrasonic Sensor**: Fine machine clearance & distance to pinch points.
2. **Deterministic Safety State Classification**:
   - **NORMAL (Safe)**: All sensors within nominal tolerances.
   - **WARNING (Cautionary)**: Exactly 1 non-severe hazard detected.
   - **CRITICAL (Emergency)**: $\ge 2$ hazards OR any severe individual threshold breach (gas $>750$, temp $>55^\circ\text{C}$, distance $<30\text{ cm}$).
3. **Local Fail-Safe Actuation**:
   - High-luminance status beacons: Green (Normal), Yellow (Warning), Red (Critical).
   - Piezo Acoustic Sounder: Intermittent pulsed tone on Warning, continuous high-frequency scream on Critical.
   - Relay-Driven Industrial Exhaust Fan: Automatic ventilation interlock on critical hazards.
   - 16x2 HD44780 LCD: Rotating operational displays (Screen 1, 2, 3) with preemptive emergency override alerts.
4. **Cloud & IoT Web SCADA Dashboard**:
   - Real-time telemetry streaming via asynchronous REST APIs (`/api/status`, `/api/logs`).
   - Circular historical buffer logging up to 50+ timestamped incident records.
   - Automated 6-stage Faculty Presentation Demo Mode.

---

## 2. Hardware Architecture & Component List

| Component | Function / Role | ESP32 Pin Connection | Operating Voltage |
| :--- | :--- | :--- | :--- |
| **ESP32 DevKit V1** | Dual-core 240MHz MCU, Wi-Fi & ADC controller | Central Board | 5V (MicroUSB / VIN) |
| **MQ-2 Gas Sensor** | Flammable Gas & Smoke Detector | **GPIO34** (Analog AO), **GPIO25** (DO) | 5V VCC, GND |
| **DHT22 (AM2302)** | Precision Digital Temp & Humidity | **GPIO4** (Data with 10k pull-up) | 3.3V - 5V, GND |
| **SW-420 Vibration** | Piezoelectric impact/vibration sensor | **GPIO27** (Digital DO) | 3.3V, GND |
| **IR Obstacle Sensor** | Active Infrared Proximity sensor | **GPIO26** (Digital DO) | 3.3V - 5V, GND |
| **HC-SR04 Ultrasonic**| Ultrasonic time-of-flight distance | **TRIG: GPIO18**, **ECHO: GPIO19** | 5V VCC, GND |
| **16x2 Character LCD**| Local human-machine interface (HMI) | **RS: 21, EN: 22, D4: 23, D5: 16, D6: 17, D7: 2** | 5V VDD, GND, 10k Pot VO |
| **10kΩ Potentiometer**| LCD Contrast regulation | Wiper to LCD **VO** (Pin 3) | 5V to GND |
| **Green LED** | Normal Operation Indicator | **GPIO14** (via 220Ω resistor) | 3.3V Logic |
| **Yellow LED** | Warning Operation Indicator | **GPIO12** (via 220Ω resistor) | 3.3V Logic |
| **Red LED** | Critical Emergency Indicator | **GPIO13** (via 220Ω resistor) | 3.3V Logic |
| **Piezo Buzzer** | Audible Alarm Generator | **GPIO15** | 3.3V - 5V |
| **5V Relay Module** | Power isolation for high-load fan | **IN: GPIO5**, VCC: 5V, GND | 5V DC |
| **DC Exhaust Fan** | Active air extraction & cooling | Connected to Relay **NO / COM** | External 12V/5V DC |

---

## 3. Thresholds & Multi-Hazard Logic

### Single Sensor Thresholds
- **Gas (MQ-2)**:
  - $< 600$ ADC: **NORMAL**
  - $600 - 750$ ADC: **WARNING** (Gas Warning)
  - $> 750$ ADC: **CRITICAL** (Severe Gas Leak)
- **Temperature (DHT22)**:
  - $< 45^\circ\text{C}$: **NORMAL**
  - $45^\circ\text{C} - 55^\circ\text{C}$: **WARNING** (Elevated Thermal Load)
  - $> 55^\circ\text{C}$: **CRITICAL** (Runaway Overheat)
- **Machine Vibration (SW-420)**:
  - DO LOW / OFF: **NORMAL**
  - DO HIGH / ON: **WARNING** (Excessive Vibration / Bearing Defect)
- **Personnel Distance (HC-SR04)**:
  - $> 100\text{ cm}$: **NORMAL**
  - $30\text{ cm} - 100\text{ cm}$: **WARNING** (Proximity Caution)
  - $< 30\text{ cm}$: **CRITICAL** (Pinch Point Violation)
- **IR Proximity Sensor**:
  - Clear: **NORMAL**
  - Triggered: **WARNING** (Intrusion in guarded perimeter)

### Multi-Hazard Calculation
$$\text{Hazard Count} = H_{\text{gas}} + H_{\text{temp}} + H_{\text{vib}} + H_{\text{dist}} + H_{\text{IR}}$$

- **0 Hazards**: System operates in **NORMAL** mode.
- **1 Hazard**: System operates in **WARNING** mode (unless the hazard is inherently severe: Gas $>750$, Temp $>55^\circ\text{C}$, or Dist $<30\text{ cm}$).
- **$\ge 2$ Hazards**: System triggers **CRITICAL** mode immediately with maximum priority.

---

## 4. Local Actuator Response Matrix

| Safety State | Green LED | Yellow LED | Red LED | Buzzer | Relay (Exhaust Fan) | LCD Display |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NORMAL** | **ON** | OFF | OFF | Silent (OFF) | De-energized (OFF) | Cycles Screen 1 $\leftrightarrow$ Screen 2 $\leftrightarrow$ Screen 3 |
| **WARNING** | OFF | **ON** | OFF | **Pulsed Beep** (2Hz intermittent) | Standby (OFF) | Immediate warning alert showing active hazard |
| **CRITICAL** | OFF | OFF | **ON** | **Continuous Alarm** (1 kHz) | **Energized (FAN 100%)** | Priority alert screen (`CRITICAL ALERT / n HAZARDS`) |

---

## 5. Live 16x2 LCD Display Screens

### Normal Cycling (every 2.5 seconds):
- **Screen 1**:
  ```text
  SMART FACTORY
  SYSTEM NORMAL
  ```
- **Screen 2**:
  ```text
  GAS: 320 ADC
  TEMP: 28.5 C
  ```
- **Screen 3**:
  ```text
  HUM: 55%
  DIST: 145 cm
  ```

### Emergency Alert Overrides (Preempts cycling immediately):
- **Gas Alert**:
  ```text
  GAS ALERT!
  VALUE: 835 ADC
  ```
- **High Temp Alert**:
  ```text
  HIGH TEMP ALERT
  TEMP: 58.4 C
  ```
- **Vibration Alert**:
  ```text
  VIBRATION ALERT
  CHECK MACHINE
  ```
- **Multi-Hazard Critical Alert**:
  ```text
  CRITICAL ALERT
  3 HAZARDS ACTIVE
  ```

---

## 6. How to Run the Project

### Option 1: Live In-Browser Simulation (Instant)
1. Open the interactive web dashboard.
2. Adjust the interactive sensor sliders and toggles (Gas, Temperature, Vibration, IR, Distance).
3. Observe live response across the 16x2 LCD, LEDs, spinning exhaust fan, buzzer sound, and SCADA dashboard telemetry.
4. Click **"Run Demo Mode"** to auto-demonstrate Scenarios 1 through 6.

### Option 2: Run in Wokwi Online Simulator
1. Navigate to [Wokwi ESP32 Simulator](https://wokwi.com/projects/new/esp32).
2. Copy `/src/firmware/sketch.ino` into `sketch.ino`.
3. Copy `/src/firmware/diagram.json` into `diagram.json`.
4. Add the libraries listed in `/src/firmware/libraries.txt`:
   - `DHT sensor library`
   - `LiquidCrystal`
   - `Adafruit Unified Sensor`
5. Click **Play (Start Simulation)**. Use the interactive controls on the canvas to manipulate sensor values.

### Option 3: Physical ESP32 Hardware Deployment
1. Install Arduino IDE with the ESP32 board package (`esp32 by Espressif Systems`).
2. Wire components according to Section 2 pin assignments.
3. Select board: `ESP32 Dev Module`.
4. Upload `sketch.ino`. Open Serial Monitor at **115200 baud**.
5. Connect your laptop/phone Wi-Fi to SSID `ESP32-Safety-System` (Password: `IndustrialSafe123`).
6. Browse to `http://192.168.4.1/` to view the web dashboard and JSON endpoints.

---

## 7. Faculty Demonstration Test Procedure

| Test Case | Sensor Action | Expected System Response | Verification Point |
| :--- | :--- | :--- | :--- |
| **TEST 1: Normal Environment** | Gas = 320, Temp = 28°C, Vib = OFF, Dist = 145cm | **NORMAL**: Green LED ON, Buzzer OFF, Fan OFF. | LCD cycles screens normally. Dashboard shows "NORMAL". |
| **TEST 2: Gas Leak** | Slide Gas to 825 ($>750$) | **CRITICAL**: Red LED ON, Buzzer continuous, Fan starts immediately. | LCD reads `GAS ALERT!`. Dashboard logs `GAS LEAK CRITICAL`. |
| **TEST 3: High Temperature** | Slide Temp to 58.5°C ($>55^\circ\text{C}$) | **CRITICAL**: Red LED ON, Fan ON, Buzzer ON. | LCD reads `HIGH TEMP ALERT / 58.5 C`. |
| **TEST 4: Machine Vibration** | Toggle SW-420 button to ON | **WARNING**: Yellow LED ON, Intermittent buzzer. | LCD reads `VIBRATION ALERT / CHECK MACHINE`. |
| **TEST 5: Proximity Violation** | Slide Distance to 18 cm ($<30\text{ cm}$) | **CRITICAL**: Red LED ON, Alarm triggers. | LCD reads `PROXIMITY ALERT / DIST: 18 cm`. |
| **TEST 6: Multi-Hazard Crisis** | Gas = 810, Temp = 57°C, Vib = ON | **CRITICAL**: Max safety interlock, 3 hazards logged. | LCD reads `CRITICAL ALERT / 3 HAZARDS`. Event log recorded. |

---

## 8. 5-Minute College Presentation Speech Script

> **"Respected professors, good morning.**
> Today I present our capstone engineering project: the **IoT-Enabled Industrial Safety Monitoring System**.
>
> In high-risk manufacturing plants, relying on isolated alarms leads to catastrophic failure. Our solution deploys an **ESP32 dual-core controller** acting as a local autonomous safety gateway, continuously processing 5 sensory vectors: combustible gas, ambient temperature and humidity, structural vibration, infrared perimeter presence, and ultrasonic distance.
>
> Rather than evaluating hazards in isolation, the system calculates a composite safety quotient. If a single minor deviation occurs—such as a conveyor vibration warning—the system transitions into **WARNING mode**, illuminating the yellow beacon and pulsing an intermittent tone to alert shop-floor technicians without interrupting production.
>
> However, if two concurrent anomalies occur, or if any critical parameter breaches safety thresholds—such as this gas leak simulation—the system instantly locks into **CRITICAL mode**: energizing the relay to start the industrial exhaust fan, flashing the emergency red beacon, sounding the 1kHz siren, and overriding the 16x2 LCD display.
>
> Furthermore, all telemetry and timestamped incident logs are published in real-time over the embedded IoT REST gateway for remote monitoring. I will now demonstrate the system's runtime response across all 6 test scenarios."
