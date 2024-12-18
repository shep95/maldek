interface MessageTimestampProps {
  timestamp: string;
}

export const MessageTimestamp = ({ timestamp }: MessageTimestampProps) => {
  return (
    <span className="text-[10px] sm:text-xs opacity-70 mt-1 block">
      {new Date(timestamp).toLocaleTimeString()}
    </span>
  );
};