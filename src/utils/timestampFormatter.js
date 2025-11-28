/**
 * Format timestamp to desired format
 * @param {Date|string} timestamp - Date object or ISO string
 * @param {string} format - 'date' or 'datetime'
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (timestamp, format = 'datetime') => {
  const date = new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid timestamp provided');
  }

  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  if (format === 'date') {
    return `${day} ${month} ${year}`;
  }

  // datetime format
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
};

export default formatTimestamp;
