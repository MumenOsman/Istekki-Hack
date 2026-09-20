# 791 Maternal Emergency Triage System

An integrated three-application real-time triage system designed for out-of-hospital emergency childbirth in Finland. The system connects pregnant mothers, on-duty hospital midwives, and Emergency Dispatchers (ED / 112) through a unified real-time communications bus.

**Live Demo:** [https://istekki-hack.pages.dev](https://istekki-hack.pages.dev)

---

## System Overview

The solution consists of three specialized web applications running simultaneously with a unified testing hub:

1. **Unified Multi-App Hub (`index.html`)**
   - Embedded side-by-side simulator displaying all three viewports concurrently.
   - 1-click **"Open All Side by Side"** multi-window launcher across monitor displays.
   - Collapsible triage workflow instructions and direct app tabs.

2. **Mother Application (`mother.html`)**
   - Direct 1-tap SOS emergency trigger with cancel grace period.
   - Real-time video and audio connection with on-duty midwife.
   - Automatic Kanta patient data and GPS location transmission.
   - Route guidance and emergency clinic information.

3. **Midwife Remote Triage Application (`midwife.html`)**
   - Clinician authentication and on-duty listening state toggle (Active / Busy / Break).
   - Instant incoming call reception screen showing gestational age (`H38+1`) and parity (`G2P1`).
   - Call transfer flow with mandatory clinical reason logging.
   - Connected call dock with Speaker, Video request/accept, and Patient EHR report.
   - Dual-dock triage controls: private ED backchannel microphone, ambulance escalation, observation timer, and call termination.

4. **Emergency Dispatcher (ED / 112) Console (`ed.html`)**
   - High-density CAD workstation tile aligned with Finnish ERICA emergency standards.
   - Live telemetry stream of patient contractions, pain intensity, amniotic fluid status, and ICD-10 diagnoses.
   - Real-time midwife triage recommendation alerts (Code A Ambulance vs Code C Home Observation).
   - 1-click ambulance unit dispatch with 4-stage tracking (`Alerted` -> `Dispatched` -> `En Route` -> `On Scene`).
   - Private backchannel audio bridge with the on-duty midwife.

---

## How to Run Locally

### Prerequisites
- Node.js (v18+)

### Start the Local Server
Run the built-in HTTP server from the project root directory:

```bash
npm start
```

Or run directly with Node:
```bash
node server.js
```

### Accessing the Applications
Open your browser to:

- **Unified Testing Hub:** [http://localhost:3000](http://localhost:3000)
- **Mother App:** [http://localhost:3000/mother.html](http://localhost:3000/mother.html)
- **Midwife App:** [http://localhost:3000/midwife.html](http://localhost:3000/midwife.html)
- **ED Console:** [http://localhost:3000/ed.html](http://localhost:3000/ed.html)

---

## Recommended Testing Workflow

To test the complete end-to-end emergency flow:

1. **Set Up Midwife Duty State:**
   - Open `midwife.html`. Sign in (Pre-filled ID: `502941`, password: `password123`).
   - Tap the large green circular button to enter **"Listening"** mode (button turns red "Stop Listening").

2. **Trigger Mother SOS:**
   - On `mother.html`, tap the large red **SOS** button.
   - The Midwife app (`midwife.html`) immediately receives the incoming call screen with a live upward elapsed timer, displaying patient demographics (`Sofia Korhonen`, `29`, `H38+1`, `G2P1`).
   - The ED Console (`ed.html`) simultaneously activates the incident mission card.

3. **Answer Call on Midwife App:**
   - Tap the green **Accept** button on `midwife.html`. Both apps transition to the active connected call screen with synchronized timers.

4. **Test Video Call Switch:**
   - Tap the **Video** icon on either app dock.
   - The opposing app receives an interactive confirmation modal (*"Switch to Video Call?"*).
   - Tap **Accept Video**. Both apps open inverted video viewports (Mother sees Midwife on main screen with self PiP; Midwife sees Mother on main screen with self PiP).
   - Tap the video toggle button to return both apps back to voice mode.

5. **View Patient EHR Report:**
   - On `midwife.html`, tap the **Report** icon on the lower dock.
   - Review patient telemetry, ICD-10 diagnoses (`O60.0`, `O24.4`, `O99.0`, `Z34.8`, `Z87.5`), and travel time.
   - Tap **"Back to Call"** to return directly to the previous call screen.

6. **Trigger Triage Escalation & Ambulance Dispatch:**
   - On `midwife.html`, inspect the upper triage dock:
     - Tap **Ambulance**: The ED console (`ed.html`) immediately updates to **"CODE A - URGENT EMS REQUIRED"**.
     - Tap **Observation (Timer)**: The ED console updates to **"CODE C - HOME OBSERVATION"**.
     - Tap **Microphone**: Toggles the private muted backchannel between Midwife and ED.
   - On `ed.html`, click **"Confirm & Dispatch Ambulance"** to assign unit `ENS-121` and advance tracking to `En Route (ETA ~8m)`.

7. **End Call:**
   - Tap the red **Hang Up** button on any app dock to end the call and return all three apps to standby.

---

## Technical Architecture

- **Frontend Core:** Pure HTML5, Vanilla JavaScript ES Modules, and Vanilla CSS. Zero build steps, external bundlers, or heavy frameworks.
- **Real-Time Cross-App Sync:** Utilizes native browser `BroadcastChannel` (`791_emergency_bus`) with fallback to `window.localStorage` storage events for sub-5ms cross-window communication.
- **Security Hardening:** Secure HTTP headers (`X-Content-Type-Options`, `X-Frame-Options`, `CSP frame-ancestors`, `Permissions-Policy`), safe path normalization, and Subresource Integrity (SRI) on external assets.
- **File Structure:**
  ```
  ├── index.html                     # Unified Testing & Multi-App Landing Hub
  ├── mother.html                    # Mother Application Entry Point
  ├── midwife.html                   # Midwife Application Entry Point
  ├── ed.html                        # Emergency Dispatcher CAD Console
  ├── server.js                      # Hardened Local Node.js HTTP Server
  ├── package.json                   # Project scripts and configuration
  ├── README.md                      # System Documentation & Testing Guide
  ├── css/
  │   ├── design-tokens.css          # Design system variables & color palettes
  │   ├── landing.css                # Multi-app hub stylesheet
  │   ├── device-frame.css           # Hardware simulation shell & status bar
  │   ├── main.css                   # Global layout rules
  │   ├── components/                # Mother app component styles
  │   ├── midwife/                   # Midwife app modular stylesheets
  │   └── ed/                        # ED console stylesheet
  └── js/
      ├── app.js                     # Mother app entry point
      ├── modules/                   # Mother app state and controllers
      ├── midwife/                   # Midwife app modular controllers
      └── ed/                        # ED console controller
  ```
