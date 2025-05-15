
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TbaCopyBox } from "@/components/auth/TbaCopyBox";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Coins, TrendingUp, Info } from "lucide-react";

// Sample coin data - in a real app this would come from an API
const sampleData = [
  { date: "Jan", price: 0.00012, volume: 12000 },
  { date: "Feb", price: 0.00018, volume: 18000 },
  { date: "Mar", price: 0.00015, volume: 15000 },
  { date: "Apr", price: 0.00022, volume: 22000 },
  { date: "May", price: 0.00028, volume: 28000 },
  { date: "Jun", price: 0.00024, volume: 24000 },
  { date: "Jul", price: 0.00032, volume: 32000 }
];

// Sample stats
const statsData = [
  { label: "Market Cap", value: "$1.2M" },
  { label: "24h Volume", value: "$145K" },
  { label: "Holders", value: "4,234" },
  { label: "Circulating Supply", value: "5.1B" }
];

const BosleyCoin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="container py-8 mx-auto max-w-7xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Bosley Coin</h1>
          <p className="text-muted-foreground">Meme coin analytics and tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xl font-mono font-semibold text-accent">$0.000323</span>
          <span className="px-2 py-1 text-sm font-medium text-green-500 bg-green-500/10 rounded-md flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" /> +12.4%
          </span>
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
          {statsData.map((stat, index) => (
            <div key={index} className="bg-background/50 rounded-lg p-4 border border-border/50">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
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
            <div className="h-80 w-full">
              <ChartContainer
                config={{
                  price: {
                    label: "Price",
                    color: "#9b87f5"
                  }
                }}
              >
                <LineChart data={sampleData}>
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
                  <span className="font-medium">10,000,000,000</span>
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
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">24h High</span>
                  <span className="font-medium text-green-500">$0.000341</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">24h Low</span>
                  <span className="font-medium text-red-500">$0.000298</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">7d Change</span>
                  <span className="font-medium text-green-500">+18.2%</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground">30d Change</span>
                  <span className="font-medium text-green-500">+42.7%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="price">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Price Chart</h3>
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
                <LineChart data={sampleData}>
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
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-4 px-2">{index + 1}</td>
                      <td className="py-4 px-2 font-mono text-sm">
                        {index === 0 
                          ? "AhNfqqgCSKvtUKgwnhxjFNnsyKKH4KtBQ99gvAjmmoon" 
                          : `${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 10)}`
                        }
                      </td>
                      <td className="py-4 px-2 text-right">
                        {(1000000000 * Math.random()).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </td>
                      <td className="py-4 px-2 text-right">
                        {(100 * Math.random() / (index + 2)).toFixed(2)}%
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
                <li>Total Supply: 10,000,000,000 BOSLEY</li>
                <li>Circulating Supply: 5,100,000,000 BOSLEY</li>
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
