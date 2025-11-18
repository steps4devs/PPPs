import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Users, Building2, Calendar, TrendingUp, FileText, CheckCircle, Clock, Briefcase } from 'lucide-react';
import { StudentManagement } from '../admin/StudentManagement';
import { TutorManagement } from '../admin/TutorManagement';
import { CompanyManagement } from '../admin/CompanyManagement';
import { PeriodManagement } from '../admin/PeriodManagement';
import { Reports } from '../admin/Reports';
import adminService from '../../services/admin.service';
import type { AdminDashboardStats } from '../../types';

interface AdminDashboardProps {
  currentView: string;
}

export function AdminDashboard({ currentView }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentView === 'dashboard') {
      loadStats();
    }
  }, [currentView]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">Panel de Administración</h1>
        <p className="text-gray-600">Gestión general del sistema de prácticas profesionales</p>
      </div>

      {stats?.currentPeriod && (
        <Card className="border-l-4 border-l-blue-800 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Período Actual</p>
                <p className="text-xl font-bold text-blue-900">{stats.currentPeriod.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(stats.currentPeriod.startDate).toLocaleDateString('es-ES')} - {new Date(stats.currentPeriod.endDate).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Cupo</p>
                <p className="text-2xl font-bold text-blue-800">{stats.currentPeriod.quota}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats && [
          { label: 'Estudiantes Activos', value: stats.overview.students.toString(), icon: Users, color: 'text-blue-800', bgColor: 'bg-blue-50' },
          { label: 'Tutores', value: stats.overview.tutors.toString(), icon: Users, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
          { label: 'Empresas', value: stats.overview.companies.toString(), icon: Building2, color: 'text-purple-600', bgColor: 'bg-purple-50' },
          { label: 'Períodos', value: stats.overview.periods.toString(), icon: Calendar, color: 'text-amber-600', bgColor: 'bg-amber-50' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
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

      <Reports stats={stats} />
    </div>
  );
}
