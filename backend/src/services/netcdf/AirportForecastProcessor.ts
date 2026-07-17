import { ForecastExtractor } from './ForecastExtractor';
import { GridInterpolator } from './GridInterpolator';

export class AirportForecastProcessor {
  static process(filePath: string) {
    const extracted = ForecastExtractor.extract(filePath);
    const interpolated = GridInterpolator.interpolate(extracted.variables);
    return {
      filePath,
      extracted,
      interpolated,
      airportImpact: 'Monitor runway configuration and prepare possible delays.',
    };
  }
}
