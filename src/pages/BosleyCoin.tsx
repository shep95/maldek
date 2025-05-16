import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TbaCopyBox } from "@/components/auth/TbaCopyBox";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Coins, TrendingUp, Info, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { useCoinData } from "@/hooks/useCoinData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Sample stats for holders tab - this would ideally come from API but is static for demo
const holdersData = [
  { rank: 1, address: "AhNfqqgCSKvtUKgwnhxjFNnsyKKH4KtBQ99gvAjmmoon", amount: "2,500,000,000", percentage: "25.00" },
  { rank: 2, address: "9xzV56KPzjqm9s7xLkDeYmkMw1U2dSHDyryJk3cnYaL9", amount: "1,200,000,000", percentage: "12.00" },
  { rank: 3, address: "HM8T9qQ3z5BJ6RXtpjWxZqgVNEzB7g1V9WY4KXMdUb4j", amount: "800,000,000", percentage: "8.00" },
  { rank: 4, address: "5RznAJprJDYKLmg5KMKvh2ZfGJGGbpz4NUNpNnbLF1jK", amount: "650,000,000", percentage: "6.50" },
  { rank: 5, address: "E2jMQZhxNVU6HhoGMY6oFdrx9Jb5yBYAaZ7hp8JhmrkP", amount: "450,000,000", percentage: "4.50" },
];

