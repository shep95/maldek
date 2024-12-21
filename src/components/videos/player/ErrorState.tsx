interface ErrorStateProps {
  error: string | null;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  if (!error) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-center p-4">
      <p>{error}</p>
    </div>
  );
};