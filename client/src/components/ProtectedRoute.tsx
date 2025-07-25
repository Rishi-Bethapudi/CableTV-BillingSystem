import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../redux/store';
import { useEffect, useState } from 'react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const location = useLocation();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Allow time for redux-persist to rehydrate
    const timeout = setTimeout(() => {
      setHydrated(true);
    }, 100); // 100ms delay is enough in most cases

    return () => clearTimeout(timeout);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Loading...&&
      </div>
    );
  }

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
