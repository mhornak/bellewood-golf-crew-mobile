// Replace lines 73-74 in CreateSessionScreen.tsx with this:
const [year, month, day] = formData.date.split('-');
const [hours, minutes] = formData.time.split(':');
const localDateTime = new Date(
  parseInt(year), 
  parseInt(month) - 1, // Month is 0-indexed
  parseInt(day), 
  parseInt(hours), 
  parseInt(minutes)
);
const dateTimeString = localDateTime.toISOString();

console.log('DEBUG: Local time input:', formData.date, formData.time);
console.log('DEBUG: Created Date object:', localDateTime);
console.log('DEBUG: ISO string for API:', dateTimeString);
