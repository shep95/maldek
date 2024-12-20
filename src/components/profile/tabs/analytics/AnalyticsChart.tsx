import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
  Line
} from 'recharts';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, ThumbsUp, MessageSquare, Clock, BarChart2, LineChart, Activity } from "lucide-react";

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

type ChartType = 'bar' | 'line' | 'composed';

export const AnalyticsChart = ({ data }: AnalyticsChartProps) => {
  const [chartType, setChartType] = useState<ChartType>('composed');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-accent/20 p-4 rounded-lg shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
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
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="views" name="Views" fill="#F97316" />
            <Bar dataKey="likes" name="Likes" fill="#22C55E" />
            <Bar dataKey="comments" name="Comments" fill="#3B82F6" />
            <Bar dataKey="watchTime" name="Watch Time (min)" fill="#A855F7" />
          </BarChart>
        );

      case 'line':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="views" name="Views" stroke="#F97316" dot={{ fill: '#F97316' }} />
            <Line type="monotone" dataKey="likes" name="Likes" stroke="#22C55E" dot={{ fill: '#22C55E' }} />
            <Line type="monotone" dataKey="comments" name="Comments" stroke="#3B82F6" dot={{ fill: '#3B82F6' }} />
            <Line type="monotone" dataKey="watchTime" name="Watch Time (min)" stroke="#A855F7" dot={{ fill: '#A855F7' }} />
          </ComposedChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="views" name="Views" fill="#F97316" fillOpacity={0.1} stroke="#F97316" />
            <Bar dataKey="likes" name="Likes" fill="#22C55E" />
            <Bar dataKey="comments" name="Comments" fill="#3B82F6" />
            <Line type="monotone" dataKey="watchTime" name="Watch Time (min)" stroke="#A855F7" dot={{ fill: '#A855F7' }} />
          </ComposedChart>
        );
    }
  };

  return (
    <Card className="p-6 bg-black/20 backdrop-blur border-accent/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">7-Day Performance</h3>
        <div className="flex gap-2">
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
            className="gap-2"
          >
            <BarChart2 className="w-4 h-4" />
            Bar
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
            className="gap-2"
          >
            <LineChart className="w-4 h-4" />
            Line
          </Button>
          <Button
            variant={chartType === 'composed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('composed')}
            className="gap-2"
          >
            <Activity className="w-4 h-4" />
            Mixed
          </Button>
        </div>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-6">
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
    </Card>
  );
};