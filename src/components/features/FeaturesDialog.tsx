
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Shield, Lock, MessageSquare, Info, FolderLock, DollarSign } from "lucide-react";

interface FeaturesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeaturesDialog = ({ isOpen, onClose }: FeaturesDialogProps) => {
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
      description: "Protect your files and messages from anyone with our secure storage system"
    },
    {
      icon: DollarSign,
      title: "Affordable Premium Features",
      description: "Free to use app with affordable subscription options - check them out!"
    },
    {
      icon: Info,
      title: "Transparent Platform",
      description: "Say what you want when-ever you want, with complete transparency"
    },
    {
      icon: Shield,
      title: "User-Centric Design",
      description: "Built for users who value privacy and freedom of expression"
    },
    {
      icon: Lock,
      title: "No Tracking",
      description: "We respect your privacy - no data collection or tracking"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background/60 backdrop-blur-xl border-border/50">
        <div className="space-y-6 p-4">
          <h2 className="text-2xl font-bold text-center mb-6">Our Features</h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50 hover:bg-background/50 transition-colors"
              >
                <feature.icon className="w-5 h-5 text-accent shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
