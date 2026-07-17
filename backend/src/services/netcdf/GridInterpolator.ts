export class GridInterpolator {
  static interpolate(values: Record<string, number[]>) {
    return {
      values,
      interpolated: true,
    };
  }
}
