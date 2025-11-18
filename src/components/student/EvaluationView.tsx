import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { AlertCircle, Award, Loader2, TrendingUp } from 'lucide-react';
import { getMyEvaluations } from '../../services/studentService';
import { Evaluation } from '../../types/student';
import { toast } from 'sonner';

export function EvaluationView() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [totalEvaluations, setTotalEvaluations] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const data = await getMyEvaluations();
      setEvaluations(data.data);
      setAverageScore(data.averageScore);
      setTotalEvaluations(data.totalEvaluations);
    } catch (error) {
      toast.error('Error al cargar evaluaciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 16) return 'text-emerald-600';
    if (score >= 13) return 'text-blue-600';
    if (score >= 11) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getApprovalStatus = () => {
    if (averageScore >= 11) {
      return <Badge className="bg-emerald-600 hover:bg-emerald-700">Aprobado</Badge>;
    }
    return <Badge className="bg-red-600 hover:bg-red-700">Desaprobado</Badge>;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 16) return <Badge className="bg-emerald-100 text-emerald-800">Excelente</Badge>;
    if (score >= 13) return <Badge className="bg-blue-100 text-blue-800">Bueno</Badge>;
    if (score >= 11) return <Badge className="bg-yellow-100 text-yellow-800">Regular</Badge>;
    return <Badge className="bg-red-100 text-red-800">Deficiente</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-1">Evaluaciones</h1>
        <p className="text-gray-600">Visualiza tus resultados y retroalimentación</p>
      </div>

      {evaluations.length === 0 ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 mb-1">Sin evaluaciones</p>
                <p className="text-sm text-blue-800">
                  Aún no tienes evaluaciones registradas. Tu tutor agregará evaluaciones conforme avances en tus prácticas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Promedio General</p>
                    <p className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
                      {averageScore.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-500">/ 20</p>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Evaluaciones</p>
                    <p className="text-3xl font-bold text-blue-800">{totalEvaluations}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-800" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Estado</p>
                    {getApprovalStatus()}
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        Evaluación {evaluation.type === 'PARTIAL' ? 'Parcial' : 'Final'} #{evaluation.id}
                      </CardTitle>
                      <CardDescription>
                        Realizada el {new Date(evaluation.evaluatedAt).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} por {evaluation.tutor?.name || 'Roberto'}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Nota Final</p>
                      <p className={`text-3xl font-bold ${getScoreColor(evaluation.average)}`}>
                        {evaluation.average.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-500">/ 20</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-4">Criterios de Evaluación</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Puntualidad</span>
                          <span className="text-sm font-semibold text-gray-900">{evaluation.punctuality}/20</span>
                        </div>
                        <Progress value={(evaluation.punctuality / 20) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Trabajo en equipo</span>
                          <span className="text-sm font-semibold text-gray-900">{evaluation.teamwork}/20</span>
                        </div>
                        <Progress value={(evaluation.teamwork / 20) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Conocimientos técnicos</span>
                          <span className="text-sm font-semibold text-gray-900">{evaluation.technicalKnowledge}/20</span>
                        </div>
                        <Progress value={(evaluation.technicalKnowledge / 20) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Iniciativa</span>
                          <span className="text-sm font-semibold text-gray-900">{evaluation.initiative}/20</span>
                        </div>
                        <Progress value={(evaluation.initiative / 20) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {evaluation.comments && (
                    <div className="border-t pt-4">
                      <h3 className="text-gray-900 font-semibold mb-2">Comentarios del Tutor</h3>
                      <p className="text-gray-700">{evaluation.comments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
