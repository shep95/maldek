
import { useState, useEffect } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";

const COLORS = ['#F97316', '#22C55E', '#3B82F6'];

export const PlatformUsageChart = () => {
  const isMobile = useIsMobile();
  const [data, setData] = useState([
    { name: 'App', value: 55 },
    { name: 'Web', value: 30 },
    { name: 'API', value: 15 },
  ]);

  // Simulate data updates for live effect
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
        <div className="bg-black/90 border border-accent/20 p-2 md:p-3 rounded-lg shadow-xl">
          <p className="text-xs md:text-sm font-medium text-accent">{`${payload[0].name}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[220px] md:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? 40 : 60}
            outerRadius={isMobile ? 65 : 90}
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
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-2 md:mt-4">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs md:text-sm text-gray-300">{entry.name}: {entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
