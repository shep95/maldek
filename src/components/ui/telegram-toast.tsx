
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TelegramToastProps {
  title: string;
  message: string;
  avatar?: string;
}

export const showTelegramToast = ({ title, message, avatar }: TelegramToastProps) => {
  toast.custom((id) => (
    <div className={`
      animate-telegramPopoutIn
      group
      max-w-md w-full bg-black/90 backdrop-blur-xl
      border border-white/20
      p-4 rounded-2xl
      flex items-start gap-3
      opacity-100
      transition-all duration-300
      shadow-[0_8px_16px_-6px_rgba(0,0,0,0.5)]
      hover:border-white/30
    `}>
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={avatar} />
        <AvatarFallback>{title[0]?.toUpperCase() || "?"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white/90 mb-1">{title}</p>
        <p className="text-sm text-white/70 line-clamp-2">{message}</p>
      </div>
    </div>
  ), {
    duration: 4000,
    position: "bottom-right",
  });
};