const BosleyCoin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { coinData, chartData, isLoading, error } = useCoinData();

  const handleRefresh = useCallback(() => {
    window.location.reload();
    toast("Fetching the latest Bosley Coin information");
  }, []);
  
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

  // Format large numbers with commas
  const formatNumber = useCallback((value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
  
  // Setup stats data based on live data
  const statsData = coinData ? [
    { label: "Market Cap", value: formatCurrency(coinData.marketCap) },
    { label: "24h Volume", value: formatCurrency(coinData.volume24h) },
    { label: "Holders", value: coinData.circulatingSupply > 0 ? Math.floor(coinData.circulatingSupply / 1000000).toLocaleString() : "4,234" },
    { label: "Circulating Supply", value: formatNumber(coinData.circulatingSupply) }
  ] : [];

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
          <p className="text-sm sm:text-base text-muted-foreground">Live meme coin analytics from CoinGecko API</p>
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

      <Card className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-accent/10 p-2 sm:p-3 rounded-full">
              <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Contract Address</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Solana Blockchain</p>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <TbaCopyBox />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-background/50 rounded-lg p-3 sm:p-4 border border-border/50 animate-pulse">
                <div className="h-3 sm:h-4 w-16 sm:w-20 bg-muted rounded mb-2"></div>
                <div className="h-4 sm:h-6 w-12 sm:w-16 bg-muted rounded"></div>
              </div>
            ))
          ) : (
            statsData.map((stat, index) => (
              <div key={index} className="bg-background/50 rounded-lg p-3 sm:p-4 border border-border/50">
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-sm sm:text-xl font-bold mt-1 truncate">{stat.value}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 sm:mb-6 bg-transparent p-0 w-full flex flex-wrap justify-start border-b">
          <TabsTrigger 
            value="overview" 
            className="text-xs sm:text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="price" 
            className="text-xs sm:text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
          >
            Price Chart
          </TabsTrigger>
          <TabsTrigger 
            value="holders" 
            className="text-xs sm:text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
          >
            Holders
          </TabsTrigger>
          <TabsTrigger 
            value="about" 
            className="text-xs sm:text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
          >
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <Card className="p-3 sm:p-4 md:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-6">Price History</h3>
            {isLoading ? (
              <div className="h-60 sm:h-80 w-full flex items-center justify-center bg-muted/20 rounded-lg">
                <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <div className="h-60 sm:h-80 w-full">
                <ChartContainer
                  config={{
                    price: {
                      label: "Price",
                      color: "#9b87f5"
                    }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        tickMargin={8}
                        tickFormatter={(value) => {
                          // On smaller screens, show shorter date format
                          if (window.innerWidth < 640) {
                            // Extract just the day from the date string
                            const parts = value.split(' ');
                            return parts.length > 1 ? parts[1] : value;
                          }
                          return value;
                        }}
                      />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        tickFormatter={(value) => `$${value < 0.0001 ? value.toExponential(2) : value.toFixed(6)}`}
                        tick={{ fontSize: 10 }}
                        width={60}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#9b87f5" 
                        strokeWidth={2} 
                        dot={{ fill: "#9b87f5", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                <h3 className="text-lg sm:text-xl font-bold">Key Information</h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Launch Date</span>
                  <span className="text-xs sm:text-sm font-medium">March 15, 2024</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Total Supply</span>
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {coinData ? formatNumber(coinData.totalSupply) : "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Token Type</span>
                  <span className="text-xs sm:text-sm font-medium">SPL Token (Solana)</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Decimals</span>
                  <span className="text-xs sm:text-sm font-medium">9</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                <h3 className="text-lg sm:text-xl font-bold">Trading Activity</h3>
              </div>
              {isLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between border-b pb-2">
                      <div className="h-3 sm:h-4 w-12 sm:w-16 bg-muted rounded"></div>
                      <div className="h-3 sm:h-4 w-16 sm:w-20 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">24h High</span>
                    <span className="text-xs sm:text-sm font-medium text-green-500">
                      {coinData ? formatSmallPrice(coinData.high24h) : "--"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">24h Low</span>
                    <span className="text-xs sm:text-sm font-medium text-red-500">
                      {coinData ? formatSmallPrice(coinData.low24h) : "--"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">7d Change</span>
                    <span className="text-xs sm:text-sm font-medium">
                      {coinData && formatPercentChange(coinData.priceChange7d)}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">30d Change</span>
                    <span className="text-xs sm:text-sm font-medium">
                      {coinData && formatPercentChange(coinData.priceChange30d)}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="price">
          <Card className="p-3 sm:p-4 md:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-6">Price Chart</h3>
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
                        tick={{ fontSize: 10 }}
                        tickMargin={8}
                        tickFormatter={(value) => {
                          // On smaller screens, show shorter date format
                          if (window.innerWidth < 640) {
                            // Extract just the day from the date string
                            const parts = value.split(' ');
                            return parts.length > 1 ? parts[1] : value;
                          }
                          return value;
                        }}
                      />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        tickFormatter={(value) => `$${value.toFixed(8)}`}
                        tick={{ fontSize: 10 }}
                        width={60}
                      />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', marginTop: '10px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#9b87f5" 
                        strokeWidth={2} 
                        dot={{ fill: "#9b87f5", r: 2 }} 
                        activeDot={{ r: 4 }}
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
        </TabsContent>

        <TabsContent value="holders">
          <Card className="p-3 sm:p-4 md:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-6">Top Holders</h3>
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="min-w-[600px] sm:min-w-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-xs sm:text-sm">Rank</th>
                      <th className="text-left py-2 px-2 text-xs sm:text-sm">Address</th>
                      <th className="text-right py-2 px-2 text-xs sm:text-sm">Amount</th>
                      <th className="text-right py-2 px-2 text-xs sm:text-sm">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdersData.map((holder, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 text-xs sm:text-sm">{holder.rank}</td>
                        <td className="py-3 px-2 font-mono text-xs break-all">
                          {holder.address}
                        </td>
                        <td className="py-3 px-2 text-right text-xs sm:text-sm">
                          {holder.amount}
                        </td>
                        <td className="py-3 px-2 text-right text-xs sm:text-sm">
                          {holder.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              <h3 className="text-lg sm:text-xl font-bold">About Bosley Coin</h3>
            </div>
            <div className="prose prose-invert max-w-none prose-sm sm:prose-base">
              <p>
                Bosley Coin is a community-driven meme coin launched on the Solana blockchain.
                Created with a focus on community engagement and fun, Bosley Coin has quickly
                gained popularity in the crypto space.
              </p>
              <p className="mt-2 sm:mt-4">
                The token features low transaction fees, fast settlement times, and a vibrant
                community of holders and supporters. The development team continues to work on
                expanding the Bosley ecosystem with new features and partnerships.
              </p>
              <h4 className="text-base sm:text-lg font-bold mt-4 sm:mt-6 mb-2">Tokenomics</h4>
              <ul className="list-disc pl-5">
                <li>Total Supply: {coinData ? formatNumber(coinData.totalSupply) : "10,000,000,000"} BOSLEY</li>
                <li>Circulating Supply: {coinData ? formatNumber(coinData.circulatingSupply) : "5,100,000,000"} BOSLEY</li>
                <li>Marketing Allocation: 10%</li>
                <li>Development Fund: 15%</li>
                <li>Community Rewards: 25%</li>
                <li>Liquidity Pool: 50%</li>
              </ul>
              <h4 className="text-base sm:text-lg font-bold mt-4 sm:mt-6 mb-2">Links</h4>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <a href="#" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-accent text-white rounded-md hover:bg-accent/80">Website</a>
                <a href="#" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-accent text-white rounded-md hover:bg-accent/80">Twitter</a>
                <a href="#" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-accent text-white rounded-md hover:bg-accent/80">Telegram</a>
                <a href="#" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-accent text-white rounded-md hover:bg-accent/80">Discord</a>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BosleyCoin;
