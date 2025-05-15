
import { useState, useEffect } from "react";
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

// We're using Solana as a base for our price trends, but will mock the actual values
// to represent our fictional "Bosley Coin"
const REFERENCE_COIN_ID = "solana";

export function useCoinData() {
  const fetchCoinData = async (): Promise<CoinData> => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${REFERENCE_COIN_ID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch coin data");
      }
      
      const data = await response.json();
      
      // Calculate a base price that's much smaller (typical for meme coins)
      // We'll use the real trend data from Solana, but scale it to meme coin levels
      const solPrice = data.market_data.current_price.usd;
      const bosleyPrice = solPrice * 0.0000019; // Scaling factor to get a small price
      
      // Apply the same percentage changes from the real data
      return {
        price: bosleyPrice,
        priceChange24h: data.market_data.price_change_percentage_24h || 12.4,
        priceChange7d: data.market_data.price_change_percentage_7d || 18.2,
        priceChange30d: data.market_data.price_change_percentage_30d || 42.7,
        marketCap: bosleyPrice * 10000000000, // 10B supply
        volume24h: bosleyPrice * 10000000000 * 0.15, // Typical volume is ~15% of market cap
        circulatingSupply: 5100000000,
        totalSupply: 10000000000,
        high24h: bosleyPrice * (1 + (data.market_data.price_change_percentage_24h / 100) * 1.2),
        low24h: bosleyPrice * (1 - (data.market_data.price_change_percentage_24h / 100) * 0.8),
      };
    } catch (error) {
      console.error("Error fetching coin data:", error);
      
      // Return fallback data if API fails
      return {
        price: 0.000323,
        priceChange24h: 12.4,
        priceChange7d: 18.2,
        priceChange30d: 42.7,
        marketCap: 3230000,
        volume24h: 484500,
        circulatingSupply: 5100000000,
        totalSupply: 10000000000,
        high24h: 0.000341,
        low24h: 0.000298,
      };
    }
  };

  const fetchChartData = async (): Promise<ChartData[]> => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${REFERENCE_COIN_ID}/market_chart?vs_currency=usd&days=14&interval=daily`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch chart data");
      }
      
      const data = await response.json();
      
      // Scale the real price data to meme coin level
      const scaleFactor = 0.0000019;
      
      // Format the data for Recharts, applying our scaling
      return data.prices.map((item: [number, number], index: number) => {
        const date = new Date(item[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const price = item[1] * scaleFactor; // Scale the real price data
        // Use volume data if available or generate mock volume
        const volume = data.total_volumes && data.total_volumes[index] 
          ? data.total_volumes[index][1] * scaleFactor * 10000 
          : price * (5000 + Math.random() * 15000);
        
        return { date, price, volume };
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      
      // Return fallback data if API fails
      const today = new Date();
      return Array(14).fill(0).map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (13 - i));
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Generate a somewhat realistic price movement
        const basePrice = 0.000323;
        const variance = (Math.sin(i / 2) + Math.random() - 0.5) * 0.00002;
        const price = basePrice + variance * (i + 1);
        
        return {
          date: dateStr,
          price,
          volume: price * (8000 + Math.random() * 12000)
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
