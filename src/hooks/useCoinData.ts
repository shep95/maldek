
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

// Real Bosley Coin token address
const TOKEN_ADDRESS = "4P2B244yZ4Q6D76A8XzKHXxfua7xtYVpUE9X6qvomoon";

// Request queue to prevent API spam
let requestQueue: Promise<any> | null = null;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests

export function useCoinData() {
  const fetchCoinData = async (): Promise<CoinData> => {
    // Throttle requests to prevent API overwhelm
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL && requestQueue) {
      return requestQueue;
    }
    
    lastRequestTime = now;
    
    const fetchPromise = (async () => {
      console.log("Fetching live data for Bosley Coin:", TOKEN_ADDRESS);
      
      // Try GMGN.ai API first - best for Solana meme coins
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const gmgnResponse = await fetch(
          `https://gmgn.ai/defi/quotation/v1/tokens/sol/${TOKEN_ADDRESS}`,
          { 
            cache: "no-store",
            signal: controller.signal,
            headers: {
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          }
        );
        
        clearTimeout(timeoutId);
        
        if (gmgnResponse.ok) {
          const gmgnData = await gmgnResponse.json();
          console.log("GMGN response received");
          
          if (gmgnData.data && gmgnData.data.token) {
            const token = gmgnData.data.token;
            
            return {
              price: Math.max(0, parseFloat(token.price) || 0),
              priceChange24h: parseFloat(token.price_change_24h) || 0,
              priceChange7d: parseFloat(token.price_change_7d) || 0,
              priceChange30d: parseFloat(token.price_change_30d) || 0,
              marketCap: Math.max(0, parseFloat(token.market_cap) || 0),
              volume24h: Math.max(0, parseFloat(token.volume_24h) || 0),
              circulatingSupply: Math.max(0, parseFloat(token.total_supply) || 0),
              totalSupply: Math.max(0, parseFloat(token.total_supply) || 0),
              high24h: Math.max(0, parseFloat(token.price) * 1.05 || 0),
              low24h: Math.max(0, parseFloat(token.price) * 0.95 || 0),
            };
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log("GMGN API request timed out");
        } else {
          console.log("GMGN API failed, trying next source");
        }
      }

      // Try Moonshot API for Solana tokens with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const moonshotResponse = await fetch(
          `https://api.moonshot.cc/token/v1/sol/${TOKEN_ADDRESS}`,
          { 
            cache: "no-store",
            signal: controller.signal,
            headers: { "Accept": "application/json" }
          }
        );
        
        clearTimeout(timeoutId);
        
        if (moonshotResponse.ok) {
          const moonshotData = await moonshotResponse.json();
          console.log("Moonshot response received");
          
          if (moonshotData.success && moonshotData.token) {
            const token = moonshotData.token;
            
            return {
              price: Math.max(0, parseFloat(token.priceUsd) || 0),
              priceChange24h: parseFloat(token.priceChange24h) || 0,
              priceChange7d: parseFloat(token.priceChange7d) || 0,
              priceChange30d: 0,
              marketCap: Math.max(0, parseFloat(token.marketCap) || 0),
              volume24h: Math.max(0, parseFloat(token.volume24h) || 0),
              circulatingSupply: Math.max(0, parseFloat(token.supply) || 0),
              totalSupply: Math.max(0, parseFloat(token.supply) || 0),
              high24h: Math.max(0, parseFloat(token.priceUsd) * 1.05 || 0),
              low24h: Math.max(0, parseFloat(token.priceUsd) * 0.95 || 0),
            };
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log("Moonshot API request timed out");
        } else {
          console.log("Moonshot API failed, trying next source");
        }
      }

      // Try Birdeye API - good for Solana tokens with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const birdeyeResponse = await fetch(
          `https://public-api.birdeye.so/defi/token_overview?address=${TOKEN_ADDRESS}`,
          { 
            cache: "no-store",
            signal: controller.signal,
            headers: {
              "Accept": "application/json",
              "X-API-KEY": "public"
            }
          }
        );
        
        clearTimeout(timeoutId);
        
        if (birdeyeResponse.ok) {
          const birdeyeData = await birdeyeResponse.json();
          console.log("Birdeye response received");
          
          if (birdeyeData.success && birdeyeData.data) {
            const token = birdeyeData.data;
            
            return {
              price: Math.max(0, parseFloat(token.price) || 0),
              priceChange24h: parseFloat(token.priceChange24hPercent) || 0,
              priceChange7d: parseFloat(token.priceChange7dPercent) || 0,
              priceChange30d: parseFloat(token.priceChange30dPercent) || 0,
              marketCap: Math.max(0, parseFloat(token.mc) || 0),
              volume24h: Math.max(0, parseFloat(token.v24hUSD) || 0),
              circulatingSupply: Math.max(0, parseFloat(token.supply) || 0),
              totalSupply: Math.max(0, parseFloat(token.supply) || 0),
              high24h: Math.max(0, parseFloat(token.price) * 1.1 || 0),
              low24h: Math.max(0, parseFloat(token.price) * 0.9 || 0),
            };
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log("Birdeye API request timed out");
        } else {
          console.log("Birdeye API failed, trying next source");
        }
      }

      // Try CoinGecko as fallback with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const geckoResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${TOKEN_ADDRESS}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
          { 
            cache: "no-store",
            signal: controller.signal,
            headers: { "Accept": "application/json" }
          }
        );
        
        clearTimeout(timeoutId);
        
        if (geckoResponse.ok) {
          const geckoData = await geckoResponse.json();
          console.log("CoinGecko response received");
          
          const tokenData = geckoData[TOKEN_ADDRESS.toLowerCase()];
          if (tokenData) {
            return {
              price: Math.max(0, parseFloat(tokenData.usd) || 0),
              priceChange24h: parseFloat(tokenData.usd_24h_change) || 0,
              priceChange7d: 0,
              priceChange30d: 0,
              marketCap: Math.max(0, parseFloat(tokenData.usd_market_cap) || 0),
              volume24h: Math.max(0, parseFloat(tokenData.usd_24h_vol) || 0),
              circulatingSupply: 0,
              totalSupply: 0,
              high24h: Math.max(0, parseFloat(tokenData.usd) * 1.05 || 0),
              low24h: Math.max(0, parseFloat(tokenData.usd) * 0.95 || 0),
            };
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log("CoinGecko API request timed out");
        } else {
          console.log("CoinGecko API failed");
        }
      }

      // Return fallback data instead of throwing to prevent app crashes
      console.log("All APIs failed, returning fallback data");
      return {
        price: 0,
        priceChange24h: 0,
        priceChange7d: 0,
        priceChange30d: 0,
        marketCap: 0,
        volume24h: 0,
        circulatingSupply: 0,
        totalSupply: 0,
        high24h: 0,
        low24h: 0,
      };
    })();
    
    requestQueue = fetchPromise;
    return fetchPromise;
  };

  const fetchChartData = async (): Promise<ChartData[]> => {
    console.log("Fetching live chart data for:", TOKEN_ADDRESS);
    
    // Try to get historical data from Birdeye with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `https://public-api.birdeye.so/defi/history_price?address=${TOKEN_ADDRESS}&address_type=token&type=1H&time_from=${Math.floor(Date.now() / 1000) - 24 * 60 * 60}&time_to=${Math.floor(Date.now() / 1000)}`,
        { 
          cache: "no-store",
          signal: controller.signal,
          headers: {
            "Accept": "application/json",
            "X-API-KEY": "public"
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Chart data response received");
        
        if (data.success && data.data && data.data.items) {
          return data.data.items.slice(-14).map((item: any) => {
            const date = new Date(item.unixTime * 1000);
            return {
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              price: Math.max(0, parseFloat(item.value) || 0),
              volume: Math.max(0, parseFloat(item.volume) || 0)
            };
          });
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Chart data request timed out");
      } else {
        console.error("Error fetching chart data:", error);
      }
    }

    // Try GMGN for chart data with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(
        `https://gmgn.ai/defi/quotation/v1/tokens/sol/${TOKEN_ADDRESS}/kline?period=1h&limit=24`,
        { 
          cache: "no-store",
          signal: controller.signal,
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log("GMGN chart data received");
        
        if (data.data && Array.isArray(data.data)) {
          return data.data.slice(-14).map((item: any) => {
            const date = new Date(item.timestamp * 1000);
            return {
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              price: Math.max(0, parseFloat(item.close) || 0),
              volume: Math.max(0, parseFloat(item.volume) || 0)
            };
          });
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("GMGN chart data request timed out");
      } else {
        console.error("Error fetching GMGN chart data:", error);
      }
    }

    // Return empty array instead of throwing to prevent crashes
    console.log("Chart data APIs failed, returning empty array");
    return [];
  };

  // Use React Query for data fetching with enhanced caching and error handling
  const { data: coinData, isLoading: isLoadingCoinData, error: coinError } = useQuery({
    queryKey: ['live-coinData', TOKEN_ADDRESS],
    queryFn: fetchCoinData,
    refetchInterval: 60000, // Increased to 1 minute to reduce API load
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 1, // Reduced retries to prevent cascade failures
    retryDelay: 5000, // Fixed delay to prevent exponential backoff overload
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  const { data: chartData, isLoading: isLoadingChartData, error: chartError } = useQuery({
    queryKey: ['live-chartData', TOKEN_ADDRESS],
    queryFn: fetchChartData,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 120000, // Consider data stale after 2 minutes
    retry: 1, // Reduced retries
    retryDelay: 5000,
    refetchOnWindowFocus: false,
  });

  const isLoading = isLoadingCoinData || isLoadingChartData;
  const error = coinError || chartError;

  return {
    coinData: coinData || {
      price: 0,
      priceChange24h: 0,
      priceChange7d: 0,
      priceChange30d: 0,
      marketCap: 0,
      volume24h: 0,
      circulatingSupply: 0,
      totalSupply: 0,
      high24h: 0,
      low24h: 0,
    },
    chartData: chartData || [],
    isLoading,
    error,
  };
}
