interface LoadingStateProps {
  isLoading: boolean;
}

export const LoadingState = ({ isLoading }: LoadingStateProps) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
    </div>
  );
};