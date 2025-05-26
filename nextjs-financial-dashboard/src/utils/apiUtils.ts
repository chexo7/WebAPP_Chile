const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=clp';

interface CoinGeckoResponse {
  usd: {
    clp: number;
  };
}

/**
 * Fetches the current USD to CLP exchange rate from CoinGecko.
 * @returns A promise that resolves to the CLP value for 1 USD, or null if an error occurs.
 */
export const fetchUSDToCLPRate = async (): Promise<number | null> => {
  try {
    const response = await fetch(COINGECKO_URL);
    if (!response.ok) {
      throw new Error(`CoinGecko API request failed with status ${response.status}`);
    }
    const data = (await response.json()) as CoinGeckoResponse;
    if (data.usd && typeof data.usd.clp === 'number') {
      return data.usd.clp;
    } else {
      console.error('Invalid data structure from CoinGecko API:', data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching USD to CLP rate:', error);
    return null;
  }
};
