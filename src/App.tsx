import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { TutorDashboard } from './components/dashboards/TutorDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './context/AuthContext';
import { UserRole } from './types';

// Componente interno que usa el AuthContext
function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated || !user) {
    return <Login />;
  }

  // Determinar el dashboard según el rol
  const getDashboard = () => {
    const userRole = user.roles?.[0] || '';
    
    if (userRole.includes('STUDENT')) {
      return <StudentDashboard currentView={currentView} onNavigate={setCurrentView} />;
    } else if (userRole.includes('TUTOR')) {
      return <TutorDashboard currentView={currentView} />;
    } else if (userRole.includes('ADMIN')) {
      return <AdminDashboard currentView={currentView} />;
    }
    
    return <div>Rol no reconocido</div>;
  };

  // Construir nombre completo y determinar rol
  const fullName = `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.username;
  const userRole = user.roles?.[0] || '';
  const roleType = userRole.includes('STUDENT') ? 'student' : 
                   userRole.includes('TUTOR') ? 'tutor' : 'admin';

  return (
    <Layout
      userRole={roleType}
      userName={fullName}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      {getDashboard()}
    </Layout>
  );
}

// Componente principal con Provider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}
