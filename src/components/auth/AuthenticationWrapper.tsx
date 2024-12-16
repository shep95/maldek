import { ReactNode } from 'react';

interface AuthenticationWrapperProps {
  children: ReactNode;
}

export const AuthenticationWrapper = ({ children }: AuthenticationWrapperProps) => {
  console.log("AuthenticationWrapper rendered");
  return children;
};