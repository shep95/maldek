import { Home, Users, Bell, Mail, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const navItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Users, label: "Network" },
    { icon: Bell, label: "Notifications" },
    { icon: Mail, label: "Messages" },
    { icon: User, label: "Profile" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Floating Sidebar */}
      <div className="fixed left-0 h-screen p-4 flex items-center animate-slide-in">
        <Card className="h-[90vh] w-64 flex flex-col justify-between border-muted bg-card/50 backdrop-blur-sm">
          <div className="p-4">
            <h2 className="text-2xl font-bold text-accent mb-8">Social</h2>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 hover:bg-accent hover:text-white transition-all",
                    item.active && "bg-accent/10 text-accent"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold mb-8">Home</h1>
          {/* Content placeholder */}
          <Card className="border border-muted bg-card/50 backdrop-blur-sm p-6">
            <p className="text-muted-foreground">Your feed will appear here...</p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;