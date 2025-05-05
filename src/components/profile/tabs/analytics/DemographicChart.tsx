
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export const DemographicChart = () => {
  const [ageData, setAgeData] = useState([
    { name: '18-24', value: 28 },
    { name: '25-34', value: 42 },
    { name: '35-44', value: 19 },
    { name: '45+', value: 11 },
  ]);
  
  const [regionData, setRegionData] = useState([
    { name: 'North America', value: 35 },
    { name: 'Europe', value: 30 },
    { name: 'Asia', value: 25 },
    { name: 'Other', value: 10 },
  ]);
  
  const [deviceData, setDeviceData] = useState([
    { name: 'Mobile', value: 65 },
    { name: 'Desktop', value: 25 },
    { name: 'Tablet', value: 10 },
  ]);

  // Simulate data changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly adjust values
      setAgeData(prev => prev.map(item => ({
        ...item,
        value: Math.max(5, Math.min(50, item.value + Math.floor(Math.random() * 6 - 3)))
      })));
      
      setRegionData(prev => prev.map(item => ({
        ...item,
        value: Math.max(5, Math.min(45, item.value + Math.floor(Math.random() * 6 - 3)))
      })));
      
      setDeviceData(prev => prev.map(item => ({
        ...item,
        value: Math.max(5, Math.min(70, item.value + Math.floor(Math.random() * 6 - 3)))
      })));
    }, 7000);
    
    return () => clearInterval(interval);
  }, []);

  const [activeTab, setActiveTab] = useState('age');
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-accent/20 p-3 rounded-lg shadow-xl">
          <p className="text-sm font-medium">{`${label}: ${payload[0].value}%`}</p>
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
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#888' }}
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
    <div className="space-y-4">
      <div className="flex space-x-2 bg-black/30 rounded-lg p-1">
        <button 
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'age' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('age')}
        >
          Age Groups
        </button>
        <button 
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'region' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('region')}
        >
          Top Regions
        </button>
        <button 
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'device' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('device')}
        >
          Device Type
        </button>
      </div>
      
      <div className="h-[220px]">
        {renderChart()}
      </div>
    </div>
  );
};
