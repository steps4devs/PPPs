import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Reports() {
  const planesData = [
    { mes: 'Mar', aprobados: 35, rechazados: 5, pendientes: 8 },
    { mes: 'Abr', aprobados: 42, rechazados: 3, pendientes: 12 },
    { mes: 'May', aprobados: 38, rechazados: 7, pendientes: 6 },
    { mes: 'Jun', aprobados: 45, rechazados: 4, pendientes: 10 },
    { mes: 'Jul', aprobados: 40, rechazados: 6, pendientes: 9 },
    { mes: 'Ago', aprobados: 48, rechazados: 2, pendientes: 15 },
  ];

  const horasData = [
    { semana: 'S1', registradas: 580, aprobadas: 520 },
    { semana: 'S2', registradas: 640, aprobadas: 590 },
    { semana: 'S3', registradas: 720, aprobadas: 680 },
    { semana: 'S4', registradas: 680, aprobadas: 650 },
    { semana: 'S5', registradas: 750, aprobadas: 720 },
    { semana: 'S6', registradas: 820, aprobadas: 780 },
  ];

  const empresasData = [
    { empresa: 'Tech Solutions', estudiantes: 24 },
    { empresa: 'Digital Marketing', estudiantes: 18 },
    { empresa: 'Innovatech', estudiantes: 15 },
    { empresa: 'Global Systems', estudiantes: 22 },
    { empresa: 'Cloud Services', estudiantes: 12 },
    { empresa: 'Data Analytics', estudiantes: 19 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">Reportes y Estadísticas</h1>
        <p className="text-gray-600">Análisis del desempeño del sistema de prácticas</p>
      </div>

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
              <p className="text-3xl text-emerald-600">87%</p>
              <p className="text-xs text-gray-500 mt-1">De planes enviados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Promedio de Horas</p>
              <p className="text-3xl text-blue-800">145</p>
              <p className="text-xs text-gray-500 mt-1">Por estudiante</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Evidencias Subidas</p>
              <p className="text-3xl text-purple-600">892</p>
              <p className="text-xs text-gray-500 mt-1">Total este periodo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Nota Promedio</p>
              <p className="text-3xl text-amber-600">17.8</p>
              <p className="text-xs text-gray-500 mt-1">Evaluaciones</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
