export const RangeMap = (
  value: any,
  inMin: any,
  inMax: any,
  outMin: any,
  outMax: any
) => ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
