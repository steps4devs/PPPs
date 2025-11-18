import { ReactNode, useState } from 'react';
import { Button } from './ui/button';
import { 
  Home, 
  FileText, 
  Clock, 
  FolderOpen, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Building2,
  Calendar,
  PieChart
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
  userRole: 'student' | 'tutor' | 'admin';
  userName: string;
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Layout({ children, userRole, userName, currentView, onViewChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getNavItems = () => {
    switch (userRole) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Inicio', icon: Home },
          { id: 'plan', label: 'Mi Plan', icon: FileText },
          { id: 'hours', label: 'Bitácora de Horas', icon: Clock },
          { id: 'evidence', label: 'Evidencias', icon: FolderOpen },
          { id: 'evaluation', label: 'Evaluaciones', icon: BarChart3 },
        ];
      case 'tutor':
        return [
          { id: 'dashboard', label: 'Inicio', icon: Home },
          { id: 'students', label: 'Mis Estudiantes', icon: Users },
          { id: 'evaluations', label: 'Evaluaciones', icon: BarChart3 },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Inicio', icon: Home },
          { id: 'students', label: 'Estudiantes', icon: Users },
          { id: 'tutors', label: 'Tutores', icon: Users },
          { id: 'companies', label: 'Empresas', icon: Building2 },
          { id: 'periods', label: 'Periodos', icon: Calendar },
          { id: 'reports', label: 'Reportes', icon: PieChart },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const userInitials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  const roleLabels = {
    student: 'Estudiante',
    tutor: 'Tutor',
    admin: 'Administrador'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <h1 className="text-blue-800">Sistema de Prácticas</h1>
        <div className="w-10"></div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 
        transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-blue-800 mb-1">Prácticas Profesionales</h1>
          <p className="text-sm text-gray-600">Universidad Nacional</p>
        </div>

        <nav className="p-4 flex-1">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${currentView === item.id 
                      ? 'bg-blue-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar>
              <AvatarFallback className="bg-emerald-600 text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{userName}</p>
              <p className="text-xs text-gray-500">{roleLabels[userRole]}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
