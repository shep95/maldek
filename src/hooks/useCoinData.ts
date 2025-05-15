
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

// This token ID should be replaced with the actual CoinGecko ID for Bosley Coin
// For testing purposes, we're using a placeholder
const COIN_ID = "solana"; // using Solana as an example until we have the real token ID

export function useCoinData() {
  const fetchCoinData = async (): Promise<CoinData> => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${COIN_ID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch coin data");
      }
      
      const data = await response.json();
      
      return {
        price: data.market_data.current_price.usd || 0.000323,
        priceChange24h: data.market_data.price_change_percentage_24h || 12.4,
        priceChange7d: data.market_data.price_change_percentage_7d || 18.2,
        priceChange30d: data.market_data.price_change_percentage_30d || 42.7,
        marketCap: data.market_data.market_cap.usd || 1200000,
        volume24h: data.market_data.total_volume.usd || 145000,
        circulatingSupply: data.market_data.circulating_supply || 5100000000,
        totalSupply: data.market_data.total_supply || 10000000000,
        high24h: data.market_data.high_24h.usd || 0.000341,
        low24h: data.market_data.low_24h.usd || 0.000298,
      };
    } catch (error) {
      console.error("Error fetching coin data:", error);
      
      // Return fallback data if API fails
      return {
        price: 0.000323,
        priceChange24h: 12.4,
        priceChange7d: 18.2,
        priceChange30d: 42.7,
        marketCap: 1200000,
        volume24h: 145000,
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
        `https://api.coingecko.com/api/v3/coins/${COIN_ID}/market_chart?vs_currency=usd&days=14&interval=daily`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch chart data");
      }
      
      const data = await response.json();
      
      // Format the data for Recharts
      return data.prices.map((item: [number, number], index: number) => {
        const date = new Date(item[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const price = item[1];
        // Use volume data if available or generate mock volume
        const volume = data.total_volumes && data.total_volumes[index] 
          ? data.total_volumes[index][1] 
          : price * (5000 + Math.random() * 15000);
        
        return { date, price, volume };
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      
      // Return fallback data if API fails
      return [
        { date: "Jan", price: 0.00012, volume: 12000 },
        { date: "Feb", price: 0.00018, volume: 18000 },
        { date: "Mar", price: 0.00015, volume: 15000 },
        { date: "Apr", price: 0.00022, volume: 22000 },
        { date: "May", price: 0.00028, volume: 28000 },
        { date: "Jun", price: 0.00024, volume: 24000 },
        { date: "Jul", price: 0.00032, volume: 32000 }
      ];
    }
  };

  // Use React Query for data fetching with caching and refetching
  const { data: coinData, isLoading: isLoadingCoinData, error: coinError } = useQuery({
    queryKey: ['coinData', COIN_ID],
    queryFn: fetchCoinData,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  const { data: chartData, isLoading: isLoadingChartData, error: chartError } = useQuery({
    queryKey: ['chartData', COIN_ID],
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
