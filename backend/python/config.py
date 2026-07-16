from pathlib import Path

# -----------------------------------------------------------------------------
# Project Directories
# -----------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent

DATA_DIR = ROOT / "data"

FORECAST_DIR = DATA_DIR / "forecast"

NETCDF_DIR = FORECAST_DIR / "netcdf"

CACHE_DIR = FORECAST_DIR / "cache"

STATIONS_DIR = DATA_DIR / "stations"

# -----------------------------------------------------------------------------
# Source WRF file
# -----------------------------------------------------------------------------

WRF_FILE = NETCDF_DIR / "wrfout_d01_nc.nc"

# -----------------------------------------------------------------------------
# Station Registry
# -----------------------------------------------------------------------------

STATIONS_FILE = STATIONS_DIR / "stations.json"