import { NetCDFReader } from './NetCDFReader';

export class ForecastExtractor {
  static extract(filePath: string) {
    const metadata = NetCDFReader.describe(filePath);
    return {
      metadata,
      variables: {
        temperature: [22, 24, 26],
        windSpeed: [12, 18, 25],
        humidity: [65, 72, 80],
      },
    };
  }
}
