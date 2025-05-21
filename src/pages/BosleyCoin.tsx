
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Coins, TrendingUp, Info, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { useCoinData } from "@/hooks/useCoinData";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const BosleyCoin = () => {
  const { coinData, chartData, isLoading, error } = useCoinData();
  const { toast } = useToast();

  const handleRefresh = useCallback(() => {
    window.location.reload();
    toast("Fetching the latest Bosley Coin information");
  }, [toast]);
  
  // Format number to display as currency
  const formatCurrency = useCallback((value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  }, []);

  // Format small price values (typical for meme coins)
  const formatSmallPrice = useCallback((value: number) => {
    if (value < 0.00001) {
      return `$${value.toExponential(6)}`;
    } else if (value < 0.01) {
      return `$${value.toFixed(8)}`;
    } else {
      return `$${value.toFixed(6)}`;
    }
  }, []);

  // Format percentage change with color and arrow
  const formatPercentChange = useCallback((value: number) => {
    const color = value >= 0 ? "text-green-500" : "text-red-500";
    const Icon = value >= 0 ? ArrowUp : ArrowDown;
    return (
      <span className={`flex items-center gap-1 ${color}`}>
        <Icon className="w-4 h-4" />
        {Math.abs(value).toFixed(2)}%
      </span>
    );
  }, []);

  // Custom tooltip for the chart to handle small values
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const price = payload[0].value;
      const formattedPrice = formatSmallPrice(price);
      
      return (
        <div className="bg-background border border-border/50 p-2 rounded-md shadow-md text-xs sm:text-sm">
          <p>{`Date: ${payload[0].payload.date}`}</p>
          <p className="font-medium text-accent">{`Price: ${formattedPrice}`}</p>
          {payload[1] && (
            <p>{`Volume: ${formatCurrency(payload[1].value)}`}</p>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="container py-4 sm:py-6 md:py-8 mx-auto max-w-7xl animate-fade-in px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Bosley Coin</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Live meme coin analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {isLoading ? (
            <span className="px-2 py-1 text-sm font-medium bg-muted rounded-md">Loading...</span>
          ) : (
            <>
              <span className="text-lg sm:text-xl font-mono font-semibold text-accent">
                {coinData ? formatSmallPrice(coinData.price) : "$0.000000"}
              </span>
              <span className={`px-2 py-1 text-xs sm:text-sm font-medium ${coinData && coinData.priceChange24h >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} rounded-md flex items-center`}>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 
                {coinData ? `${coinData.priceChange24h >= 0 ? '+' : ''}${coinData.priceChange24h.toFixed(2)}%` : '--'}
              </span>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <Card className="p-3 sm:p-4 md:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-6">Bosley Coin Price Chart</h3>
        {isLoading ? (
          <div className="h-[300px] sm:h-[400px] md:h-[500px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
            <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="h-[300px] sm:h-[400px] md:h-[500px] w-full">
            <ChartContainer
              config={{
                price: {
                  label: "Price",
                  color: "#9b87f5"
                },
                volume: {
                  label: "Volume",
                  color: "#7E69AB"
                }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    tickFormatter={(value) => `$${value < 0.0001 ? value.toExponential(2) : value.toFixed(6)}`}
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', marginTop: '10px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#9b87f5" 
                    strokeWidth={2} 
                    dot={{ fill: "#9b87f5", r: 3 }} 
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#7E69AB" 
                    strokeWidth={1.5} 
                    dot={{ fill: "#7E69AB", r: 2 }} 
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-background/50 rounded-lg p-3 sm:p-4 border border-border/50 animate-pulse">
              <div className="h-3 sm:h-4 w-16 sm:w-20 bg-muted rounded mb-2"></div>
              <div className="h-4 sm:h-6 w-12 sm:w-16 bg-muted rounded"></div>
            </div>
          ))
        ) : (
          <>
            <Card className="p-3 sm:p-4 bg-background/50">
              <p className="text-xs sm:text-sm text-muted-foreground">Market Cap</p>
              <p className="text-sm sm:text-lg font-bold mt-1">{coinData ? formatCurrency(coinData.marketCap) : "--"}</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-background/50">
              <p className="text-xs sm:text-sm text-muted-foreground">24h Volume</p>
              <p className="text-sm sm:text-lg font-bold mt-1">{coinData ? formatCurrency(coinData.volume24h) : "--"}</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-background/50">
              <p className="text-xs sm:text-sm text-muted-foreground">7d Change</p>
              <p className="text-sm sm:text-lg font-medium mt-1">
                {coinData && formatPercentChange(coinData.priceChange7d)}
              </p>
            </Card>
            <Card className="p-3 sm:p-4 bg-background/50">
              <p className="text-xs sm:text-sm text-muted-foreground">30d Change</p>
              <p className="text-sm sm:text-lg font-medium mt-1">
                {coinData && formatPercentChange(coinData.priceChange30d)}
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default BosleyCoin;
