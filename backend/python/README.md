# Python Forecast Extraction Layer

This module is responsible for reading WRF NetCDF forecast files.

Responsibilities

- Open the WRF NetCDF file
- Locate each airport grid point
- Extract raw meteorological variables
- Build canonical RawForecast JSON
- Save forecasts for the TypeScript backend

This layer MUST NOT perform:

- Aviation decision support
- Alert generation
- Risk assessment
- Operational recommendations

Those responsibilities belong to the Node.js backend.