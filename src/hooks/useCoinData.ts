
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

export function useCoinData() {
  const fetchCoinData = async (): Promise<CoinData> => {
    console.log("Fetching live data for Bosley Coin:", TOKEN_ADDRESS);
    
    // Try GMGN.ai API first - best for Solana meme coins
    try {
      const gmgnResponse = await fetch(
        `https://gmgn.ai/defi/quotation/v1/tokens/sol/${TOKEN_ADDRESS}`,
        { 
          cache: "no-store",
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        }
      );
      
      if (gmgnResponse.ok) {
        const gmgnData = await gmgnResponse.json();
        console.log("GMGN response:", gmgnData);
        
        if (gmgnData.data && gmgnData.data.token) {
          const token = gmgnData.data.token;
          
          return {
            price: parseFloat(token.price) || 0,
            priceChange24h: parseFloat(token.price_change_24h) || 0,
            priceChange7d: parseFloat(token.price_change_7d) || 0,
            priceChange30d: parseFloat(token.price_change_30d) || 0,
            marketCap: parseFloat(token.market_cap) || 0,
            volume24h: parseFloat(token.volume_24h) || 0,
            circulatingSupply: parseFloat(token.total_supply) || 0,
            totalSupply: parseFloat(token.total_supply) || 0,
            high24h: parseFloat(token.price) * 1.05 || 0,
            low24h: parseFloat(token.price) * 0.95 || 0,
          };
        }
      }
    } catch (gmgnError) {
      console.log("GMGN API failed, trying next source");
    }

    // Try Moonshot API for Solana tokens
    try {
      const moonshotResponse = await fetch(
        `https://api.moonshot.cc/token/v1/sol/${TOKEN_ADDRESS}`,
        { 
          cache: "no-store",
          headers: {
            "Accept": "application/json",
          }
        }
      );
      
      if (moonshotResponse.ok) {
        const moonshotData = await moonshotResponse.json();
        console.log("Moonshot response:", moonshotData);
        
        if (moonshotData.success && moonshotData.token) {
          const token = moonshotData.token;
          
          return {
            price: parseFloat(token.priceUsd) || 0,
            priceChange24h: parseFloat(token.priceChange24h) || 0,
            priceChange7d: parseFloat(token.priceChange7d) || 0,
            priceChange30d: 0,
            marketCap: parseFloat(token.marketCap) || 0,
            volume24h: parseFloat(token.volume24h) || 0,
            circulatingSupply: parseFloat(token.supply) || 0,
            totalSupply: parseFloat(token.supply) || 0,
            high24h: parseFloat(token.priceUsd) * 1.05 || 0,
            low24h: parseFloat(token.priceUsd) * 0.95 || 0,
          };
        }
      }
    } catch (moonshotError) {
      console.log("Moonshot API failed, trying next source");
    }

    // Try Birdeye API - good for Solana tokens
    try {
      const birdeyeResponse = await fetch(
        `https://public-api.birdeye.so/defi/token_overview?address=${TOKEN_ADDRESS}`,
        { 
          cache: "no-store",
          headers: {
            "Accept": "application/json",
            "X-API-KEY": "public" // Using public endpoints
          }
        }
      );
      
      if (birdeyeResponse.ok) {
        const birdeyeData = await birdeyeResponse.json();
        console.log("Birdeye response:", birdeyeData);
        
        if (birdeyeData.success && birdeyeData.data) {
          const token = birdeyeData.data;
          
          return {
            price: parseFloat(token.price) || 0,
            priceChange24h: parseFloat(token.priceChange24hPercent) || 0,
            priceChange7d: parseFloat(token.priceChange7dPercent) || 0,
            priceChange30d: parseFloat(token.priceChange30dPercent) || 0,
            marketCap: parseFloat(token.mc) || 0,
            volume24h: parseFloat(token.v24hUSD) || 0,
            circulatingSupply: parseFloat(token.supply) || 0,
            totalSupply: parseFloat(token.supply) || 0,
            high24h: parseFloat(token.price) * 1.1 || 0,
            low24h: parseFloat(token.price) * 0.9 || 0,
          };
        }
      }
    } catch (birdeyeError) {
      console.log("Birdeye API failed, trying next source");
    }

    // Try CoinGecko as fallback
    try {
      const geckoResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${TOKEN_ADDRESS}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
        { 
          cache: "no-store",
          headers: {
            "Accept": "application/json",
          }
        }
      );
      
      if (geckoResponse.ok) {
        const geckoData = await geckoResponse.json();
        console.log("CoinGecko response:", geckoData);
        
        const tokenData = geckoData[TOKEN_ADDRESS.toLowerCase()];
        if (tokenData) {
          return {
            price: parseFloat(tokenData.usd) || 0,
            priceChange24h: parseFloat(tokenData.usd_24h_change) || 0,
            priceChange7d: 0,
            priceChange30d: 0,
            marketCap: parseFloat(tokenData.usd_market_cap) || 0,
            volume24h: parseFloat(tokenData.usd_24h_vol) || 0,
            circulatingSupply: 0,
            totalSupply: 0,
            high24h: parseFloat(tokenData.usd) * 1.05 || 0,
            low24h: parseFloat(tokenData.usd) * 0.95 || 0,
          };
        }
      }
    } catch (geckoError) {
      console.log("CoinGecko API failed");
    }

    // If all APIs fail, throw error instead of returning fallback
    throw new Error("Unable to fetch live data from any source");
  };

  const fetchChartData = async (): Promise<ChartData[]> => {
    console.log("Fetching live chart data for:", TOKEN_ADDRESS);
    
    // Try to get historical data from Birdeye
    try {
      const response = await fetch(
        `https://public-api.birdeye.so/defi/history_price?address=${TOKEN_ADDRESS}&address_type=token&type=1H&time_from=${Math.floor(Date.now() / 1000) - 24 * 60 * 60}&time_to=${Math.floor(Date.now() / 1000)}`,
        { 
          cache: "no-store",
          headers: {
            "Accept": "application/json",
            "X-API-KEY": "public"
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log("Chart data response:", data);
        
        if (data.success && data.data && data.data.items) {
          return data.data.items.slice(-14).map((item: any, index: number) => {
            const date = new Date(item.unixTime * 1000);
            return {
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              price: parseFloat(item.value) || 0,
              volume: parseFloat(item.volume) || 0
            };
          });
        }
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }

    // Try GMGN for chart data
    try {
      const response = await fetch(
        `https://gmgn.ai/defi/quotation/v1/tokens/sol/${TOKEN_ADDRESS}/kline?period=1h&limit=24`,
        { 
          cache: "no-store",
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log("GMGN chart data:", data);
        
        if (data.data && Array.isArray(data.data)) {
          return data.data.slice(-14).map((item: any, index: number) => {
            const date = new Date(item.timestamp * 1000);
            return {
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              price: parseFloat(item.close) || 0,
              volume: parseFloat(item.volume) || 0
            };
          });
        }
      }
    } catch (error) {
      console.error("Error fetching GMGN chart data:", error);
    }

    // If chart APIs fail, throw error
    throw new Error("Unable to fetch chart data from any source");
  };

  // Use React Query for data fetching with caching and refetching
  const { data: coinData, isLoading: isLoadingCoinData, error: coinError } = useQuery({
    queryKey: ['live-coinData', TOKEN_ADDRESS],
    queryFn: fetchCoinData,
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 2, // Retry twice before failing
  });

  const { data: chartData, isLoading: isLoadingChartData, error: chartError } = useQuery({
    queryKey: ['live-chartData', TOKEN_ADDRESS],
    queryFn: fetchChartData,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2, // Retry twice before failing
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
