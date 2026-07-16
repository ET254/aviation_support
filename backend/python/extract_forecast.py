"""
==============================================================================
Forecast Extraction Engine

Reads WRF NetCDF forecasts and produces station-specific RawForecast JSON.

Author: EzzieTech
==============================================================================
"""

from __future__ import annotations

import json
from pathlib import Path

from netCDF4 import Dataset

from config import (
    WRF_FILE,
    CACHE_DIR,
    STATIONS_FILE
)

from station_locator import StationLocator
from forecast_builder import ForecastBuilder


class ForecastExtractor:

    """
    Reads the WRF model and extracts forecasts for every airport.
    """

    def __init__(self):

        self.dataset: Dataset | None = None

        self.station_locator = StationLocator()

        self.stations = []

        self.times = []

    # ----------------------------------------------------------------------

    # Dataset

    # ----------------------------------------------------------------------

    def load_dataset(self):

        print("Opening WRF file...")

        self.dataset = Dataset(WRF_FILE)

        self.times = self.dataset.variables["Times"][:]

        print("Dataset loaded successfully.")

    # ----------------------------------------------------------------------

    # Stations

    # ----------------------------------------------------------------------

    def load_stations(self):

        with open(STATIONS_FILE, "r", encoding="utf-8") as file:

            self.stations = json.load(file)

        print(f"{len(self.stations)} stations loaded.")

        # ----------------------------------------------------------------------
    # Variable Helpers
    # ----------------------------------------------------------------------

    def get_variable(self, variable_name: str, default=None):
        """
        Safely retrieve a variable from the WRF dataset.
        Returns the provided default if the variable is not available.
        """

        if self.dataset is None:
            raise RuntimeError("Dataset has not been loaded.")

        try:
            return self.dataset.variables[variable_name]
        except KeyError:
            print(f"[WARNING] Variable '{variable_name}' not found.")
            return default

    # ----------------------------------------------------------------------
    # Time Helpers
    # ----------------------------------------------------------------------

    def decode_time(self, time_index: int) -> str:
        """
        Convert a WRF Times entry into a standard ISO datetime string.
        """

        if self.dataset is None:
            raise RuntimeError("Dataset has not been loaded.")

        try:

            raw = self.times[time_index]

            decoded = "".join(
                character.decode("utf-8") if isinstance(character, bytes) else str(character)
                for character in raw
            )

            return decoded.replace("_", " ")

        except Exception as error:

            print(f"[WARNING] Unable to decode time index {time_index}: {error}")

            return ""

    # ----------------------------------------------------------------------
    # Grid Helpers
    # ----------------------------------------------------------------------

    def get_station_grid(self, station: dict):
        """
        Return the cached WRF grid location for a station.
        """

        grid = station.get("wrfGrid")

        if grid is None:
            raise RuntimeError(
                f"Station '{station.get('icao')}' does not contain a WRF grid index."
            )

        return grid["row"], grid["column"]

    # ----------------------------------------------------------------------
    # Extraction Helpers
    # ----------------------------------------------------------------------

    def extract_value(
        self,
        variable_name: str,
        time_index: int,
        row: int,
        column: int,
        default=None,
    ):
        """
        Extract a single value from a WRF variable.
        """

        variable = self.get_variable(variable_name)

        if variable is None:
            return default

        try:

            return float(variable[time_index, row, column])

        except Exception as error:

            print(
                f"[WARNING] Failed extracting "
                f"{variable_name}[{time_index},{row},{column}] "
                f"-> {error}"
            )

            return default

    # ----------------------------------------------------------------------
    # 3D Variable Extraction
    # ----------------------------------------------------------------------

    def extract_level_value(
        self,
        variable_name: str,
        time_index: int,
        level: int,
        row: int,
        column: int,
        default=None,
    ):
        """
        Extract a value from a 3D atmospheric variable.
        """

        variable = self.get_variable(variable_name)

        if variable is None:
            return default

        try:

            return float(variable[time_index, level, row, column])

        except Exception:

            return default
    
        # ----------------------------------------------------------------------
    # Forecast Extraction
    # ----------------------------------------------------------------------

    def extract_station(self, station: dict, time_index: int):
        """
        Extract all available WRF variables for a single station and time step.
        """

        row, column = self.get_station_grid(station)

        variables = {

            # Wind
            "u10": self.extract_value("U10", time_index, row, column, 0.0),

            "v10": self.extract_value("V10", time_index, row, column, 0.0),

            "w": self.extract_level_value("W", time_index, 0, row, column, 0.0),

            # Temperature
            "t2": self.extract_value("T2", time_index, row, column, 0.0),

            "skinTemperature": self.extract_value(
                "TSK",
                time_index,
                row,
                column,
                0.0
            ),

            # Moisture
            "q2": self.extract_value("Q2", time_index, row, column, 0.0),

            "qvapor": self.extract_level_value(
                "QVAPOR",
                time_index,
                0,
                row,
                column,
                0.0
            ),

            # Pressure
            "surfacePressure": self.extract_value(
                "PSFC",
                time_index,
                row,
                column,
                0.0
            ),

            "pressure": self.extract_level_value(
                "P",
                time_index,
                0,
                row,
                column,
                0.0
            ),

            "basePressure": self.extract_level_value(
                "PB",
                time_index,
                0,
                row,
                column,
                0.0
            ),

            # Rain
            "rainc": self.extract_value(
                "RAINC",
                time_index,
                row,
                column,
                0.0
            ),

            "rainnc": self.extract_value(
                "RAINNC",
                time_index,
                row,
                column,
                0.0
            ),

            "rainsh": self.extract_value(
                "RAINSH",
                time_index,
                row,
                column,
                0.0
            ),

            # Clouds
            "cloudFraction": self.extract_level_value(
                "CLDFRA",
                time_index,
                0,
                row,
                column,
                0.0
            ),

            "cloudWater": self.extract_level_value(
                "QCLOUD",
                time_index,
                0,
                row,
                column,
                0.0
            ),

            "cloudIce": self.extract_level_value(
                "QICE",
                time_index,
                0,
                row,
                column,
                0.0
            ),

            # Frozen precipitation
            "snow": self.extract_level_value(
                "QSNOW",
                time_index,
                0,
                row,
                column,
                0.0
            ),

            "graupel": self.extract_level_value(
                "QGRAUP",
                time_index,
                0,
                row,
                column,
                0.0
            ),

            "hail": self.extract_value(
                "HAILNC",
                time_index,
                row,
                column,
                0.0
            ),

            # Boundary layer
            "pblHeight": self.extract_value(
                "PBLH",
                time_index,
                row,
                column,
                0.0
            ),

            # Radiation
            "swdown": self.extract_value(
                "SWDOWN",
                time_index,
                row,
                column,
                0.0
            ),

            "glw": self.extract_value(
                "GLW",
                time_index,
                row,
                column,
                0.0
            ),

            # Terrain
            "terrainHeight": self.extract_value(
                "HGT",
                time_index,
                row,
                column,
                0.0
            ),

            "landMask": self.extract_value(
                "LANDMASK",
                time_index,
                row,
                column,
                0.0
            )

        }

        valid_time = self.decode_time(time_index)

        return ForecastBuilder.build(

            station=station,

            forecast_hour=time_index,

            valid_time=valid_time,

            variables=variables

        )

    # ----------------------------------------------------------------------
    # Forecast Hour
    # ----------------------------------------------------------------------

    def extract_forecast_hour(self, time_index: int):

        forecasts = []

        print(f"Processing forecast hour {time_index}")

        for station in self.stations:

            forecast = self.extract_station(

                station,

                time_index

            )

            forecasts.append(forecast)

        return forecasts
    
        # ----------------------------------------------------------------------
    # Cache Writer
    # ----------------------------------------------------------------------

    def save_station_cache(self, station_code: str, forecasts: list):

        CACHE_DIR.mkdir(parents=True, exist_ok=True)

        output_file = CACHE_DIR / f"{station_code}.json"

        with open(output_file, "w", encoding="utf-8") as file:

            json.dump(

                forecasts,

                file,

                indent=2,

                ensure_ascii=False

            )

    # ----------------------------------------------------------------------
    # Save All Forecasts
    # ----------------------------------------------------------------------

    def save_all(self):

        print("Extracting forecasts...")

        station_forecasts = {}

        total_hours = len(self.times)

        for hour in range(total_hours):

            forecasts = self.extract_forecast_hour(hour)

            for forecast in forecasts:

                station = forecast["stationCode"]

                if station not in station_forecasts:

                    station_forecasts[station] = []

                station_forecasts[station].append(forecast)

        print("Saving cache...")

        for station, forecasts in station_forecasts.items():

            self.save_station_cache(

                station,

                forecasts

            )

        print(f"Saved forecasts for {len(station_forecasts)} stations.")

    # ----------------------------------------------------------------------
    # Runner
    # ----------------------------------------------------------------------

    def run(self):

        self.load_dataset()

        self.load_stations()

        self.save_all()

        print("Forecast extraction completed successfully.")

    # =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":

    extractor = ForecastExtractor()

    extractor.run()