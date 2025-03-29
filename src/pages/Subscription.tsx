
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Coins, Users, Star, Image, FolderLock, Crown, Play, BarChart2, BadgeCheck, Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Subscription = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("monthly");
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="mb-12 space-y-3">
          <h2 className="text-center text-3xl font-semibold leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
            All Features Are Now Free!
          </h2>
          <p className="text-center text-base text-muted-foreground md:text-lg">
            We've made all premium features available at no cost
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-accent/10 rounded-lg p-8 text-center mb-12">
          <h3 className="text-2xl font-bold mb-4">Why We Made Everything Free</h3>
          <p className="text-muted-foreground mb-6">
            We believe in building community first. By providing all features for free, 
            we're focusing on growing our user base and creating the best possible experience.
            If you'd still like to support our platform development, you can subscribe below.
          </p>
        </div>
        
        <h3 className="text-2xl font-bold text-center mb-8">Support Our Development</h3>
        
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="monthly" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8 mx-auto max-w-md">
              <TabsTrigger value="monthly" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Monthly
              </TabsTrigger>
              <TabsTrigger value="yearly" className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" />
                Yearly
              </TabsTrigger>
              <TabsTrigger value="exclusive" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Exclusive
              </TabsTrigger>
            </TabsList>
            
            {/* Monthly Tab Content */}
            <TabsContent value="monthly" className="w-full">
              <div className="max-w-lg mx-auto">
                <Card className="overflow-hidden border-primary/20 transition-all duration-300 hover:shadow-md relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
                  <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-primary" />
                      Basic Subscription
                    </CardTitle>
                    <CardDescription>Support our growth</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold mb-1">$3.50</p>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm">Join our community</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-primary" />
                          <span className="text-sm">Help fund and support development</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-primary" />
                          <span className="text-sm">Early access to future features</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-primary" />
                          <span className="text-sm">Animated profile picture & GIF uploads</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FolderLock className="h-4 w-4 text-primary" />
                          <span className="text-sm">Safety folder</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-primary" />
                          <span className="text-sm">White crown badge</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4 text-primary" />
                          <span className="text-sm">Start and host spaces</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart2 className="h-4 w-4 text-primary" />
                          <span className="text-sm">Access to modern analytics</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center pb-6">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => window.open('https://buy.stripe.com/9AQ9D74yBg6UdfW3cf', '_blank')}
                    >
                      Subscribe Monthly
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Yearly Tab Content */}
            <TabsContent value="yearly" className="w-full">
              <div className="max-w-lg mx-auto">
                <Card className="overflow-hidden border-primary/20 transition-all duration-300 hover:shadow-md relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
                  <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-primary" />
                      Annual Subscription
                    </CardTitle>
                    <CardDescription>Save with yearly billing</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold mb-1">$33.11</p>
                        <p className="text-sm text-muted-foreground">per year</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm">Join our community</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-primary" />
                          <span className="text-sm">Help fund and support development</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-primary" />
                          <span className="text-sm">Early access to future features</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-primary" />
                          <span className="text-sm">Animated profile picture & GIF uploads</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FolderLock className="h-4 w-4 text-primary" />
                          <span className="text-sm">Safety folder</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-primary" />
                          <span className="text-sm">White crown badge</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4 text-primary" />
                          <span className="text-sm">Start and host spaces</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart2 className="h-4 w-4 text-primary" />
                          <span className="text-sm">Access to modern analytics</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center pb-6">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => window.open('https://buy.stripe.com/6oE02x0il4ocfo45kq', '_blank')}
                    >
                      Subscribe Yearly
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Exclusive Tab Content */}
            <TabsContent value="exclusive" className="w-full">
              <div className="max-w-lg mx-auto">
                <Card className="overflow-hidden border-accent/30 transition-all duration-300 hover:shadow-md relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent/10 pointer-events-none" />
                  <CardHeader className="bg-accent/5 border-b border-accent/10">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-accent" />
                      VIP Subscription
                    </CardTitle>
                    <CardDescription>Exclusive partnership opportunity</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold mb-1">$8,000</p>
                        <p className="text-sm text-muted-foreground">per year</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-accent" />
                          <span className="text-sm">Direct access to founders via Telegram</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-accent" />
                          <span className="text-sm">Strategic partnership opportunity</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-accent" />
                          <span className="text-sm">Influence platform direction</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center pb-6">
                    <Button 
                      className="w-full bg-accent hover:bg-accent/90"
                      onClick={() => window.open('https://buy.stripe.com/cN2dTne9b07Wgs8bIM', '_blank')}
                    >
                      Subscribe Yearly
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
