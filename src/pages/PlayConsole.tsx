
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Activity, Users, Tags } from "lucide-react";

const PlayConsole = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-card/50 backdrop-blur-xl">
          <div className="p-4 border-b border-border">
            <img 
              src="/lovable-uploads/ec123e4b-0b80-4a83-94e9-d7aa74d0923e.png" 
              alt="Google Play Console"
              className="h-8"
            />
          </div>
          
          <nav className="space-y-1 p-2">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Upload className="h-5 w-5" />
              Test and release
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Activity className="h-5 w-5" />
              Monitor and improve
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Users className="h-5 w-5" />
              Grow users
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-blue-500">
              <Tags className="h-5 w-5" />
              Monetize with Play
            </Button>

            {/* Submenu */}
            <div className="pl-4 space-y-1">
              <Button variant="ghost" className="w-full justify-start text-sm">Products</Button>
              <Button variant="ghost" className="w-full justify-start text-sm">App pricing</Button>
              <Button variant="ghost" className="w-full justify-start text-sm text-blue-500">In-app products</Button>
              <Button variant="ghost" className="w-full justify-start text-sm">Subscriptions</Button>
              <Button variant="ghost" className="w-full justify-start text-sm">Price experiments</Button>
              <Button variant="ghost" className="w-full justify-start text-sm">Purchase recommendations</Button>
              <Button variant="ghost" className="w-full justify-start text-sm">Promo codes</Button>
              <Button variant="ghost" className="w-full justify-start text-sm">Financial reports</Button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h1 className="text-4xl font-normal text-gray-800 mb-4">In-app products</h1>
          <p className="text-lg text-gray-600 mb-12">
            Offer products for sale in your app for a one-off charge, like extra lives, or access to premium content
          </p>

          <Card className="p-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-normal text-gray-800 mb-4">Your app doesn't have any in-app products yet</h2>
              <p className="text-gray-600 mb-6">
                To add in-app products, you need to add the BILLING permission to your APK
              </p>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                Upload a new APK
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlayConsole;
