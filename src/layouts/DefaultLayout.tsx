
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';

const DefaultLayout = () => {
  const { session, loading } = useAuth();

  // Show nothing while checking auth
  if (loading) {
    return null;
  }

  // Redirect to auth if not logged in
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default DefaultLayout;
