import {
  format,
  isToday,
  isYesterday,
  parseISO,
  isValid,
} from 'date-fns';

export const DateLabels = (date: any) => {
  const inputDate = typeof date === 'string' ? parseISO(date) : new Date(date);

  if (!isValid(inputDate)) return 'Invalid date';

  if (isToday(inputDate)) {
    return `Today at ${format(inputDate, 'hh:mm a')}`; // e.g. "Today at 02:30 PM"
  }

  if (isYesterday(inputDate)) {
    return `Yesterday at ${format(inputDate, 'hh:mm a')}`; // e.g. "Yesterday at 09:15 AM"
  }

  return format(inputDate, "dd MMM yyyy 'at' hh:mm a"); // e.g. "22 Sep 2024 at 02:30 PM"
};
