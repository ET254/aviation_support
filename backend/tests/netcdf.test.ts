import { NetCDFParser } from '../src/utils/netcdf-parser';

describe('NetCDFParser', () => {
  it('creates a structured forecast payload from a NetCDF-like file path', async () => {
    const result = await NetCDFParser.parseFile('dummy-path.nc');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('taf');
    expect(result[0]).toHaveProperty('sigmetData');
    expect(result[0]).toHaveProperty('upperWind');
  });
});
