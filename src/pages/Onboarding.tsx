import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Onboarding = () => {
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile setup:", { bio, image });
    // TODO: Implement profile setup logic
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-accent">Complete Your Profile</h2>
          <p className="mt-2 text-sm text-muted-foreground">Let's make your profile stand out</p>
        </div>

        <Card className="border border-muted bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Profile Setup</CardTitle>
              <CardDescription>Add a photo and bio to help people know you better</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Profile Picture</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Bio</label>
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-muted/50 min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                Complete Setup
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;