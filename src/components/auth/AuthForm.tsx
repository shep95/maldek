import { useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedText } from "@/hooks/useTranslatedText";

export const AuthForm = () => {
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_in");
  const signInText = useTranslatedText("Sign in");
  const signUpText = useTranslatedText("Sign up");
  const welcomeText = useTranslatedText("Welcome back");
  const createAccountText = useTranslatedText("Create your account");

  return (
    <div className="w-full max-w-md space-y-8 px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold">
          {view === "sign_in" ? welcomeText : createAccountText}
        </h2>
      </div>
      <Auth
        supabaseClient={supabase}
        view={view}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "#F97316",
                brandAccent: "#EA580C",
              },
            },
          },
        }}
        localization={{
          variables: {
            sign_in: {
              email_label: useTranslatedText("Email"),
              password_label: useTranslatedText("Password"),
              button_label: signInText,
            },
            sign_up: {
              email_label: useTranslatedText("Email"),
              password_label: useTranslatedText("Password"),
              button_label: signUpText,
            },
          },
        }}
      />
      <div className="text-center">
        <button
          onClick={() => setView(view === "sign_in" ? "sign_up" : "sign_in")}
          className="text-accent hover:underline"
        >
          {view === "sign_in"
            ? useTranslatedText("Need an account? Sign up")
            : useTranslatedText("Already have an account? Sign in")}
        </button>
      </div>
    </div>
  );
};