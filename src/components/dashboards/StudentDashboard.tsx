import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  FileText, 
  Clock, 
  FolderOpen, 
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  UserCheck,
  Mail,
  Calendar
} from 'lucide-react';
import { PlanList } from '../student/PlanList';
import { TimeLogTable } from '../student/TimeLogTable';
import { EvidenceList } from '../student/EvidenceList';
import { EvaluationView } from '../student/EvaluationView';
import { getDashboardStats, getMyPlans, getMyTutor } from '../../services/studentService';
import { StudentDashboardStats, Plan, StudentAssignment } from '../../types/student';

interface StudentDashboardProps {
  currentView: string;
  onNavigate?: (view: string) => void;
}

export function StudentDashboard({ currentView, onNavigate }: StudentDashboardProps) {
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const statsData = await getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  if (currentView === 'plan') {
    return <PlanList />;
  }

  if (currentView === 'hours') {
    return <TimeLogTable onUpdate={loadData} />;
  }

  if (currentView === 'evidence') {
    return <EvidenceList />;
  }

  if (currentView === 'evaluation') {
    return <EvaluationView />;
  }

  // DASHBOARD HOME
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
      </div>
    );
  }

    const dashboardStats = [
    { 
      label: 'Estado del Plan', 
      value: stats?.plans.status === 'APPROVED' ? 'Aprobado' : 
             stats?.plans.status === 'IN_REVIEW' ? 'En revisión' :
             stats?.plans.status === 'REJECTED' ? 'Rechazado' : 
             stats?.plans.status === 'DRAFT' ? 'Borrador' : 'Sin plan',
      icon: FileText, 
      color: stats?.plans.status === 'APPROVED' ? 'text-emerald-600' : 
             stats?.plans.status === 'IN_REVIEW' ? 'text-amber-600' :
             stats?.plans.status === 'REJECTED' ? 'text-red-600' :
             stats?.plans.status === 'DRAFT' ? 'text-gray-600' :
             'text-gray-600',
      bgColor: stats?.plans.status === 'APPROVED' ? 'bg-emerald-50' : 
               stats?.plans.status === 'IN_REVIEW' ? 'bg-amber-50' :
               stats?.plans.status === 'REJECTED' ? 'bg-red-50' :
               stats?.plans.status === 'DRAFT' ? 'bg-gray-50' :
               'bg-gray-50'
    },
    { 
      label: 'Horas Registradas', 
      value: `${stats?.hours.total || 0} / ${stats?.hours.required || 300}`, 
      icon: Clock, 
      color: 'text-blue-800',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Evidencias', 
      value: `${stats?.evidences.total || 0} archivos`, 
      icon: FolderOpen, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      label: 'Promedio', 
      value: stats?.evaluations.averageScore ? stats.evaluations.averageScore.toFixed(1) : '-', 
      icon: BarChart3, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">Panel de Estudiante</h1>
        <p className="text-gray-600">Bienvenido a tu panel de gestión de prácticas profesionales</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => {
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

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Actividades</CardTitle>
            <CardDescription>Tareas pendientes y fechas importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!stats?.plans.status || stats.plans.status === 'DRAFT' ? (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-900 mb-1">Registra tu plan de prácticas</p>
                    <p className="text-sm text-amber-800">Necesitas completar tu plan antes de registrar horas</p>
                  </div>
                </div>
              ) : stats.plans.status === 'IN_REVIEW' ? (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-900 mb-1">Plan en revisión</p>
                    <p className="text-sm text-blue-800">Tu tutor está revisando tu plan de prácticas</p>
                  </div>
                </div>
              ) : stats.plans.status === 'REJECTED' ? (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-900 mb-1">Plan rechazado</p>
                    <p className="text-sm text-red-800">Revisa los comentarios y corrige tu plan</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-gray-900 mb-1">Registrar horas semanales</p>
                      <p className="text-sm text-gray-600">Mantén actualizado tu registro de horas</p>
                    </div>
                  </div>
                  {stats && stats.evidences.total < 5 && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-900 mb-1">Subir evidencias</p>
                        <p className="text-sm text-gray-600">Documenta tus actividades con evidencias</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progreso General</CardTitle>
            <CardDescription>Tu avance en las prácticas profesionales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Horas completadas</span>
                  <span className="text-sm text-gray-900">{stats?.hours.percentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-800 h-2 rounded-full" 
                    style={{ width: `${Math.min(stats?.hours.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Evidencias subidas</span>
                  <span className="text-sm text-gray-900">{stats?.evidences.total || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((stats?.evidences.total || 0) * 10, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Evaluaciones</span>
                  <span className="text-sm text-gray-900">{stats?.evaluations.averageScore ? `${Math.round((stats.evaluations.averageScore / 20) * 100)}%` : '0%'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${stats?.evaluations.averageScore ? Math.min((stats.evaluations.averageScore / 20) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.hasAssignedTutor && stats.tutor && stats.period && stats.plans.status !== 'DRAFT' && (
        <Card>
          <CardHeader>
            <CardTitle>Mi Tutor Asignado</CardTitle>
            <CardDescription>Información de tu tutor académico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
                  <UserCheck className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tutor Académico</p>
                  <p className="text-gray-900">{stats.tutor.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg flex-shrink-0">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Correo Electrónico</p>
                  <p className="text-gray-900 text-sm">{stats.tutor.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-50 p-2 rounded-lg flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Período Académico</p>
                  <p className="text-gray-900">{stats.period.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-amber-50 p-2 rounded-lg flex-shrink-0">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Fecha de Asignación</p>
                  <p className="text-gray-900">
                    {stats.assignedAt ? new Date(stats.assignedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
