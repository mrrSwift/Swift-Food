// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useStore } from './store/useStore';

// Pages
import LoginPage from './pages/LoginPage';
import CustomerMenuPage from './pages/CustomerMenuPage';
import DashboardPage from './pages/owner/DashboardPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore(state => state.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CustomerMenuPage />} />
        <Route path="/restaurant/:restaurantId" element={<CustomerMenuPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Owner Routes */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}