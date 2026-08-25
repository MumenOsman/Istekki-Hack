# 📋 791 Application System Specification (Istekki Hackathon)

---

## 1. Executive Summary & Challenge Context
- **Challenge Title:** 791 Application Challenge
- **Core Mission:** Saving lives and ensuring safety during unplanned out-of-hospital birth deliveries across Finland (>189 cases/year, travel distances >100 km to the 24 remaining birth clinics).
- **Ecosystem of 3 Connected Apps:**
  1. **Mother / Pregnant Woman Mobile App** (Current Focus): 1-button SOS emergency trigger, real-time location streaming, automated Kanta patient & pregnancy data sharing, video/audio connection with Midwife & Emergency Dispatcher (ED), live ambulance ETA & hospital routing, and secure pregnancy chat.
  2. **Emergency Dispatcher (ED) App / Console**: Triage desk to monitor alerts, view mother location, control ambulance dispatch & ETA, set destination hospital, and confer with Midwife on a private channel.
  3. **Midwife Remote Support App**: On-call midwife video interface to guide on-site responders (spouses, taxi drivers, first responders) through childbirth, with access to pregnancy notes and muted backchannel with ED.

---

## 2. 791 Mother App Architecture (Modular Structure)

```
├── index.html                # Main entry point (featuring Device Shell & App Viewport)
├── css/
│   ├── design-tokens.css     # Colors, typography, spacing, shadows
│   ├── device-frame.css      # Presentation shell (iPhone frame, status bar, navigation bar)
│   ├── main.css              # Core layout, transitions, reset
│   └── components/
│       ├── header.css        # Top header & hamburger menu toggle
│       ├── sos-button.css    # Red circular emergency button & pulse animation
│       ├── pagination.css    # Carousel / screen indicator dots
│       └── drawer.css        # Teal slide-out navigation menu
└── js/
    ├── app.js                # Core app controller & state router
    └── modules/
        ├── navigation.js     # Carousel & screen switching logic
        ├── sos-controller.js # SOS trigger & emergency lifecycle
        └── state.js          # Patient data (Kanta records, location, contact)
```

---

## 3. Visual & Technical Specifications for Main SOS Screen
- **Background:** Crisp medical white (`#FFFFFF`) with subtle ambient lighting.
- **Top Header:**
  - Status bar (Carrier, 5G, Time, Battery)
  - Hamburger Menu Icon (Top Right, Teal `#008B8B` / `#008375`)
- **Center Hero Component:**
  - Red SOS Button: Solid vibrant red `#E52E2E` with 3D tactile elevation, inner glow, and accessible font size.
  - Text: **SOS** (Large Bold) & **Call Emergency** (Subheading).
  - Subtle breathing/pulse animation indicating high availability.
- **Bottom Navigation Dots:**
  - 2 Dots: Dot 1 (Active Teal `#008375`), Dot 2 (Inactive Grey `#D1D5DB`).
  - Swiping/clicking advances to Nurse / Health Clinic view.
