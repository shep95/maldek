import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export const AnalyticsChart = ({ data }: AnalyticsChartProps) => {
  return (
    <Card className="p-6 bg-black/20 backdrop-blur border-accent/20">
      <h3 className="text-xl font-semibold mb-4">7-Day Performance</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid #F97316',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="views" name="Views" fill="#F97316" />
            <Bar dataKey="likes" name="Likes" fill="#22C55E" />
            <Bar dataKey="comments" name="Comments" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};