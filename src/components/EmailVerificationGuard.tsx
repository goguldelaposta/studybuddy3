import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface EmailVerificationGuardProps {
  children: ReactNode;
}

export const EmailVerificationGuard = ({ children }: EmailVerificationGuardProps) => {
  const { user, loading } = useAuth();

  // Still loading, don't render anything yet
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Se încarcă...</div>
      </div>
    );
  }

  // Not logged in - let the page handle its own auth redirect
  if (!user) {
    return <>{children}</>;
  }

  // Logged in but email not verified - redirect to verify page
  if (!user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />;
  }

  // Email verified - render children
  return <>{children}</>;
};
