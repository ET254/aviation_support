export class NetCDFReader {
  static describe(filePath: string) {
    return {
      filePath,
      kind: 'netcdf',
      metadata: {
        variables: ['temperature', 'wind', 'humidity', 'precipitation'],
        dimensions: ['time', 'lat', 'lon', 'level'],
      },
    };
  }
}
