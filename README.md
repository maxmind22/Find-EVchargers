# EVchargers — Interactive EV Charging Map & Network Platform

An interactive platform to discover, filter, and navigate to electric vehicle (EV) charging stations, with a full-featured Admin Portal for manual coordinate pin-dropping and station management. Centered by default on **Kigali, Rwanda** with support for **GB/T, CCS 2, Type 2, and CHAdeMO** chargers.

---

## Features

### 1. Driver Map Experience (`/`)
* **100% Free Map Engine**: Powered by `Leaflet.js` with crisp CARTO Voyager and OpenStreetMap tiles (zero API keys required).
* **Kigali Network**: Centered by default on **Kigali, Rwanda (`-1.9536° S, 30.0880° E`)**.
* **Smart Geolocation**: "Locate Me" button to center directly on the driver's current GPS position.
* **Top Search & Geocoding**: Search by city, street, or landmark with instant autocomplete.
* **Multi-Parameter Filtering**:
  * **Connector Sockets**: GB/T (China Standard), CCS 2, Type 2, NACS (Tesla), CHAdeMO, Type 1.
  * **Charging Speeds**: All, AC ($\le$22 kW), Fast ($\ge$50 kW), Ultra-Fast ($\ge$150 kW).
  * **Pricing**: Filter by free vs. paid charging.
  * **Status**: Operational, Maintenance, Offline.
* **Station Details Bottom Sheet / Drawer**:
  * Individual plug speeds, AC/DC current, and live status.
  * Pricing info in **RWF / kWh**, access type (Public vs Customer/Hotel only), and amenities.
  * **1-Click Turn-by-Turn Navigation**: Directly opens **Google Maps**, **Apple Maps**, or **Waze**.
  * **Community Feedback**: Drivers can report broken plugs or blocked stalls.

### 2. ChargeBot — AI EV Assistant & Platform Guide
* **Live Station RAG**: Connects directly to the real-time database to recommend stations based on location, plug type, power output, or pricing.
* **Plug & Vehicle Compatibility**: Specialized guidance for **GB/T (BYD & Chinese EV imports)**, **CCS 2**, **Type 2 Mennekes**, and **CHAdeMO**.
* **Interactive Chat Station Cards**: Recommendations embed clickable cards with live status, connector specs, and a **"📍 Locate on Map"** button that flies the Leaflet map to the charger and opens its drawer.
* **Platform Navigator**: Explains how to use the map, search areas, apply filters, contact operators, report broken plugs, or list stations as a host.
* **Dual Hybrid Engine**:
  * **Zero-Config Built-in Intelligence**: Works instantly out of the box with zero external API keys.
  * **Generative LLM Integration**: Connects to **Google Gemini API** (`gemini-3.6-flash` / `gemini-2.5-flash`) or **Groq Cloud** with 1 environment variable.
* **Domain Guardrails & Token Optimization**: Restricts responses strictly to EV charging and platform features, preserving token quotas.

### 3. Admin & Host Management Portal (`/admin`)
* **Click-to-Drop Map Pin**: Click anywhere on the map or drag the pin to capture precise latitude/longitude.
* **Address Geocoding**: Type an address to auto-center the map and place the pin.
* **Dynamic Multi-Plug Builder**: Add multiple connectors per station with GB/T, CCS 2, Type 2 presets.
* **Station Directory & Quick Management**: Searchable data table with instant status toggles, inline editing, and deletion.
* **One-Click Demo Seeder**: Instantly populate realistic sample charging stations across Kigali.

---

## Environment Configuration (`.env.local`)

Create a `.env.local` file in the root directory to configure optional LLM or database providers:

```env
# ====================================================================
# AI CHATBOT LLM CONFIGURATION (OPTIONAL)
# Get a 100% free key (no credit card) at: https://aistudio.google.com/
# ====================================================================
GEMINI_API_KEY="your_gemini_api_key_here"

# Optional: Groq Cloud (Free tier at https://console.groq.com/)
GROQ_API_KEY=""

# ====================================================================
# SUPABASE DATABASE CONFIGURATION (OPTIONAL)
# (If left blank, the app uses in-memory/local persistence)
# ====================================================================
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# ====================================================================
# CARTO MAPS CONFIGURATION (OPTIONAL - REMOVES MAP WATERMARKS)
# Get a 100% free key (up to 5M loads/month) at https://carto.com/basemaps/apikey
# ====================================================================
NEXT_PUBLIC_CARTO_API_KEY=""
```

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the Driver Map & AI Assistant, or [http://localhost:3000/admin](http://localhost:3000/admin) for the Host Portal.

---

## License

This project is licensed under the [MIT License](LICENSE).


