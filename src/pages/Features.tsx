
import { Shield, Lock, MessageSquare, Info, FolderLock, DollarSign, Music, Languages, Binary, Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Encrypted Database",
      description: "Your data is protected with top-tier encryption"
    },
    {
      icon: MessageSquare,
      title: "Freedom of Speech",
      description: "No shadow banning & bans - express yourself freely"
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "We never collect your data or ask for device permissions to gather information"
    },
    {
      icon: FolderLock,
      title: "Free Safety Folder",
      description: "Protect your files and messages from anyone with our secure storage system in profile tab"
    },
    {
      icon: DollarSign,
      title: "Affordable Premium Features",
      description: "Free to use app with affordable subscription options - check them out!"
    },
    {
      icon: Binary,
      title: "Unbiased Algorithm",
      description: "Our platform uses a neutral algorithm without any hidden biases or preferences"
    },
    {
      icon: Music,
      title: "Custom Background Music",
      description: "Play your own playlist in the background while scrolling through posts"
    },
    {
      icon: Languages,
      title: "Free Post Translation",
      description: "Auto translate any user's post to your preferred language at no cost"
    },
    {
      icon: Info,
      title: "Transparent Platform",
      description: "Say what you want when-ever you want, with complete transparency"
    },
    {
      icon: Shield,
      title: "Modern UI Design",
      description: "Built with the latest design trends for a sleek and intuitive experience"
    },
    {
      icon: Lock,
      title: "No Tracking",
      description: "We respect your privacy - no data collection or tracking"
    },
    {
      icon: Database,
      title: "No Data Selling",
      description: "Your data is yours - we never sell it to third parties"
    }
  ];

  return (
    <div className="container max-w-4xl px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Our Features</h1>
        <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
          Go Back
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group flex items-start gap-3 p-4 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50 hover:bg-background/50 transition-colors"
          >
            <div className="relative">
              <feature.icon className={cn(
                "w-5 h-5 text-accent shrink-0 mt-1",
                "transition-all duration-300 ease-out",
                "group-hover:scale-110 group-hover:rotate-[360deg]",
                "after:content-[''] after:absolute after:inset-0",
                "after:bg-accent/20 after:rounded-full after:scale-0",
                "group-hover:after:scale-150 after:transition-transform",
                "group-hover:text-accent-foreground"
              )} />
              <div className="absolute inset-0 bg-accent/10 rounded-full scale-0 group-hover:scale-150 transition-transform" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
