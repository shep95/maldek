
import { useQuery } from "@tanstack/react-query";

interface CoinData {
  price: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  high24h: number;
  low24h: number;
}

interface ChartData {
  date: string;
  price: number;
  volume: number;
}

// We're using Solana as a reference for price trends, but customizing the data
// to represent our fictional "Bosley Coin" meme coin with more realistic values
const REFERENCE_COIN_ID = "solana";

// Scaling factor to get a realistic meme coin price range (around $0.0000xx)
const PRICE_SCALING_FACTOR = 0.00000190;

export function useCoinData() {
  const fetchCoinData = async (): Promise<CoinData> => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${REFERENCE_COIN_ID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
        { cache: "no-store" }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch coin data: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Calculate a base price typical for meme coins
      const basePrice = data.market_data.current_price.usd * PRICE_SCALING_FACTOR;
      
      // Use actual percentage changes but apply them to our meme coin price
      const priceChange24h = data.market_data.price_change_percentage_24h || 12.4;
      const priceChange7d = data.market_data.price_change_percentage_7d || 18.2;
      const priceChange30d = data.market_data.price_change_percentage_30d || 42.7;
      
      // Calculate high/low based on the actual percentage changes
      const high24h = basePrice * (1 + Math.abs(priceChange24h / 100) * 1.2);
      const low24h = basePrice * (1 - Math.abs(priceChange24h / 100) * 0.8);
      
      // Total supply is fixed at 10 billion (typical for meme coins)
      const totalSupply = 10000000000;
      
      // Circulating supply is 51% of total (also typical)
      const circulatingSupply = 5100000000;
      
      // Market cap is price * circulating supply
      const marketCap = basePrice * circulatingSupply;
      
      // Daily volume is typically 10-30% of market cap for active meme coins
      const volume24h = marketCap * (0.15 + (Math.random() * 0.15));
      
      return {
        price: basePrice,
        priceChange24h,
        priceChange7d,
        priceChange30d,
        marketCap,
        volume24h,
        circulatingSupply,
        totalSupply,
        high24h,
        low24h,
      };
    } catch (error) {
      console.error("Error fetching coin data:", error);
      
      // Return realistic fallback data for a meme coin
      return {
        price: 0.0000032,
        priceChange24h: 12.4,
        priceChange7d: 18.2,
        priceChange30d: 42.7,
        marketCap: 16320000,
        volume24h: 2448000,
        circulatingSupply: 5100000000,
        totalSupply: 10000000000,
        high24h: 0.0000034,
        low24h: 0.0000029,
      };
    }
  };

  const fetchChartData = async (): Promise<ChartData[]> => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${REFERENCE_COIN_ID}/market_chart?vs_currency=usd&days=14&interval=daily`,
        { cache: "no-store" }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.prices || !Array.isArray(data.prices) || data.prices.length === 0) {
        throw new Error('Invalid price data structure received');
      }
      
      // Format the data for Recharts, applying our meme coin scaling
      return data.prices.map((item: [number, number], index: number) => {
        const timestamp = item[0];
        const date = new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Scale the price to meme coin levels
        const price = item[1] * PRICE_SCALING_FACTOR;
        
        // Use actual volume data if available, or generate realistic volume
        let volume = price * (5000000 + Math.random() * 15000000);
        if (data.total_volumes && Array.isArray(data.total_volumes) && data.total_volumes[index]) {
          volume = data.total_volumes[index][1] * PRICE_SCALING_FACTOR * 5000;
        }
        
        return { date, price, volume };
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      
      // Return realistic fallback data for a meme coin chart
      const today = new Date();
      const basePrice = 0.0000032;
      
      return Array(14).fill(0).map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (13 - i));
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Generate a somewhat realistic price movement with upward trend
        const trendFactor = Math.sin(i / 2) + (i / 14) * 0.8;
        const randomFactor = (Math.random() - 0.3) * 0.2;
        const price = basePrice * (0.85 + trendFactor * 0.15 + randomFactor);
        
        // Volume typically correlates somewhat with price changes
        const priceChangeRatio = i > 0 ? price / basePrice : 1;
        const volumeFactor = 1 + Math.abs(priceChangeRatio - 1) * 5;
        const volume = basePrice * 5000000 * volumeFactor;
        
        return {
          date: dateStr,
          price,
          volume
        };
      });
    }
  };

  // Use React Query for data fetching with caching and refetching
  const { data: coinData, isLoading: isLoadingCoinData, error: coinError } = useQuery({
    queryKey: ['coinData', REFERENCE_COIN_ID],
    queryFn: fetchCoinData,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  const { data: chartData, isLoading: isLoadingChartData, error: chartError } = useQuery({
    queryKey: ['chartData', REFERENCE_COIN_ID],
    queryFn: fetchChartData,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 180000, // Consider data stale after 3 minutes
  });

  const isLoading = isLoadingCoinData || isLoadingChartData;
  const error = coinError || chartError;

  return {
    coinData,
    chartData,
    isLoading,
    error,
  };
}
