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

### 2. Admin Management Portal (`/admin`)
* **Click-to-Drop Map Pin**: Click anywhere on the map or drag the pin to capture precise latitude/longitude.
* **Address Geocoding**: Type an address to auto-center the map and place the pin.
* **Dynamic Multi-Plug Builder**: Add multiple connectors per station with GB/T, CCS 2, Type 2 presets.
* **Station Directory & Quick Management**: Searchable data table with instant status toggles, inline editing, and deletion.
* **One-Click Demo Seeder**: Instantly populate realistic sample charging stations across Kigali.

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the Driver Map, or [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Portal.
