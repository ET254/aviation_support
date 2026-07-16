"""
==============================================================================
Station Locator

Maps every airport/airstrip to the nearest WRF model grid point.
==============================================================================
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from netCDF4 import Dataset

from config import STATIONS_FILE, WRF_FILE


class StationLocator:

    def __init__(self):

        self.dataset = Dataset(WRF_FILE)

        self.latitudes = self.dataset.variables["XLAT"][0]

        self.longitudes = self.dataset.variables["XLONG"][0]

    def nearest_grid(self, latitude: float, longitude: float):

        distance = (
            (self.latitudes - latitude) ** 2 +
            (self.longitudes - longitude) ** 2
        )

        row, column = np.unravel_index(
            np.argmin(distance),
            distance.shape
        )

        return int(row), int(column)

    def build_station_index(self):

        with open(STATIONS_FILE, "r", encoding="utf-8") as file:

            stations = json.load(file)

        indexed = []

        for station in stations:

            row, column = self.nearest_grid(

                station["latitude"],

                station["longitude"]

            )

            station["wrfGrid"] = {

                "row": row,

                "column": column

            }

            indexed.append(station)

        return indexed


if __name__ == "__main__":

    locator = StationLocator()

    stations = locator.build_station_index()

    print(f"Indexed {len(stations)} stations.")