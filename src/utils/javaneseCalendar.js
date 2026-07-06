// Array of Pasaran names
const pasaranNames = ['Wage', 'Kliwon', 'Legi', 'Pahing', 'Pon'];

/**
 * Get Javanese Pasaran for a given date
 * @param {Date} date - The date to calculate Pasaran for
 * @returns {string} Pasaran name (Legi, Pahing, Pon, Wage, Kliwon)
 */
export function getPasaran(date) {
  // Use noon to avoid timezone issues when converting to days
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
  
  // Jan 1, 1970 was Thursday Wage
  // Unix Epoch time in milliseconds divided by milliseconds per day
  const daysSinceEpoch = Math.floor(utcDate.getTime() / (1000 * 60 * 60 * 24));
  
  // Ensure we get a positive modulo for dates before 1970 if needed
  // Using modulo 5 because there are 5 pasaran days
  const pasaranIndex = ((daysSinceEpoch % 5) + 5) % 5;
  
  return pasaranNames[pasaranIndex];
}
