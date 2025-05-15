import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

// Sample stats for holders tab
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
  const { toast } = useToast();

  const handleRefresh = () => {
    window.location.reload();
    toast("Refreshing data, fetching the latest coin information");
  };

  // Format number to display as currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  // Format large numbers with commas
  const formatNumber = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format percentage change with color and arrow
  const formatPercentChange = (value: number) => {
    const color = value >= 0 ? "text-green-500" : "text-red-500";
    const Icon = value >= 0 ? ArrowUp : ArrowDown;
    return (
      <span className={`flex items-center gap-1 ${color}`}>
        <Icon className="w-4 h-4" />
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };
  
  // Setup stats data based on live data
  const statsData = coinData ? [
    { label: "Market Cap", value: formatCurrency(coinData.marketCap) },
    { label: "24h Volume", value: formatCurrency(coinData.volume24h) },
    { label: "Holders", value: "4,234" }, // Placeholder - likely would need a separate API for this
    { label: "Circulating Supply", value: formatNumber(coinData.circulatingSupply) }
  ] : [];

  return (
    <div className="container py-8 mx-auto max-w-7xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Bosley Coin</h1>
          <p className="text-muted-foreground">Meme coin analytics and tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <span className="px-2 py-1 text-sm font-medium bg-muted rounded-md">Loading...</span>
          ) : (
            <>
              <span className="text-xl font-mono font-semibold text-accent">
                ${coinData?.price.toFixed(6)}
              </span>
              <span className={`px-2 py-1 text-sm font-medium ${coinData && coinData.priceChange24h >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} rounded-md flex items-center`}>
                <TrendingUp className="w-4 h-4 mr-1" /> 
                {coinData ? `${coinData.priceChange24h >= 0 ? '+' : ''}${coinData.priceChange24h.toFixed(1)}%` : '--'}
              </span>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-3 rounded-full">
              <Coins className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Contract Address</h2>
              <p className="text-sm text-muted-foreground">Solana Blockchain</p>
            </div>
          </div>
          <TbaCopyBox />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-background/50 rounded-lg p-4 border border-border/50 animate-pulse">
                <div className="h-4 w-20 bg-muted rounded mb-2"></div>
                <div className="h-6 w-16 bg-muted rounded"></div>
              </div>
            ))
          ) : (
            statsData.map((stat, index) => (
              <div key={index} className="bg-background/50 rounded-lg p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-transparent p-0 w-full flex flex-wrap justify-start border-b">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="price" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
          >
            Price Chart
          </TabsTrigger>
          <TabsTrigger 
            value="holders" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
          >
            Holders
          </TabsTrigger>
          <TabsTrigger 
            value="about" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
          >
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Price History</h3>
            {isLoading ? (
              <div className="h-80 w-full flex items-center justify-center bg-muted/20 rounded-lg">
                <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <div className="h-80 w-full">
                <ChartContainer
                  config={{
                    price: {
                      label: "Price",
                      color: "#9b87f5"
                    }
                  }}
                >
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      tickFormatter={(value) => `$${value.toFixed(5)}`} 
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#9b87f5" 
                      strokeWidth={2} 
                      dot={{ fill: "#9b87f5" }} 
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            )}
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Info className="h-5 w-5 text-accent" />
                <h3 className="text-xl font-bold">Key Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Launch Date</span>
                  <span className="font-medium">March 15, 2024</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total Supply</span>
                  <span className="font-medium">
                    {coinData ? formatNumber(coinData.totalSupply) : "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Token Type</span>
                  <span className="font-medium">SPL Token (Solana)</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground">Decimals</span>
                  <span className="font-medium">9</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h3 className="text-xl font-bold">Trading Activity</h3>
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between border-b pb-2">
                      <div className="h-4 w-16 bg-muted rounded"></div>
                      <div className="h-4 w-20 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">24h High</span>
                    <span className="font-medium text-green-500">
                      ${coinData?.high24h.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">24h Low</span>
                    <span className="font-medium text-red-500">
                      ${coinData?.low24h.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">7d Change</span>
                    <span className="font-medium">
                      {coinData && formatPercentChange(coinData.priceChange7d)}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-muted-foreground">30d Change</span>
                    <span className="font-medium">
                      {coinData && formatPercentChange(coinData.priceChange30d)}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="price">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Price Chart</h3>
            {isLoading ? (
              <div className="h-[500px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
                <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <div className="h-[500px] w-full">
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
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      tickFormatter={(value) => `$${value.toFixed(5)}`} 
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#9b87f5" 
                      strokeWidth={2} 
                      dot={{ fill: "#9b87f5" }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#7E69AB" 
                      strokeWidth={1.5} 
                      dot={{ fill: "#7E69AB" }} 
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="holders">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Top Holders</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-2">Rank</th>
                    <th className="text-left py-4 px-2">Address</th>
                    <th className="text-right py-4 px-2">Amount</th>
                    <th className="text-right py-4 px-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {holdersData.map((holder, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-4 px-2">{holder.rank}</td>
                      <td className="py-4 px-2 font-mono text-sm">
                        {holder.address}
                      </td>
                      <td className="py-4 px-2 text-right">
                        {holder.amount}
                      </td>
                      <td className="py-4 px-2 text-right">
                        {holder.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Info className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-bold">About Bosley Coin</h3>
            </div>
            <div className="prose prose-invert max-w-none">
              <p>
                Bosley Coin is a community-driven meme coin launched on the Solana blockchain.
                Created with a focus on community engagement and fun, Bosley Coin has quickly
                gained popularity in the crypto space.
              </p>
              <p className="mt-4">
                The token features low transaction fees, fast settlement times, and a vibrant
                community of holders and supporters. The development team continues to work on
                expanding the Bosley ecosystem with new features and partnerships.
              </p>
              <h4 className="text-lg font-bold mt-6 mb-2">Tokenomics</h4>
              <ul className="list-disc pl-5">
                <li>Total Supply: {coinData ? formatNumber(coinData.totalSupply) : "10,000,000,000"} BOSLEY</li>
                <li>Circulating Supply: {coinData ? formatNumber(coinData.circulatingSupply) : "5,100,000,000"} BOSLEY</li>
                <li>Marketing Allocation: 10%</li>
                <li>Development Fund: 15%</li>
                <li>Community Rewards: 25%</li>
                <li>Liquidity Pool: 50%</li>
              </ul>
              <h4 className="text-lg font-bold mt-6 mb-2">Links</h4>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/80">Website</a>
                <a href="#" className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/80">Twitter</a>
                <a href="#" className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/80">Telegram</a>
                <a href="#" className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/80">Discord</a>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BosleyCoin;
