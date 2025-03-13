
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Coins, Users, Star } from "lucide-react";

const Invest = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="mb-12 space-y-3">
          <h2 className="text-center text-3xl font-semibold leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
            Invest in Our Platform
          </h2>
          <p className="text-center text-base text-muted-foreground md:text-lg">
            Help us build the future of social media
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basic Investment Option */}
          <Card className="overflow-hidden border-primary/20 transition-all duration-300 hover:shadow-md relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Basic Investment
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
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => window.open('https://buy.stripe.com/9AQ9D74yBg6UdfW3cf', '_blank')}
              >
                Invest Monthly
              </Button>
            </CardFooter>
          </Card>
          
          {/* VIP Investment Option */}
          <Card className="overflow-hidden border-accent/30 transition-all duration-300 hover:shadow-md relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent/10 pointer-events-none" />
            <CardHeader className="bg-accent/5 border-b border-accent/10">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" />
                VIP Investment
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
                Invest Yearly
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Invest;
