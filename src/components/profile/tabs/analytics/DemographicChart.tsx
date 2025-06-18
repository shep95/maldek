
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";

// Static demographic data based on typical social media demographics
const ageData = [
  { name: '18-24', value: 32 },
  { name: '25-34', value: 41 },
  { name: '35-44', value: 18 },
  { name: '45+', value: 9 },
];

const regionData = [
  { name: 'N.America', value: 38 },
  { name: 'Europe', value: 29 },
  { name: 'Asia', value: 23 },
  { name: 'Other', value: 10 },
];

const deviceData = [
  { name: 'Mobile', value: 68 },
  { name: 'Desktop', value: 24 },
  { name: 'Tablet', value: 8 },
];

export const DemographicChart = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('age');
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-accent/20 p-2 rounded-lg shadow-xl">
          <p className="text-xs md:text-sm font-medium">{`${label}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const data = 
      activeTab === 'age' ? ageData : 
      activeTab === 'region' ? regionData : 
      deviceData;
    
    return (
      <ResponsiveContainer width="100%" height={isMobile ? 170 : 220}>
        <BarChart data={data} barGap={4}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: isMobile ? 10 : 12, fill: '#888' }}
            axisLine={{ stroke: '#333' }}
            tickLine={{ stroke: '#333' }}
          />
          <YAxis 
            hide 
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="#F97316" 
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
            className="drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex space-x-1 md:space-x-2 bg-black/30 rounded-lg p-1">
        <button 
          className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${
            activeTab === 'age' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('age')}
        >
          Age Groups
        </button>
        <button 
          className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${
            activeTab === 'region' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('region')}
        >
          Regions
        </button>
        <button 
          className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${
            activeTab === 'device' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('device')}
        >
          Devices
        </button>
      </div>
      
      <div className="h-[170px] md:h-[220px]">
        {renderChart()}
      </div>
    </div>
  );
};
