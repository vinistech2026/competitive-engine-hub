# Competitive Intelligence - Deep Architectural Dossiers
**Document ID:** `DOSSIER-MASTER-001`  
**Registry Hub:** [Google Sheet Tracker](https://docs.google.com/spreadsheets/d/1tUJvMemHp8bTx7yOp-irW_zw-yk9zWPWffp92u7GRQg/edit)  
**Governance:** SSOT Compliant (`C:\vinistech\00-Core\GOVERNANCE\rules\STYLE.md`)  
**Hardware Baseline:** Dell Latitude E6220 (Intel HD 3000, 8 GB RAM, 2D Canvas Safe)  

---

## Master Index of Deconstructed Targets
1. [Section 01: MSN Weather Maps (Global Interactive Mapping Platform)](#section-01-msn-weather-maps)
2. *Section 02: [Pending Next Target]*

---

<a name="section-01-msn-weather-maps"></a>
# Section 01: MSN Weather Maps (Global Interactive Mapping Platform)

### Tier 1: The 30-Second Glance
| Dimension | Specification |
| :--- | :--- |
| **Target URL** | `https://www.msn.com/en-in/weather/maps/` |
| **Niche Category** | Geospatial / Climate & Atmospheric Visualization |
| **Core Architecture** | TomTom Vector Basemap + Azure Maps Tile Pipeline + WebGL Shaders |
| **The Commercial Wall** | Proprietary global raster tile servers ($180+/month) & paid Foreca feeds |
| **Zero-Cost Open Stack** | **Leaflet.js + Open-Meteo API + RainViewer Radar + 2D IDW Canvas** |
| **Realistic Parity Score** | **75% Functional & Visual Parity** |
| **Market Viability Index** | **88% (High)** — Huge search demand, cluttered competitor UX |
| **Deployment Target** | 100% Free Tier Vercel Serverless / Desktop PWA (< 40 MB RAM) |

---

### Tier 2: The 2-Minute Briefing (Core Decisions & Options)
- **What MSN Weather Does Well:** Fluid multi-layer transitions, 10-day hourly scrubber, real-time Doppler radar loops, and dynamic particle wind vectors.
- **The Core Unvarnished Catch:** Multi-zoom continuous global temperature heatmaps cannot be replicated 100% for free. They require either paid enterprise tile services or massive local GRIB2 server processing.
- **Our Clean-Room Solution:** 
  1. Use **RainViewer's free public tile cache** for genuine 10-minute Doppler precipitation radar loops.
  2. Use **`leaflet-velocity` on a 2D HTML5 canvas** to deliver flowing wind streamline vectors without crashing Intel HD 3000 graphics.
  3. Use **Open-Meteo's free API** (10,000 calls/day, no credit card) for point forecasts, AQI, humidity, and pressure.
  4. Use **2D Inverse Distance Weighting (IDW) canvas interpolation** across regional city grids for smooth local temperature heatmaps.

---

### Tier 3: The Deep Appendix (10-Dimension Technical Specifications)

#### 1. Functional Topology (The 16 Layers Deconstructed)
- **Atmospheric (9):** Temperature (°C/°F), Precipitation (Rain/Snow/Mix classification), Radar (Doppler composite), Wind (streamline vectors), Clouds (Satellite replay & model forecast), Humidity (0-100%), Visibility (km), Sea Level Pressure (isobars), Dew Point.
- **Environmental (1):** Air Quality (AQI) 6-tier index with PM2.5/PM10 breakdown and 4 health advisories.
- **Extreme Weather (4):** Tropical Cyclone tracking (active/past tracks, cone of uncertainty), Severe Weather warning polygons, Winter Weather, Lightning detection strokes.
- **Interactive/Social (2):** Crowdsourced User Reports with geolocation pin verification & E-tree gamified rewards.

#### 2. Network & URL State Protocol
- Viewport state is serialized via Base64 JSON tokens in the query string:
  ```json
  {
    "r": "Region Name",
    "c": "Country",
    "i": "Country Code",
    "g": "locale",
    "x": "Longitude",
    "y": "Latitude"
  }
  ```
- URL Parameters: `weadegreetype=C`, `zoom=7`, `animation=0`, `content=AQICard_wxaqi`.

#### 3. Frontend & Rendering Engine Profile
- **Basemap:** TomTom vector tiles with custom palette styles (Gray, Green, Blue, White, Yellow).
- **Client Rendering:** WebGL 1.0/2.0 fragment shaders.
- **Low-Spec Fallback:** For Dell Latitude E6220 (Intel HD 3000), WebGL shaders must be substituted with HTML5 2D Canvas and SVG path overlays to prevent driver crashes.

#### 4. Clean-Room Zero-Cost Substitution Matrix
| Original Component | Enterprise Cost | Zero-Cost Open Equivalent | Free Limit / Constraint |
| :--- | :--- | :--- | :--- |
| **Base Map** | TomTom / Azure Enterprise | Leaflet.js + CartoDB Voyager | Unlimited free OSM raster tiles |
| **Radar Tiles** | Foreca Radar ($$$) | RainViewer API v2 | 10-minute radar frames, past 2h + nowcast |
| **Wind Vectors** | Proprietary WebGL Shaders | Leaflet-Velocity + 2D Canvas | Open-Meteo GFS 10m wind U/V grid |
| **Point Forecast** | Azure Weather API | Open-Meteo Forecast API | 10,000 calls/day, no API key needed |
| **Air Quality** | Commercial AQI providers | Open-Meteo Air Quality API | Free global PM2.5, PM10, AQI indices |
| **Search / Geocode**| Azure Maps Geocoding | Photon API / Nominatim | Free OSM-based autocomplete |

---
*(End of Dossier 01 — Maintained in VinisTech Competitive Engine Hub)*
