/**
 * Formats a number as a currency string.
 * @param amount The number to format.
 * @param currencySymbol The currency symbol to use (e.g., "$", "€"). Defaults to "$".
 * @param locale The locale to use for formatting (e.g., "en-US", "es-CL"). Defaults to "es-CL".
 * @returns A formatted currency string.
 */
export const formatCurrencyJS = (
  amount: number | undefined | null,
  currencySymbol: string = '$',
  locale: string = 'es-CL'
): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return `${currencySymbol}0`; // Or some other placeholder like `${currencySymbol} -`
  }

  // In the original app, it seems it always uses space after symbol for CLP, no space for USD.
  // This is a simplified version. For more precise control, you might need more specific locale handling
  // or conditional logic based on the currencySymbol or a dedicated currency code (e.g., "CLP", "USD").
  
  const usesSpace = currencySymbol === '$' || currencySymbol === 'CLP'; // Example condition

  try {
    // Using Intl.NumberFormat for robust localization if needed, though original seems simpler.
    // For simple prefixing:
    // return `${currencySymbol}${usesSpace ? ' ' : ''}${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

    // Let's try to replicate the original's apparent formatting more directly for CLP:
    if (locale === 'es-CL' && currencySymbol === '$') { // Assuming default '$' for CLP
        return `${currencySymbol} ${Number(amount).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    
    // Generic fallback using Intl.NumberFormat for other cases or if more robust formatting is desired
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencySymbol === '$' ? 'USD' : currencySymbol, // This is a guess, ideally have actual currency codes
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    // Intl.NumberFormat might place the symbol differently or add decimals based on locale.
    // To force symbol at start and no decimals:
    let formattedAmount = Number(amount).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return `${currencySymbol}${usesSpace ? ' ' : ''}${formattedAmount}`;

  } catch (error) {
    console.error("Error formatting currency:", error);
    // Fallback to basic formatting if Intl fails for some reason
    return `${currencySymbol}${usesSpace ? ' ' : ''}${String(Number(amount) || 0)}`;
  }
};

/**
 * Formats a number as a currency string, specifically for CLP, ensuring no decimal places.
 * @param amount The number to format.
 * @returns A formatted CLP currency string (e.g., "$ 1.234.567").
 */
export const formatCLPCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '$ 0';
  }
  // Ensure it's treated as an integer for formatting
  const value = Math.round(Number(amount));
  return `$ ${value.toLocaleString('es-CL')}`;
};


/**
 * Formats a number as a currency string for USD, ensuring no decimal places.
 * @param amount The number to format.
 * @returns A formatted USD currency string (e.g., "US$1,234,567").
 */
export const formatUSDCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return 'US$0';
  }
  const value = Math.round(Number(amount));
  return `US$${value.toLocaleString('en-US')}`;
};


// General purpose formatter based on display symbol from settings
export const formatDynamicCurrency = (
    amount: number | undefined | null,
    displaySymbol: string | undefined
): string => {
    if (displaySymbol === 'US$') {
        return formatUSDCurrency(amount);
    }
    // Default to CLP or use the symbol directly if it's just '$'
    return formatCLPCurrency(amount); 
};
