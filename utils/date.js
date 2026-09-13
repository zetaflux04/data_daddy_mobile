export const toISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayISO = () => toISODate(new Date());

export const parseISODate = (iso) => {
  if (!iso || typeof iso !== 'string') return new Date();
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
};

export const addDaysISO = (iso, days) => {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

export const formatDisplayDate = (iso) => {
  if (!iso) return 'Select date';
  return parseISODate(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatShortRange = (start, end) => {
  if (!start || !end) return 'Custom';
  const startLabel = parseISODate(start).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
  const endLabel = parseISODate(end).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
  return `${startLabel} – ${endLabel}`;
};

export const daysInMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0).getDate();
