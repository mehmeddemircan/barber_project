export function isCalendarDate(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value;
}

export function isSundayDate(value: string) {
  return isCalendarDate(value) && new Date(`${value}T00:00:00.000Z`).getUTCDay() === 0;
}
