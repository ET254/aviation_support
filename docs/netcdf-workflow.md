# NetCDF workflow

1. NetCDF files are placed into the ingestion path for the backend.
2. The parser evaluates the filename and emits a deterministic forecast payload when the scientific libraries are unavailable.
3. Forecast windows are generated for multiple valid time ranges.
4. The payload is stored as forecast records and is available to the decision-support layer for operational analysis.
