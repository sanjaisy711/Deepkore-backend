export function getYearRange(year = new Date().getFullYear()): {
  start: number;
  end: number;
} {
  return {
    start: new Date(year, 0, 1).getTime(),
    end: new Date(year, 11, 31).getTime(),
  };
}
