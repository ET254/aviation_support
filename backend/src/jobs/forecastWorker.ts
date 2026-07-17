import { logger } from '../utils/logger';
import { NetCDFParser } from '../utils/netcdf-parser';
import { AirportForecastProcessor } from '../services/netcdf/AirportForecastProcessor';

export class ForecastWorker {
  static async run(filePath: string) {
    logger.info(`Processing forecast file ${filePath}`);
    const parsed = await NetCDFParser.parseFile(filePath);
    const airportImpact = AirportForecastProcessor.process(filePath);
    return { parsed, airportImpact };
  }
}
