// src/components/ProtectedRoute.tsx
import { useAuth } from './layouts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading spinner or a blank page while checking auth state
    return (
      <div className="flex h-screen w-full items-center justify-center">
        {/* You can add a nice spinner component here */}
        Loading...
      </div>
    );
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back there after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
