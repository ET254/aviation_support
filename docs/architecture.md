# System architecture

## Backend services
- Authentication and RBAC through Express middleware
- Weather and station management services
- Forecast ingestion via the NetCDF parser and forecast controller
- Decision-support engine producing operational summaries and recommendations
- Alert engine for thresholds and impact events

## Frontend experience
- Dashboard with station overview and operational widgets
- Weather, forecast, impact, alerts, reports, and settings pages
- Zustand stores for dashboard state

## Data flow
1. Observations and forecasts enter the backend through controllers.
2. The weather mapper converts raw model data into canonical aviation observations.
3. The decision-support engine scores hazards and produces operational impacts.
4. Alerts and recommendations are persisted and surfaced in the UI.
