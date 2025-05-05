
import { useState, useEffect } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#F97316', '#22C55E', '#3B82F6'];

export const PlatformUsageChart = () => {
  const [data, setData] = useState([
    { name: 'App', value: 55 },
    { name: 'Web', value: 30 },
    { name: 'API', value: 15 },
  ]);

  // Simulate data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData([
        { name: 'App', value: 55 + Math.floor(Math.random() * 10 - 5) },
        { name: 'Web', value: 30 + Math.floor(Math.random() * 8 - 4) },
        { name: 'API', value: 15 + Math.floor(Math.random() * 6 - 3) },
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-accent/20 p-3 rounded-lg shadow-xl">
          <p className="text-sm font-medium text-accent">{`${payload[0].name}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1000}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-4">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-300">{entry.name}: {entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
