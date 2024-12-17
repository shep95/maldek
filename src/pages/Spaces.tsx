import { useSession } from '@supabase/auth-helpers-react';

const Spaces = () => {
  const session = useSession();

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="flex justify-center">
        <main className="w-full max-w-3xl px-4 py-6 md:py-8">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Spaces</h1>
          <p className="text-muted-foreground">Coming soon! Join community spaces and connect with like-minded people.</p>
        </main>
      </div>
    </div>
  );
};

export default Spaces;