import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export const AnalyticsCard = ({ title, value, icon: Icon }: AnalyticsCardProps) => {
  return (
    <Card className="p-4 bg-black/20 backdrop-blur border-accent/20">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-accent">{value}</p>
    </Card>
  );
};