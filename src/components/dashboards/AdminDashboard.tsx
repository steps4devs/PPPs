import { Card, CardContent } from '../ui/card';
import { Users, Building2, Calendar, TrendingUp } from 'lucide-react';
import { StudentManagement } from '../admin/StudentManagement';
import { TutorManagement } from '../admin/TutorManagement';
import { CompanyManagement } from '../admin/CompanyManagement';
import { PeriodManagement } from '../admin/PeriodManagement';
import { Reports } from '../admin/Reports';

interface AdminDashboardProps {
  currentView: string;
}

export function AdminDashboard({ currentView }: AdminDashboardProps) {
  const stats = [
    { label: 'Estudiantes Activos', value: '124', icon: Users, color: 'text-blue-800', bgColor: 'bg-blue-50' },
    { label: 'Empresas', value: '45', icon: Building2, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { label: 'Periodos Activos', value: '2', icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Tasa de Aprobación', value: '87%', icon: TrendingUp, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  ];

  if (currentView === 'students') {
    return <StudentManagement />;
  }

  if (currentView === 'tutors') {
    return <TutorManagement />;
  }

  if (currentView === 'companies') {
    return <CompanyManagement />;
  }

  if (currentView === 'periods') {
    return <PeriodManagement />;
  }

  if (currentView === 'reports') {
    return <Reports />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">Panel de Administración</h1>
        <p className="text-gray-600">Gestión general del sistema de prácticas profesionales</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className={`${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Reports />
    </div>
  );
}
