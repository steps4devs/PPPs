import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { StudentList } from '../tutor/StudentList';
import { StudentDetail } from '../tutor/StudentDetail';
import { EvaluationManagement } from '../tutor/EvaluationManagement';
import { getTutorDashboardStats, getTutorRecentActivities } from '../../services/tutorService';
import { TutorDashboardStats, RecentActivity } from '../../types/tutor';

interface TutorDashboardProps {
  currentView: string;
  onViewChange?: (view: string) => void;
}

export function TutorDashboard({ currentView, onViewChange }: TutorDashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [preselectedStudentForEvaluation, setPreselectedStudentForEvaluation] = useState<number | undefined>(undefined);
  const [evaluationToEdit, setEvaluationToEdit] = useState<any>(undefined);
  const [stats, setStats] = useState<TutorDashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData] = await Promise.all([
        getTutorDashboardStats(),
        getTutorRecentActivities(3)
      ]);
      setStats(statsData);
      setRecentActivities(activitiesData);
    } catch (error) {
      console.error('Error loading tutor dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`;
    }
    
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'EVIDENCE':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'TIME_ENTRY':
        return { bg: 'bg-emerald-100', text: 'text-emerald-800' };
      case 'PLAN':
        return { bg: 'bg-purple-100', text: 'text-purple-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  if (currentView === 'students') {
    if (selectedStudent) {
      return (
        <StudentDetail 
          studentId={selectedStudent} 
          onBack={() => setSelectedStudent(null)}
          onNavigateToEvaluations={(studentId, evaluation) => {
            setPreselectedStudentForEvaluation(studentId);
            setEvaluationToEdit(evaluation);
            onViewChange?.('evaluations');
          }}
        />
      );
    }
    return <StudentList onSelectStudent={setSelectedStudent} />;
  }

  if (currentView === 'evaluations') {
    return <EvaluationManagement preselectedStudentId={preselectedStudentForEvaluation} evaluationToEdit={evaluationToEdit} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
      </div>
    );
  }

  const dashboardStats = [
    { 
      label: 'Estudiantes Asignados', 
      value: stats?.assignedStudents.total.toString() || '0', 
      icon: Users, 
      color: 'text-blue-800', 
      bgColor: 'bg-blue-50' 
    },
    { 
      label: 'Planes Aprobados', 
      value: stats?.plans.approved.toString() || '0', 
      icon: CheckCircle, 
      color: 'text-emerald-600', 
      bgColor: 'bg-emerald-50' 
    },
    { 
      label: 'Horas Pendientes', 
      value: stats?.hours.pendingApproval.toString() || '0', 
      icon: Clock, 
      color: 'text-amber-600', 
      bgColor: 'bg-amber-50' 
    },
    { 
      label: 'Evaluaciones Pendientes', 
      value: stats?.evaluations.pending.toString() || '0', 
      icon: AlertCircle, 
      color: 'text-red-600', 
      bgColor: 'bg-red-50' 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">Panel de Tutor</h1>
        <p className="text-gray-600">Gestiona y supervisa a tus estudiantes de prácticas</p>
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
            <CardTitle>Acciones Pendientes</CardTitle>
            <CardDescription>Tareas que requieren tu atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-amber-900 mb-1">{stats?.plans.pending || 0} planes por revisar</p>
                  <p className="text-sm text-amber-800">Estudiantes esperando aprobación de planes</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-blue-900 mb-1">{stats?.hours.pendingApproval || 0} registros de horas</p>
                  <p className="text-sm text-blue-800">Pendientes de validación esta semana</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-900 mb-1">{stats?.evaluations.pending || 0} evaluaciones pendientes</p>
                  <p className="text-sm text-red-800">Evaluaciones parciales por completar</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estudiantes Recientes</CardTitle>
            <CardDescription>Últimas actividades de tus estudiantes</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No hay actividades recientes</p>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const colors = getActivityColor(activity.activityType);
                  const initials = getInitials(activity.studentName);
                  const isLast = index === recentActivities.length - 1;
                  
                  return (
                    <div key={index} className={`flex items-center gap-3 ${!isLast ? 'pb-3 border-b' : ''}`}>
                      <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}>
                        <span className={colors.text}>{initials}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{activity.studentName}</p>
                        <p className="text-sm text-gray-600">{activity.activityDescription}</p>
                      </div>
                      <span className="text-xs text-gray-500">{getRelativeTime(activity.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
