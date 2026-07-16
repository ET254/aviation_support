"""
==============================================================================
Forecast Builder
==============================================================================
"""

from datetime import datetime


class ForecastBuilder:

    @staticmethod
    def build(
        station,
        forecast_hour,
        valid_time,
        variables,
    ):

        return {

            "stationId": station["id"],

            "stationCode": station["icao"],

            "stationName": station["name"],

            "latitude": station["latitude"],

            "longitude": station["longitude"],

            "elevation": station["elevation"],

            "forecastHour": forecast_hour,

            "validTime": valid_time,

            "variables": variables

        }