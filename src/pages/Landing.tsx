import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";

const Landing = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/lovable-uploads/fe4df60c-d384-49bb-915f-904f54fcc3f6.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.8)'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Bosley</div>
          <NavigationMenu>
            <NavigationMenuList className="hidden md:flex space-x-8">
              <NavigationMenuItem>
                <NavigationMenuLink className="text-white hover:text-gray-200">
                  What we do
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-white hover:text-gray-200">
                  Products
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-white hover:text-gray-200">
                  About us
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-white hover:text-gray-200">
                  Resources
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Link to="/auth">
            <Button variant="outline" className="bg-black/20 text-white border-white hover:bg-black/40">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-20 md:pt-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="block">Seamlessly </span>
            <span className="italic">optimize</span>
            <span className="block">your social presence with </span>
            <span className="text-accent">AI</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            We use AI for everything and integrated it seamlessly into
            your social media presence to boost your ideas and help you grow.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg">
                Let's do it!
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20 px-8 py-6 text-lg">
                What we do
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;