# API reference

## Authentication
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh
- GET /api/auth/me

## Stations
- GET /api/stations
- POST /api/stations
- GET /api/stations/:id

## Weather
- GET /api/weather/:stationId/current
- GET /api/weather/:stationId/historical

## Forecasts
- GET /api/forecast/:stationId/current
- GET /api/forecast/:stationId/taf
- POST /api/forecast/import-netcdf

## Decision support
- GET /api/decision-support/station/:stationId
- GET /api/decision-support/dashboard/:stationId
