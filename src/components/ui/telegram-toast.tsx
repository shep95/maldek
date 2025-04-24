
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TelegramToastProps {
  title: string;
  message: string;
  avatar?: string;
}

export const showTelegramToast = ({ title, message, avatar }: TelegramToastProps) => {
  toast.custom((t) => (
    <div className={`
      animate-telegramPopoutIn
      group
      max-w-md w-full bg-black/40 backdrop-blur-xl
      border border-white/10 shadow-lg
      p-4 rounded-xl
      flex items-start gap-3
      ${t.visible ? 'opacity-100' : 'opacity-0 translate-y-4'}
      transition-all duration-200
    `}>
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={avatar} />
        <AvatarFallback>{title[0]?.toUpperCase() || "?"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white mb-1">{title}</p>
        <p className="text-sm text-white/80 line-clamp-2">{message}</p>
      </div>
    </div>
  ), {
    duration: 4000,
    position: "bottom-right",
  });
};
