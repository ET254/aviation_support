/**
 * ============================================================================
 * Airport Definition
 * ============================================================================
 */

export interface AirportDefinition {

    /**
     * ICAO Code
     */
    stationCode: string;

    /**
     * Airport Name
     */
    stationName: string;

    /**
     * Latitude
     */
    latitude: number;

    /**
     * Longitude
     */
    longitude: number;

    /**
     * Elevation (metres)
     */
    elevation: number;

    /**
     * County
     */
    county: string;

/**
 * ============================================================================
 * Airport Registry
 * ============================================================================
 */
}
export class AirportRegistry {
    private static readonly AIRPORTS: AirportDefinition[] = [
        {
    stationCode: "HKJK",
    stationName: "Jomo Kenyatta International Airport",
    latitude: -1.3192,
    longitude: 36.9278,
    elevation: 1624,
    county: "Nairobi"
},

{
    stationCode: "HKMO",
    stationName: "Moi International Airport",
    latitude: -4.0348,
    longitude: 39.5942,
    elevation: 61,
    county: "Mombasa"
},

{
    stationCode: "HKIS",
    stationName: "Kisumu International Airport",
    latitude: -0.0861,
    longitude: 34.7289,
    elevation: 1131,
    county: "Kisumu"
},

{
    stationCode: "HKEL",
    stationName: "Eldoret International Airport",
    latitude: 0.4044,
    longitude: 35.2389,
    elevation: 2133,
    county: "Uasin Gishu"
},

{
    stationCode: "HKWJ",
    stationName: "Wajir Airport",
    latitude: 1.7332,
    longitude: 40.0916,
    elevation: 244,
    county: "Wajir"
},

{
    stationCode: "HKMA",
    stationName: "Malindi Airport",
    latitude: -3.2293,
    longitude: 40.1017,
    elevation: 24,
    county: "Kilifi"
},

{
    stationCode: "HKLO",
    stationName: "Lodwar Airport",
    latitude: 3.1219,
    longitude: 35.6087,
    elevation: 515,
    county: "Turkana"
},

{
    stationCode: "HKKE",
    stationName: "Kericho Airstrip",
    latitude: -0.3670,
    longitude: 35.2830,
    elevation: 2184,
    county: "Kericho"
},

{
    stationCode: "HKNY",
    stationName: "Nanyuki Airstrip",
    latitude: 0.0170,
    longitude: 37.0738,
    elevation: 1907,
    county: "Laikipia"
},

{
    stationCode: "HKMY",
    stationName: "Moyale Airstrip",
    latitude: 3.4650,
    longitude: 39.1050,
    elevation: 1098,
    county: "Marsabit"
},

{
    stationCode: "HKKT",
    stationName: "Kitale Airstrip",
    latitude: 1.0150,
    longitude: 35.0060,
    elevation: 1895,
    county: "Trans Nzoia"
},

{
    stationCode: "HKMB",
    stationName: "Marsabit Airport",
    latitude: 2.3440,
    longitude: 37.9990,
    elevation: 1345,
    county: "Marsabit"
},

{
    stationCode: "HKGA",
    stationName: "Garissa Airport",
    latitude: -0.4630,
    longitude: 39.6480,
    elevation: 147,
    county: "Garissa"
},

{
    stationCode: "HKHO",
    stationName: "Hola Airstrip",
    latitude: -1.5220,
    longitude: 40.0040,
    elevation: 59,
    county: "Tana River"
} ];

/**
 * ============================================================================
 * All Airports
 * ============================================================================
 */

static all(): AirportDefinition[] {

    return this.AIRPORTS;

}

/**
 * ============================================================================
 * Airport by ICAO
 * ============================================================================
 */

static byCode(

    stationCode: string

): AirportDefinition | undefined {

    return this.AIRPORTS.find(

        airport =>

            airport.stationCode === stationCode

    );

}

/**
 * ============================================================================
 * Airports by County
 * ============================================================================
 */

static byCounty(

    county: string

): AirportDefinition[] {

    return this.AIRPORTS.filter(

        airport =>

            airport.county.toLowerCase() ===

            county.toLowerCase()

    );

}

/**
 * ============================================================================
 * Airport Coordinates
 * ============================================================================
 */

static coordinates(

    stationCode: string

) {

    const airport = this.byCode(

        stationCode

    );

    if (!airport) {

        return null;

    }

    return {

        latitude: airport.latitude,

        longitude: airport.longitude

    };

}

}