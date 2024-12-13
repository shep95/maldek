interface AuthHeaderProps {
  isLogin: boolean;
}

export const AuthHeader = ({ isLogin }: AuthHeaderProps) => {
  return (
    <div className="text-center px-4 py-6 md:py-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-accent animate-fade-in">Maldek</h2>
      <p className="mt-2 text-sm text-muted-foreground">Next generation of social media</p>
      <h3 className="text-xl md:text-3xl mt-6 md:mt-8">{isLogin ? "Welcome back" : "Create account"}</h3>
      <p className="text-muted-foreground mt-2 text-sm md:text-base">
        {isLogin ? "Enter your credentials to continue" : "Fill in your details to get started"}
      </p>
    </div>
  );
};