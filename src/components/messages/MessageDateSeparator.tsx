import { format, isToday, isYesterday } from "date-fns";

interface MessageDateSeparatorProps {
  date: string;
}

export const MessageDateSeparator = ({ date }: MessageDateSeparatorProps) => {
  const messageDate = new Date(date);
  
  let displayDate = format(messageDate, 'MMMM d, yyyy');
  if (isToday(messageDate)) {
    displayDate = 'Today';
  } else if (isYesterday(messageDate)) {
    displayDate = 'Yesterday';
  }

  return (
    <div className="flex items-center my-4">
      <div className="flex-1 border-t border-border"></div>
      <span className="px-4 text-xs text-muted-foreground">{displayDate}</span>
      <div className="flex-1 border-t border-border"></div>
    </div>
  );
};