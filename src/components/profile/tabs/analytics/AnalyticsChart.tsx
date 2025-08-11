
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  AreaChart,
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
  Bar
} from 'recharts';
import { Eye, ThumbsUp, MessageSquare, Clock } from "lucide-react";

interface ChartData {
  date: string;
  views: number;
  likes: number;
  comments: number;
  watchTime: number;
}

interface AnalyticsChartProps {
  data: ChartData[];
}

type ChartType = 'area' | 'line';

export const AnalyticsChart = ({ data }: AnalyticsChartProps) => {
  const [chartType, setChartType] = useState<ChartType>('area');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-accent/20 p-4 rounded-lg shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`entry-${index}`} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300">{entry.name}:</span>
              <span className="text-white font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="views" 
              name="Views" 
              stroke="#F97316" 
              fill="url(#colorViews)" 
              strokeWidth={2} 
              activeDot={{ r: 6, fill: "#F97316", stroke: "#fff" }} 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="likes" 
              name="Likes" 
              stroke="#22C55E" 
              fill="url(#colorLikes)" 
              strokeWidth={2} 
              activeDot={{ r: 6, fill: "#22C55E", stroke: "#fff" }} 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="comments" 
              name="Comments" 
              stroke="#3B82F6" 
              fill="url(#colorComments)" 
              strokeWidth={2} 
              activeDot={{ r: 6, fill: "#3B82F6", stroke: "#fff" }} 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="watchTime" 
              name="Watch Time (min)" 
              stroke="#A855F7" 
              fill="url(#colorWatchTime)" 
              strokeWidth={2} 
              activeDot={{ r: 6, fill: "#A855F7", stroke: "#fff" }} 
              animationDuration={1500}
            />
          </AreaChart>
        );

      case 'line':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="views" 
              name="Views" 
              stroke="#F97316" 
              strokeWidth={3}
              dot={{ stroke: '#F97316', strokeWidth: 2, r: 4, fill: '#000' }}
              activeDot={{ r: 8, stroke: '#F97316', strokeWidth: 2, fill: '#000' }}
              animationDuration={1500}
            />
            <Bar 
              dataKey="likes" 
              name="Likes" 
              fill="#22C55E" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Bar 
              dataKey="comments" 
              name="Comments" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500} 
            />
            <Line 
              type="monotone" 
              dataKey="watchTime" 
              name="Watch Time (min)" 
              stroke="#A855F7" 
              strokeWidth={3}
              dot={{ stroke: '#A855F7', strokeWidth: 2, r: 4, fill: '#000' }}
              activeDot={{ r: 8, stroke: '#A855F7', strokeWidth: 2, fill: '#000' }}
              animationDuration={1500}
            />
          </ComposedChart>
        );
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === 'area' 
                ? 'bg-accent text-white' 
                : 'text-gray-400 hover:text-white bg-black/30'
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === 'line' 
                ? 'bg-accent text-white' 
                : 'text-gray-400 hover:text-white bg-black/30'
            }`}
          >
            Combined
          </button>
        </div>
      </div>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Eye className="w-4 h-4 text-[#F97316]" />
          <span>Views</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <ThumbsUp className="w-4 h-4 text-[#22C55E]" />
          <span>Likes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
          <span>Comments</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4 text-[#A855F7]" />
          <span>Watch Time</span>
        </div>
      </div>
    </>
  );
};
