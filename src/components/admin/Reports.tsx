import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AdminDashboardStats } from '../../types';
import adminService from '../../services/admin.service';

interface ReportsProps {
  stats?: AdminDashboardStats | null;
}

export function Reports({ stats }: ReportsProps) {
  const [planesData, setPlanesData] = useState<any[]>([]);
  const [horasData, setHorasData] = useState<any[]>([]);
  const [empresasData, setEmpresasData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const [planes, horas, empresas] = await Promise.all([
        adminService.getPlansByMonth(6),
        adminService.getHoursByWeek(6),
        adminService.getStudentsByCompany()
      ]);
      
      setPlanesData(planes || []);
      setHorasData(horas || []);
      setEmpresasData(empresas || []);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">Reportes y Estadísticas</h1>
        <p className="text-gray-600">Análisis del desempeño del sistema de prácticas</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Planes por Mes</CardTitle>
                <CardDescription>Distribución de planes según su estado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={planesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="aprobados" fill="#059669" name="Aprobados" />
                    <Bar dataKey="pendientes" fill="#f59e0b" name="Pendientes" />
                    <Bar dataKey="rechazados" fill="#dc2626" name="Rechazados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horas Registradas vs Aprobadas</CardTitle>
                <CardDescription>Progreso semanal de validación de horas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={horasData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semana" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="registradas" stroke="#1e40af" strokeWidth={2} name="Registradas" />
                    <Line type="monotone" dataKey="aprobadas" stroke="#059669" strokeWidth={2} name="Aprobadas" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Distribución por Empresa</CardTitle>
                <CardDescription>Número de estudiantes por empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={empresasData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="empresa" type="category" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="estudiantes" fill="#1e40af" name="Estudiantes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Tasa de Aprobación</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {stats?.plans.total ? Math.round((stats.plans.approved / stats.plans.total) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">De planes enviados</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Promedio de Horas</p>
                  <p className="text-3xl font-bold text-blue-800">
                    {stats?.hours.totalApproved && stats?.overview.students 
                      ? Math.round(stats.hours.totalApproved / stats.overview.students) 
                      : 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Por estudiante</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Evidencias Subidas</p>
                  <p className="text-3xl font-bold text-purple-600">-</p>
                  <p className="text-xs text-gray-500 mt-1">Total este periodo</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Nota Promedio</p>
                  <p className="text-3xl font-bold text-amber-600">-</p>
                  <p className="text-xs text-gray-500 mt-1">Evaluaciones</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

