import {
  endOfMonth,
  format,
  isValid,
  parse,
  startOfMonth,
  subDays,
} from "date-fns";

export type TimeInterval = {
  from: string;
  to: string;
};

const asString = (date: Date) => format(date, "yyyy-MM-dd");
const toInterval = (from: Date, to: Date) => ({
  from: asString(from),
  to: asString(to),
});

export function monthInterval(reference: string): TimeInterval | null {
  const refDate = parse(reference, "yyyy-MM", new Date());
  if (!isValid(refDate)) return null;
  return toInterval(startOfMonth(refDate), endOfMonth(refDate));
}

export function lastNDays(nDays: number): TimeInterval {
  const today = new Date();
  return toInterval(subDays(today, nDays), today);
}
