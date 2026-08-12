const currencySymbols: Record<string, string> = {
  NGN: '₦',
  GBP: '£',
};

const displayCurrency = (num: number, currency: 'GBP' | 'NGN' = 'NGN') => {
    // Strictly ensure num is a number
  if (typeof num !== 'number' || isNaN(num) || num === undefined || num === null) {
    return `${currencySymbols[currency]}0.00`; // fallback
  }

  let formatted = '';

  // Handling GBP (use Intl.NumberFormat)
  if (currency === 'GBP') {
    formatted = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  // Handling NGN (Manually format for NGN)
  if (currency === 'NGN') {
    // Force 2 decimal places
    formatted = num.toFixed(2);

    // Add commas for thousands manually
    formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Prepend the ₦ symbol manually (override any previous formatting)
    formatted = currencySymbols['NGN'] + formatted;
  }

  return formatted;  // Return the formatted currency
};

export default displayCurrency;
