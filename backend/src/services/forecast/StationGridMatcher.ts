/**
 * ============================================================================
 * Station Grid Matcher
 *
 * Finds the nearest WRF model grid point
 * for an airport or airstrip.
 * ============================================================================
 */

export interface GridPoint {

    row: number;

    column: number;

    distance: number;

}

export class StationGridMatcher {

/**
 * ============================================================================
 * Calculate Distance
 * ============================================================================
 */

private static distance(

    lat1: number,

    lon1: number,

    lat2: number,

    lon2: number

): number {

    const dLat = lat1 - lat2;

    const dLon = lon1 - lon2;

    return Math.sqrt(

        dLat * dLat +

        dLon * dLon

    );

}

/**
 * ============================================================================
 * Find Nearest Grid Cell
 * ============================================================================
 */

static nearestGrid(

    airportLatitude: number,

    airportLongitude: number,

    latitudeGrid: number[][],

    longitudeGrid: number[][]

): GridPoint {

    let nearest: GridPoint = {

        row: 0,

        column: 0,

        distance: Number.MAX_VALUE

    };

    for (

        let row = 0;

        row < latitudeGrid.length;

        row++

    ) {

        for (

            let column = 0;

            column < latitudeGrid[row].length;

            column++

        ) {

            const distance = this.distance(

                airportLatitude,

                airportLongitude,

                latitudeGrid[row][column],

                longitudeGrid[row][column]

            );

            if (distance < nearest.distance) {

                nearest = {

                    row,

                    column,

                    distance

                };

            }

        }

    }

    return nearest;

}

}